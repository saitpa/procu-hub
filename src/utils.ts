// 🎯 ฟังก์ชันแปลงตัวเลขเป็นรูปแบบเงินบาท
export const formatCurrency = (amount: number | string | undefined | null): string => {
  const num = Number(amount || 0);
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// 🎯 ฟังก์ชันคำนวณสรุปภาพรวมประจำปีงบประมาณ
export const calculateYearSummary = (records: any[], currentFiscalYear: number | string) => {
  const filteredRecords = (records || []).filter((rec) => {
    if (currentFiscalYear === 'all' || !currentFiscalYear) return true;
    return Number(rec.fiscalYear) === Number(currentFiscalYear);
  });

  const totalSubtotal = filteredRecords.reduce((sum, rec) => {
    const sub = Number(rec.subtotalAmount ?? rec.subtotal_amount ?? 0);
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
    totalRecords: filteredRecords.length,
    totalSubtotalAmount: totalSubtotal,
    totalVatAmount: totalVat,
    totalGrandAmount: totalAmount,
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

// 🎯 ฟังก์ชันเสริมอื่นๆ เพื่อป้องกัน Build Error
export const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'material': return 'วัสดุสิ้นเปลือง';
    case 'durable': return 'ครุภัณฑ์';
    case 'service': return 'จ้างเหมาบริการ';
    default: return category || 'อื่นๆ';
  }
};

export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'inspected':
    case 'completed':
    case 'ตรวจรับแล้ว (อยู่ในขั้นตอนตั้งเบิก)':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'partial':
    case 'ตรวจรับบางส่วน':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-300';
  }
};
