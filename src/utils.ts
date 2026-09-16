// 🎯 ฟังก์ชันคำนวณสรุปภาพรวมประจำปีงบประมาณ
export const calculateYearSummary = (records: any[], currentFiscalYear: number | string) => {
  // 1. กรองรายการตามปีงบประมาณ (ถ้าระบุ 'all' จะดึงข้อมูลทุกรายการ)
  const filteredRecords = records.filter((rec) => {
    if (currentFiscalYear === 'all' || !currentFiscalYear) return true;
    return Number(rec.fiscalYear) === Number(currentFiscalYear);
  });

  // 2. คำนวณผลรวมต่างๆ
  const totalSubtotal = filteredRecords.reduce((sum, rec) => {
    const sub = Number(rec.subtotalAmount ?? rec.subtotal_amount ?? 0);
    // ถ้าไม่มี subtotal ให้คำนวณถอยหลังจาก amount - vatAmount
    if (sub > 0) return sum + sub;
    const total = Number(rec.amount ?? rec.totalAmount ?? rec.total_amount ?? 0);
    const vat = Number(rec.vatAmount ?? rec.vat_amount ?? 0);
    return sum + (total - vat);
  }, 0);

  const totalVat = filteredRecords.reduce((sum, rec) => {
    return sum + Number(rec.vatAmount ?? rec.vat_amount ?? 0);
  }, 0);

  const totalAmount = filteredRecords.reduce((sum, rec) => {
    return sum + Number(rec.amount ?? rec.totalAmount ?? rec.total_amount ?? 0);
  }, 0);

  return {
    subtotal: totalSubtotal,
    vat: totalVat,
    total: totalAmount,
    count: filteredRecords.length,
  };
};

// 🎯 ฟังก์ชันช่วยคำนวณสถานะวันกำหนดส่งมอบ
export const getDueDateStatus = (deliveryDueDate: string | null, status: string) => {
  if (!deliveryDueDate || status === 'inspected' || status === 'completed' || status === 'ตรวจรับแล้ว (อยู่ในขั้นตอนตั้งเบิก)') {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(deliveryDueDate);
  due.setHours(0, 0, 0, 0);

  if (isNaN(due.getTime())) return null;

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { type: 'overdue', days: Math.abs(diffDays), label: `เกินกำหนด ${Math.abs(diffDays)} วัน` };
  } else if (diffDays <= 7) {
    return { type: 'near', days: diffDays, label: `เหลือเวลาอีก ${diffDays} วัน` };
  }

  return null;
};
