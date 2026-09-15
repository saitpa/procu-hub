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

// 🟢 ฟังก์ชันคำนวณสรุปปีงบประมาณ ปรับปรุงแก้ปัญหายอดเป็น 0
export const calculateYearSummary = (records: any[], targetYear: number | string) => {
  // 🟢 ถ้าเลือก 'all' ให้ดึงรายการทั้งหมด ไม่ต้องกรองปี
  const filtered = targetYear === 'all'
    ? records
    : records.filter((r) => Number(r.fiscalYear) === Number(targetYear));

  return filtered.reduce(
    (acc, rec) => {
      // ดึงค่ายอดเงิน ป้องกัน NaN/null
      const totalAmount = Number(rec.amount || rec.totalAmount || 0);
      const subtotalAmount = Number(rec.subtotalAmount || rec.subtotal_amount || 0);
      const vatAmount = Number(rec.vatAmount || rec.vat_amount || 0);

      // ยอดรวมทั้งหมด
      acc.totalPrCount += 1;
      acc.totalAmount += totalAmount;
      acc.subtotalAmount += subtotalAmount;
      acc.vatAmount += vatAmount;

      // แยกตามสถานะ
      const status = rec.status || 'ordering';
      if (status === 'ordering') {
        acc.orderingCount += 1;
        acc.orderingAmount += totalAmount;
      } else if (status === 'partial') {
        acc.partialCount += 1;
        acc.partialAmount += totalAmount;
      } else if (status === 'inspected' || status === 'completed') {
        acc.inspectedCount += 1;
        acc.inspectedAmount += totalAmount;
      } else if (status === 'pending_delivery') {
        acc.pendingDeliveryCount += 1;
        acc.pendingDeliveryAmount += totalAmount;
      }

      return acc;
    },
    {
      totalPrCount: 0,
      totalAmount: 0,
      subtotalAmount: 0,
      vatAmount: 0,
      orderingCount: 0,
      orderingAmount: 0,
      partialCount: 0,
      partialAmount: 0,
      inspectedCount: 0,
      inspectedAmount: 0,
      pendingDeliveryCount: 0,
      pendingDeliveryAmount: 0,
    }
  );
};

  // 1. กรองรายการตามปีงบประมาณ (รองรับทั้ง fiscalYear และ fiscal_year)
  const yearRecords = records.filter((r) => {
    const status = String(r.status || '').toLowerCase();
    if (status === 'cancelled' || status === 'ยกเลิก') return false;
    
    const recYear = r.fiscalYear ?? r.fiscal_year;
    if (recYear !== undefined && recYear !== null && recYear !== '') {
      return Number(recYear) === Number(fiscalYear);
    }
    return true;
  });

  // ฟังก์ชันช่วยเหลือสำหรับดึงยอดเงินรวม
  const getAmount = (r: any): number => {
    const val = r.amount ?? r.totalAmount ?? r.total ?? r.netAmount ?? 0;
    return isNaN(Number(val)) ? 0 : Number(val);
  };

  // ฟังก์ชันดึงยอดก่อน VAT (รองรับทั้ง subtotalAmount และ subtotal_amount)
  const getSubtotal = (r: any): number => {
    const val = r.subtotalAmount ?? r.subtotal_amount ?? r.subtotalBeforeVat;
    if (val !== undefined && val !== null && !isNaN(Number(val)) && Number(val) > 0) {
      return Number(val);
    }
    const amt = getAmount(r);
    const vat = getVat(r);
    return vat > 0 ? amt - vat : amt / 1.07;
  };

  // ฟังก์ชันดึงยอด VAT (รองรับทั้ง vatAmount และ vat_amount)
  const getVat = (r: any): number => {
    const val = r.vatAmount ?? r.vat_amount;
    if (val !== undefined && val !== null && !isNaN(Number(val)) && Number(val) > 0) {
      return Number(val);
    }
    return getAmount(r) - (getAmount(r) / 1.07);
  };

  const totalAmount = yearRecords.reduce((sum, r) => sum + getAmount(r), 0);
  const totalSubtotalBeforeVat = yearRecords.reduce((sum, r) => sum + getSubtotal(r), 0);
  const totalVatAmount = yearRecords.reduce((sum, r) => sum + getVat(r), 0);
  const totalCount = yearRecords.length;

  // 2. แยกจำแนกตามสถานะ (รองรับภาษาไทยและอังกฤษ)
  const isPending = (st: string) => ['pending_inspection', 'pending', 'รอตรวจรับ'].includes(st);
  const isPartial = (st: string) => ['partial_inspected', 'partial', 'รับแล้วบางส่วน', 'รับแล้วบางส่วน (ทยอยรับ)'].includes(st);
  const isInspected = (st: string) => ['inspected', 'completed', 'นับของแล้ว', 'นับของแล้ว (ครบถ้วน)', 'ตรวจรับแล้ว'].includes(st);
  const isOrdering = (st: string) => ['ordering', 'กำลังรอส่งของ', 'รอส่งของ'].includes(st);

  const pendingList = yearRecords.filter((r) => isPending(String(r.status || '').toLowerCase()));
  const partialList = yearRecords.filter((r) => isPartial(String(r.status || '').toLowerCase()));
  const inspectedList = yearRecords.filter((r) => isInspected(String(r.status || '').toLowerCase()));
  const orderingList = yearRecords.filter((r) => isOrdering(String(r.status || '').toLowerCase()));

  // 3. คำนวณรายการเกินกำหนด / ใกล้ถึงกำหนด
  let overdueCount = 0;
  let nearDueCount = 0;

  yearRecords.forEach((r) => {
    const due = getDueDateStatus(r.deliveryDueDate || r.delivery_due_date, r.status);
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
    pendingInspectionAmount: pendingList.reduce((sum, r) => sum + getAmount(r), 0),
    partialInspectedCount: partialList.length,
    partialInspectedAmount: partialList.reduce((sum, r) => sum + getAmount(r), 0),
    inspectedCount: inspectedList.length,
    inspectedAmount: inspectedList.reduce((sum, r) => sum + getAmount(r), 0),
    orderingCount: orderingList.length,
    orderingAmount: orderingList.reduce((sum, r) => sum + getAmount(r), 0),
    overdueCount,
    nearDueCount,
  };
}
