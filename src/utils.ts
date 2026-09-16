// 🎯 1. CONFIGS สำหรับ STATUS และ CATEGORY
export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ordering: { label: 'รอตรวจรับ', color: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-300' },
  'รอตรวจรับ': { label: 'รอตรวจรับ', color: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-300' },
  partial: { label: 'ตรวจรับบางส่วน', color: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-300' },
  'ตรวจรับบางส่วน': { label: 'ตรวจรับบางส่วน', color: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-300' },
  inspected: { label: 'ตรวจรับแล้ว (อยู่ในขั้นตอนตั้งเบิก)', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  completed: { label: 'ตรวจรับแล้ว (อยู่ในขั้นตอนตั้งเบิก)', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  'ตรวจรับแล้ว (อยู่ในขั้นตอนตั้งเบิก)': { label: 'ตรวจรับแล้ว (อยู่ในขั้นตอนตั้งเบิก)', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  cancelled: { label: 'ยกเลิกรายการ', color: 'text-slate-700', bg: 'bg-slate-200', border: 'border-slate-300' },
  'ยกเลิกรายการ': { label: 'ยกเลิกรายการ', color: 'text-slate-700', bg: 'bg-slate-200', border: 'border-slate-300' },
};

export const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  material: { label: 'วัสดุสิ้นเปลือง', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  durable: { label: 'ครุภัณฑ์', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  service: { label: 'จ้างเหมาบริการ', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  other: { label: 'อื่นๆ', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
};

// 🎯 2. FORMATTERS
export const formatCurrency = (amount: number | string | undefined | null): string => {
  const num = Number(amount || 0);
  return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatBaht = (amount: number | string | undefined | null): string => {
  return formatCurrency(amount);
};

export const formatDateTH = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatThaiDate = (dateString: string | null | undefined): string => {
  return formatDateTH(dateString);
};

export const formatFileSize = (bytes: number | undefined | null): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 🎯 3. RECEIVING PROGRESS & STATS
export const getItemReceivedStats = (item: any) => {
  const quantity = Number(item?.quantity || 0);
  const receivedQuantity = Number(item?.receivedQuantity ?? item?.received_quantity ?? 0);
  const remainingQuantity = Math.max(0, quantity - receivedQuantity);
  const percent = quantity > 0 ? Math.min(100, Math.round((receivedQuantity / quantity) * 100)) : 0;

  return {
    quantity,
    receivedQuantity,
    remainingQuantity,
    percent,
    isCompleted: quantity > 0 && receivedQuantity >= quantity,
  };
};

export const getOverallReceivingProgress = (items: any[] = []) => {
  if (!items || items.length === 0) return { totalItems: 0, completedItems: 0, overallPercent: 0 };

  let totalQty = 0;
  let totalReceived = 0;
  let completedItems = 0;

  items.forEach((item) => {
    const stats = getItemReceivedStats(item);
    totalQty += stats.quantity;
    totalReceived += stats.receivedQuantity;
    if (stats.isCompleted) completedItems += 1;
  });

  const overallPercent = totalQty > 0 ? Math.min(100, Math.round((totalReceived / totalQty) * 100)) : 0;

  return {
    totalItems: items.length,
    completedItems,
    overallPercent,
    totalQty,
    totalReceived,
  };
};

// 🎯 4. CALCULATIONS & SUMMARY
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

export const getCategoryLabel = (category: string) => {
  return CATEGORY_CONFIG[category]?.label || category || 'อื่นๆ';
};

export const getStatusLabel = (status: string) => {
  return STATUS_CONFIG[status]?.label || 'รอตรวจรับ';
};

export const getStatusBadgeClass = (status: string) => {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG['ordering'];
  return `${conf.bg} ${conf.color} ${conf.border}`;
};
