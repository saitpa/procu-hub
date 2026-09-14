export type RecordCategory = 'material' | 'asset' | 'service' | 'other';

export type RecordStatus =
  | 'pending_inspection' // รอตรวจรับ (ของมาถึงแล้วรอตรวจนับ หรืออยู่ระหว่างรอตรวจรับ)
  | 'partial_inspected'  // รับแล้วบางส่วน (รับเป็นรอบๆ ยังไม่ครบทุกงวด)
  | 'inspected' // นับของแล้ว (ตรวจรับและนับของครบถ้วนเรียบร้อย)
  | 'ordering' // กำลังรอร้านส่งมอบ
  | 'cancelled'; // ยกเลิก

export type VatType = 'included' | 'excluded' | 'exempt'; // ราคารวม VAT 7% แล้ว, ไม่รวม VAT (บวกเพิ่ม 7%), ได้รับยกเว้น VAT

export type DeliveryType = 'single' | 'batch'; // ส่งมอบครั้งเดียว หรือ ทยอยส่งมอบเป็นรอบ

export interface PurchaseItem {
  id: string;
  code?: string; // 2. รหัสสินค้า (ถ้ายังไม่มีให้เป็น '-')
  name: string; // รายละเอียดรายการพัสดุ
  quantity: number; // จำนวนสินค้า
  unit: string; // หน่วยนับของสินค้า เช่น ขวด, pack, ชิ้น, กล่อง ฯลฯ
  unitPrice: number;
  totalPrice: number;
}

export interface ReceivingRoundItem {
  itemId: string;
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number; // จำนวนที่รับในรอบนี้
  unit: string;
}

export interface ReceivingRound {
  id: string;
  roundNumber: number; // รอบที่ 1, รอบที่ 2...
  receivedDate: string; // วันที่รับของรอบนี้
  receivedBy: string; // ผู้ตรวจรับ/ผู้นับของรอบนี้
  deliveryNoteNumber?: string; // เลขที่ใบส่งของ / ใบกำกับภาษีรอบนี้
  inspectionDocNumber?: string; // เลขที่เอกสารตรวจรับประจำรอบนี้ (เช่น ตรวจรับงวดที่ 1/2568)
  note?: string; // สภาพพัสดุ / หมายเหตุการรับรอบนี้
  items: ReceivingRoundItem[]; // รายการสินค้าและจำนวนที่รับในรอบนี้
  isCompletedRemaining?: boolean; // ครบถ้วนสิ้นสุดทุกรายการแล้ว
  attachments?: AttachmentFile[]; // รูปถ่ายของที่รับ หรือใบส่งของประจำรอบนี้
  createdAt: string;
}

export type AttachmentCategory = 'photo' | 'receipt' | 'document' | 'pr_file';

export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // Base64 data url
  category: AttachmentCategory;
  uploadedAt: string;
}

export interface Vendor {
  id: string;
  code: string; // เช่น V-001, V-002
  name: string;
  taxId?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  department: string;
  role?: 'tor' | 'price' | 'inspector' | 'all';
}

export interface PurchaseRecord {
  id: string;
  prNumber: string; // เลขที่ใบ PR เช่น PR-68-001 หรือเลขที่เอกสาร
  title: string; // รายการจัดซื้อ / เรื่อง
  requestDate: string; // วันที่ขอซื้อ / วันที่ใบ PR
  deliveryDueDate?: string; // 1. วันกำหนดส่งของ / วันครบกำหนดส่งมอบ
  requester: string; // ผู้ขอซื้อ / ผู้ประสานงาน
  department: string; // สาขาวิชา / ภาควิชา / งาน
  category: RecordCategory; // วัสดุ / ครุภัณฑ์ / จ้างเหมา / อื่นๆ
  materialSubType?: string; // 3. หมวดวัสดุสิ้นเปลือง เช่น วัสดุวิทยาศาสตร์, วัสดุงานบ้าน, วัสดุสำนักงาน
  budgetSource: string; // แหล่งงบประมาณ เช่น เงินรายได้สาขาวิชา, งบแผ่นดิน
  fiscalYear: number; // ปีงบประมาณ เช่น 2568, 2567

  // 1. เลขที่ อว. และ วันที่ส่งหนังสือออก (หากยังไม่มีใส่ '-' สามารถแก้ไขได้ภายหลัง)
  mhesiNumber?: string; // เลขที่ อว. เช่น อว 6603.10.1/142 หรือ '-'
  mhesiDate?: string; // วันที่ส่งหนังสือออก เช่น 2025-01-16 หรือ '-'

  // 2. ข้อมูลร้านค้าและรหัสร้านค้า
  vendorCode?: string; // รหัสร้านค้า เช่น V-001
  vendorName?: string; // ร้านค้า / บริษัทผู้ขาย
  vendorId?: string;

  // 3. ผู้จัดทำ tor / ผู้ตรวจรับ / ผู้ทำราคากลาง
  torMaker?: string; // ผู้จัดทำ TOR
  priceEstimator?: string; // ผู้ทำราคากลาง
  inspectorName?: string; // ผู้ตรวจรับ

  // 4. เอกสารการตรวจรับ และเลขบันทึกจากงานพัสดุ (หากยังไม่มีใส่ '-' สามารถแก้ไขได้ภายหลัง)
  inspectionDocNumber?: string; // เลขที่เอกสารการตรวจรับ เช่น ตรวจรับที่ 12/2568 หรือ '-'
  purNumber?: string; // เลขที่ PUR- เช่น PUR-68-001 หรือ '-'
  rfqNumber?: string; // เลขบันทึกจากงานพัสดุ RFQ- เช่น RFQ-68-001 หรือ '-'

  // 5. รายการสินค้า และการคิดราคา VAT
  items: PurchaseItem[];
  vatType: VatType;
  subtotalBeforeVat: number; // ราคาก่อน VAT
  vatAmount: number; // ภาษีมูลค่าเพิ่ม (VAT 7%)
  totalAmount: number; // ยอดสุทธิรวม VAT

  // รูปแบบการส่งมอบและการตรวจรับ (ส่งมอบครั้งเดียว หรือ ทยอยรับเป็นรอบๆ)
  deliveryType?: DeliveryType;
  receivingRounds?: ReceivingRound[]; // ประวัติการรับของแต่ละรอบ

  status: RecordStatus; // รอตรวจรับ | รับแล้วบางส่วน (รอบๆ) | นับของแล้ว | กำลังรอส่งมอบ | ยกเลิก
  
  // บันทึกการตรวจนับของ (รอบล่าสุด หรือกรณีรับครั้งเดียว)
  inspectedDate?: string; // วันที่นับของเสร็จ
  inspectedBy?: string; // ผู้นับของ / ผู้ตรวจรับ
  inspectionNote?: string; // ผลการนับของ / สภาพสินค้า

  // ไฟล์แนบและรูปภาพ
  attachments: AttachmentFile[];

  notes?: string; // หมายเหตุเพิ่มเติม
  createdAt: string;
  updatedAt: string;
}

export interface YearSummary {
  fiscalYear: number;
  totalAmount: number; // ยอดรวมสุทธิ (รวม VAT)
  totalSubtotalBeforeVat: number; // ยอดรวมก่อน VAT
  totalVatAmount: number; // ยอดรวม VAT 7%
  totalCount: number;
  pendingInspectionCount: number;
  pendingInspectionAmount: number;
  partialInspectedCount: number; // รายการที่รับแล้วบางส่วน (ทยอยรับเป็นรอบ)
  partialInspectedAmount: number;
  inspectedCount: number;
  inspectedAmount: number;
  orderingCount: number;
  orderingAmount: number;
  overdueCount: number; // รายการที่เกินกำหนดส่ง
  nearDueCount: number; // รายการที่ใกล้ครบกำหนดส่ง (ภายใน 7 วัน)
}
