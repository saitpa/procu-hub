import { RecordCategory, RecordStatus, PurchaseRecord, YearSummary, VatType } from './types';

// 🟢 ปรับปรุง formatBaht ให้ดักจับ NaN/null/undefined ป้องกันปัญหาตัวเลขไม่ขึ้น
export function formatBaht(amount: any): string {
  if (amount === null || amount === undefined || amount === '') return '฿0.00';
  const num = Number(amount);
  if (isNaN(num)) return '฿0.00';
  return `฿${num.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(Number(num))) return '0';
  return new Intl.NumberFormat('th-TH').format(num);
}

export function formatThaiDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543; // Thai Buddhist Era
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Calculate VAT 7%
export function calculateVatBreakdown(itemSum: number, vatType: VatType = 'included') {
  const sum = isNaN(Number(itemSum)) ? 0 : Number(itemSum);
  
  if (vatType === 'exempt') {
    return {
      subtotalBeforeVat: sum,
      vatAmount: 0,
      totalAmount: sum,
    };
  }
  if (vatType === 'excluded') {
    const subtotal = sum;
    const vat = subtotal * 0.07;
    return {
      subtotalBeforeVat: subtotal,
      vatAmount: vat,
      totalAmount: subtotal + vat,
    };
  }
  // Default: 'included'
  const total = sum;
  const subtotal = total / 1.07;
  const vat = total - subtotal;
  return {
    subtotalBeforeVat: subtotal,
    vatAmount: vat,
    totalAmount: total,
  };
}

// Due Date status checking (e.g. within 7 days, overdue, on time)
export function getDueDateStatus(deliveryDueDate?: string, recordStatus?: RecordStatus) {
  if (!deliveryDueDate || recordStatus === 'inspected' || recordStatus === 'cancelled') {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(deliveryDueDate);
  if (isNaN(dueDate.getTime())) return null;
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isOverdue: true,
      isNearDue: false,
      daysDiff: Math.abs(diffDays),
      text: `🚨 เกินกำหนดส่ง ${Math.abs(diffDays)} วัน!`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-bold',
    };
  } else if (diffDays === 0) {
    return {
      isOverdue: false,
      isNearDue: true,
      daysDiff: 0,
      text: `⚠️ ครบกำหนดส่งมอบวันนี้!`,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    };
  } else if (diffDays <= 7) {
    return {
      isOverdue: false,
      isNearDue: true,
      daysDiff: diffDays,
      text: `⏰ ใกล้ครบกำหนดส่ง (อีก ${diffDays} วัน)`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    };
  }

  return {
    isOverdue: false,
    isNearDue: false,
    daysDiff: diffDays,
    text: `กำหนดส่งอีก ${diffDays} วัน`,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
}

export const STATUS_CONFIG: Record<
  RecordStatus,
  { label: string; badge: string; dot: string; iconName: string }
> = {
  pending_inspection: {
    label: 'รอตรวจรับ',
    badge: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
    iconName: 'Clock',
  },
  partial_inspected: {
    label: 'รับแล้วบางส่วน (ทยอยรับ)',
    badge: 'bg-purple-50 text-purple-900 border-purple-300 ring-1 ring-purple-200',
    dot: 'bg-purple-600',
    iconName: 'Layers',
  },
  inspected: {
    label: 'นับของแล้ว (ครบถ้วน)',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    iconName: 'CheckCircle2',
  },
  ordering: {
    label: 'กำลังรอส่งของ',
    badge: 'bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-200',
    dot: 'bg-sky-500',
    iconName: 'Truck',
  },
  cancelled: {
    label: 'ยกเลิก',
    badge: 'bg-slate-100 text-slate-600 border-slate-300',
    dot: 'bg-slate-400',
    iconName: 'XCircle',
  },
};

export const CATEGORY_CONFIG: Record<
  RecordCategory,
  { label: string; badge: string }
> = {
  material: {
    label: 'วัสดุสิ้นเปลือง',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  asset: {
    label: 'ครุภัณฑ์',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  service: {
    label: 'จ้างเหมา/บริการ',
    badge: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  other: {
    label: 'อื่นๆ',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

// Calculate item received quantities across rounds
export function getItemReceivedStats(record: PurchaseRecord, itemId: string) {
  const item = record.items?.find((it) => it.id === itemId);
  if (!item) return { ordered: 0, received: 0, remaining: 0, percentage: 0 };

  const ordered = item.quantity || 0;
  if (!record.receivingRounds || record.receivingRounds.length === 0) {
    if (record.status === 'inspected') {
      return { ordered, received: ordered, remaining: 0, percentage: 100 };
    }
    return { ordered, received: 0, remaining: ordered, percentage: 0 };
  }

  let received = 0;
  record.receivingRounds.forEach((rnd) => {
    const roundItem = rnd.items?.find((it) => it.itemId === itemId);
    if (roundItem) {
      received += Number(roundItem.receivedQuantity) || 0;
    }
  });

  const remaining = Math.max(0, ordered - received);
  const percentage = ordered > 0 ? Math.min(100, Math.round((received / ordered) * 100)) : 0;
  return { ordered, received, remaining, percentage };
}

// Calculate total overall receiving progress for a record
export function getOverallReceivingProgress(record: PurchaseRecord) {
  if (record.status === 'inspected') {
    return { totalOrdered: 100, totalReceived: 100, percentage: 100, isFullyReceived: true };
  }
  if (!record.receivingRounds || record.receivingRounds.length === 0) {
    return { totalOrdered: 100, totalReceived: 0, percentage: 0, isFullyReceived: false };
  }

  let sumOrdered = 0;
  let sumReceived = 0;
  (record.items || []).forEach((it) => {
    const stats = getItemReceivedStats(record, it.id);
    sumOrdered += stats.ordered;
    sumReceived += stats.received;
  });

  const percentage = sumOrdered > 0 ? Math.min(100, Math.round((sumReceived / sumOrdered) * 100)) : 0;
  return {
    totalOrdered: sumOrdered,
    totalReceived: sumReceived,
    percentage,
    isFullyReceived: sumReceived >= sumOrdered && sumOrdered > 0,
  };
}

export function calculateYearSummary(records: PurchaseRecord[], fiscalYear: number): YearSummary {
  const yearRecords = records.filter(
    (r) => r.fiscalYear === fiscalYear && r.status !== 'cancelled'
  );

  const totalAmount = yearRecords.reduce((sum, r) => sum + Number(r.amount || r.totalAmount || 0), 0);
  const totalSubtotalBeforeVat = yearRecords.reduce((sum, r) => sum + Number(r.subtotalBeforeVat || r.subtotalAmount || (Number(r.amount || r.totalAmount || 0) / 1.07)), 0);
  const totalVatAmount = yearRecords.reduce((sum, r) => sum + Number(r.vatAmount || (Number(r.amount || r.totalAmount || 0) - (Number(r.amount || r.totalAmount || 0) / 1.07))), 0);
  const totalCount = yearRecords.length;

  const pendingList = yearRecords.filter((r) => r.status === 'pending_inspection');
  const partialList = yearRecords.filter((r) => r.status === 'partial_inspected');
  const inspectedList = yearRecords.filter((r) => r.status === 'inspected');
  const orderingList = yearRecords.filter((r) => r.status === 'ordering');

  // Count overdue and near due
  let overdueCount = 0;
  let nearDueCount = 0;

  yearRecords.forEach((r) => {
    const due = getDueDateStatus(r.deliveryDueDate, r.status);
    if (due?.isOverdue) overdueCount++;
    if (due?.isNearDue) nearDueCount++;
  });

  return {
    fiscalYear,
    totalAmount,
    totalSubtotalBeforeVat,
    totalVatAmount,
    totalCount,
    pendingInspectionCount: pendingList.length,
    pendingInspectionAmount: pendingList.reduce((sum, r) => sum + Number(r.amount || r.totalAmount || 0), 0),
    partialInspectedCount: partialList.length,
    partialInspectedAmount: partialList.reduce((sum, r) => sum + Number(r.amount || r.totalAmount || 0), 0),
    inspectedCount: inspectedList.length,
    inspectedAmount: inspectedList.reduce((sum, r) => sum + Number(r.amount || r.totalAmount || 0), 0),
    orderingCount: orderingList.length,
    orderingAmount: orderingList.reduce((sum, r) => sum + Number(r.amount || r.totalAmount || 0), 0),
    overdueCount,
    nearDueCount,
  };
}
