// src/utils.ts

export interface StatusConfig {
  label: string;
  bg: string;
  color: string;
  border: string;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  ordering: {
    label: 'รอตรวจรับ',
    bg: 'bg-amber-100',
    color: 'text-amber-800',
    border: 'border-amber-300',
  },
  partial: {
    label: 'ตรวจรับบางส่วน',
    bg: 'bg-blue-100',
    color: 'text-blue-800',
    border: 'border-blue-300',
  },
  inspected: {
    label: 'ตรวจรับแล้ว (อยู่ในขั้นตอนตั้งเบิก)',
    bg: 'bg-emerald-100',
    color: 'text-emerald-800',
    border: 'border-emerald-300',
  },
  cancelled: {
    label: 'ยกเลิกรายการ',
    bg: 'bg-rose-100',
    color: 'text-rose-800',
    border: 'border-rose-300',
  },
};

export const STATUS_OPTIONS = [
  { value: 'ordering', label: 'รอตรวจรับ' },
  { value: 'partial', label: 'ตรวจรับบางส่วน' },
  { value: 'inspected', label: 'ตรวจรับแล้ว (อยู่ในขั้นตอนตั้งเบิก)' },
  { value: 'cancelled', label: 'ยกเลิกรายการ' },
];

// 🎯 ฟังก์ชันดึง Label สถานะ (ถ้าไม่ตรงกับ Config จะใช้ข้อความที่คีย์มาตรงๆ)
export const getStatusLabel = (status: string): string => {
  if (!status) return 'รอตรวจรับ';
  return STATUS_CONFIG[status]?.label || status;
};

// 🎯 ฟังก์ชันดึง CSS Class สำหรับ Badge สถานะ
export const getStatusBadgeClass = (status: string): string => {
  if (!status) {
    const defaultConf = STATUS_CONFIG['ordering'];
    return `${defaultConf.bg} ${defaultConf.color} ${defaultConf.border}`;
  }

  // ถ้าตรงกับ Key ใน STATUS_CONFIG ให้ใช้สีตามที่กำหนดไว้
  if (STATUS_CONFIG[status]) {
    const conf = STATUS_CONFIG[status];
    return `${conf.bg} ${conf.color} ${conf.border}`;
  }

  // กรณีเป็นสถานะ custom ที่พิมพ์เพิ่มเข้ามาเอง จะแสดงผลเป็น Badge สีฟ้าอ่อนมาตรฐาน
  return 'bg-sky-100 text-sky-800 border-sky-300';
};

// ฟังก์ชันแปลงวันที่เป็น พ.ศ. แบบสั้น (เช่น 16 ก.ย. 69)
export const formatDateTH = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
};

// ฟังก์ชันแปลงจำนวนเงินเป็นรูปแบบไทยบาท (เช่น 1,250.00)
export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
