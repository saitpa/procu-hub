import React, { useState } from 'react';
import {
  PurchaseRecord,
  PurchaseItem,
  AttachmentFile,
  RecordCategory,
  RecordStatus,
  AttachmentCategory,
  VatType,
  Vendor,
  StaffMember,
} from '../types';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Paperclip,
  CheckCircle2,
  Image as ImageIcon,
  Store,
  Calendar,
  DollarSign,
  Calculator,
  UserCheck,
  FileSpreadsheet,
  FileText,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { formatBaht, calculateVatBreakdown } from '../utils';
import { VendorSelectModal } from './VendorSelectModal';

interface PurchaseRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: PurchaseRecord) => void;
  editingRecord: PurchaseRecord | null;
  defaultFiscalYear: number;
  existingPrCount: number;
  vendors: Vendor[];
  onAddNewVendor: (vendor: Vendor) => void;
  materialSubtypes: string[];
  staffMembers: StaffMember[];
  onDelete?: (id: string) => void;
}

export const PurchaseRecordModal: React.FC<PurchaseRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecord,
  defaultFiscalYear,
  existingPrCount,
  vendors,
  onAddNewVendor,
  materialSubtypes,
  staffMembers,
  onDelete,
}) => {
  if (!isOpen) return null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Auto-generate PR number format if new
  const autoPrNumber = `PR-${String(defaultFiscalYear).slice(-2)}-${String(
    existingPrCount + 1
  ).padStart(3, '0')}`;

  // Form states
  const [prNumber, setPrNumber] = useState(
    editingRecord ? editingRecord.prNumber : autoPrNumber
  );
  const [title, setTitle] = useState(editingRecord ? editingRecord.title : '');
  const [requestDate, setRequestDate] = useState(
    editingRecord ? editingRecord.requestDate : today
  );
  const [deliveryDueDate, setDeliveryDueDate] = useState<string>(
    editingRecord?.deliveryDueDate || ''
  );
  const [fiscalYear, setFiscalYear] = useState<number>(
    editingRecord ? editingRecord.fiscalYear : defaultFiscalYear
  );
  const [requester, setRequester] = useState(
    editingRecord ? editingRecord.requester : 'นางสุภาพร บุญมา (เจ้าหน้าที่ธุรการสาขาวิชา)'
  );
  const [department, setDepartment] = useState(
    editingRecord ? editingRecord.department : 'สาขาวิชาจุลชีววิทยา คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น'
  );
  const [category, setCategory] = useState<RecordCategory>(
    editingRecord ? editingRecord.category : 'material'
  );
  const [materialSubType, setMaterialSubType] = useState<string>(
    editingRecord?.materialSubType || (materialSubtypes[0] || 'วัสดุวิทยาศาสตร์')
  );
  const [budgetSource, setBudgetSource] = useState(
    editingRecord ? editingRecord.budgetSource : 'เงินรายได้สาขาวิชา'
  );

  // 1. เลขที่ อว. และ ส่งหนังสือออกวันที่ (หากยังไม่มีใส่ '-' สามารถแก้ไขได้ภายหลัง)
  const [mhesiNumber, setMhesiNumber] = useState<string>(
    editingRecord?.mhesiNumber ?? '-'
  );
  const [mhesiDate, setMhesiDate] = useState<string>(
    editingRecord?.mhesiDate ?? '-'
  );

  // Vendor states
  const [vendorCode, setVendorCode] = useState(editingRecord?.vendorCode || '');
  const [vendorName, setVendorName] = useState(editingRecord?.vendorName || '');
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  // Committee / Staff states
  const [torMaker, setTorMaker] = useState(editingRecord?.torMaker || '');
  const [priceEstimator, setPriceEstimator] = useState(editingRecord?.priceEstimator || '');
  const [inspectorName, setInspectorName] = useState(
    editingRecord?.inspectorName || 'นายสมศักดิ์ วงศ์สวัสดิ์ (นักวิชาการพัสดุ)'
  );

  // 3. เอกสารการตรวจรับมีเลขที่เอกสาร และ PUR- และเลขบันทึกจากงานพัสดุ RFQ- (หากยังไม่มีใส่ '-' สามารถแก้ไขได้ภายหลัง)
  const [inspectionDocNumber, setInspectionDocNumber] = useState<string>(
    editingRecord?.inspectionDocNumber ?? '-'
  );
  const [purNumber, setPurNumber] = useState<string>(
    editingRecord?.purNumber ?? '-'
  );
  const [rfqNumber, setRfqNumber] = useState<string>(
    editingRecord?.rfqNumber ?? '-'
  );

  // VAT & Pricing state
  const [vatType, setVatType] = useState<VatType>(editingRecord?.vatType || 'included');

  const [status, setStatus] = useState<RecordStatus>(
    editingRecord ? editingRecord.status : 'pending_inspection'
  );
  const [notes, setNotes] = useState(editingRecord?.notes || '');

  // Line items (รหัสสินค้า, จำนวนสินค้า, หน่วยนับ ขวด pack ชิ้น ฯลฯ)
  const [items, setItems] = useState<PurchaseItem[]>(
    editingRecord?.items?.length
      ? editingRecord.items.map((it) => ({
          ...it,
          code: it.code || '-',
          unit: it.unit || 'ชิ้น',
        }))
      : [
          {
            id: `item-${Date.now()}`,
            code: '-',
            name: '',
            quantity: 1,
            unit: 'ชิ้น',
            unitPrice: 0,
            totalPrice: 0,
          },
        ]
  );

  // Attachments
  const [attachments, setAttachments] = useState<AttachmentFile[]>(
    editingRecord?.attachments || []
  );
  const [selectedAttachmentCategory, setSelectedAttachmentCategory] =
    useState<AttachmentCategory>('receipt');

  // Sum of item table
  const rawItemsSum = items.reduce((sum, it) => sum + (Number(it.totalPrice) || 0), 0);

  // VAT calculations
  const { subtotalBeforeVat, vatAmount, totalAmount } = calculateVatBreakdown(
    rawItemsSum,
    vatType
  );

  // Quick set delivery date (+15, +30 days)
  const handleSetQuickDueDate = (days: number) => {
    const base = requestDate ? new Date(requestDate) : new Date();
    base.setDate(base.getDate() + days);
    setDeliveryDueDate(base.toISOString().split('T')[0]);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        code: '-',
        name: '',
        quantity: 1,
        unit: 'ชิ้น',
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof PurchaseItem,
    value: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        const q = field === 'quantity' ? Number(value) : Number(item.quantity);
        const p = field === 'unitPrice' ? Number(value) : Number(item.unitPrice);
        item.totalPrice = (isNaN(q) ? 0 : q) * (isNaN(p) ? 0 : p);
      } else if (field === 'totalPrice') {
        item.totalPrice = Number(value) || 0;
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle vendor select from modal
  const handleSelectVendor = (vendor: Vendor) => {
    setVendorCode(vendor.code);
    setVendorName(vendor.name);
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray: File[] = Array.from(files);
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newAttachment: AttachmentFile = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl,
          category: selectedAttachmentCategory,
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prNumber.trim() || !title.trim()) return;

    const validItems = items.filter((it) => it.name.trim() !== '');
    const finalItems =
      validItems.length > 0
        ? validItems
        : [
            {
              id: `item-${Date.now()}`,
              name: title,
              quantity: 1,
              unit: 'ชุด',
              unitPrice: rawItemsSum,
              totalPrice: rawItemsSum,
            },
          ];

    const recordToSave: PurchaseRecord = {
      id: editingRecord?.id || `rec-${Date.now()}`,
      prNumber: prNumber.trim(),
      title: title.trim(),
      requestDate,
      deliveryDueDate: deliveryDueDate.trim() || undefined,
      requester: requester.trim(),
      department: department.trim(),
      category,
      materialSubType: category === 'material' ? materialSubType : undefined,
      budgetSource,
      fiscalYear: Number(fiscalYear),

      // Official references (MHESI & dates)
      mhesiNumber: mhesiNumber.trim() || '-',
      mhesiDate: mhesiDate.trim() || '-',

      // Vendor info
      vendorCode: vendorCode.trim() || undefined,
      vendorName: vendorName.trim() || undefined,

      // Staff roles
      torMaker: torMaker.trim() || undefined,
      priceEstimator: priceEstimator.trim() || undefined,
      inspectorName: inspectorName.trim() || undefined,

      // Inspection document and procurement tracking numbers
      inspectionDocNumber: inspectionDocNumber.trim() || '-',
      purNumber: purNumber.trim() || '-',
      rfqNumber: rfqNumber.trim() || '-',

      // Items & VAT
      items: finalItems,
      vatType,
      subtotalBeforeVat: Number(subtotalBeforeVat.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),

      status,
      inspectedDate: editingRecord?.inspectedDate,
      inspectedBy: editingRecord?.inspectedBy,
      inspectionNote: editingRecord?.inspectionNote,
      attachments,
      notes: notes.trim() || undefined,
      createdAt: editingRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(recordToSave);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
          {/* Header - Matching Navy / Indigo-Blue of the Subtotal card */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {editingRecord ? 'แก้ไขบันทึกใบ PR' : 'บันทึกข้อมูลใบขอซื้อ/ขอจ้าง (PR ใหม่)'}
                </h3>
                <p className="text-xs text-blue-200">
                  ระบุเลขที่ PR, วันกำหนดส่ง, รหัสร้านค้า, ผู้จัดทำ TOR/ราคากลาง, และคำนวณ VAT
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Section 1: ข้อมูลทั่วไป & เลขที่ PR */}
            <div>
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1 border-b border-emerald-100">
                <span>1. ข้อมูลทั่วไปและเลขที่ใบขอซื้อ (PR)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    เลขที่ใบ PR <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={prNumber}
                    onChange={(e) => setPrNumber(e.target.value)}
                    placeholder="เช่น PR-68-001"
                    className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm font-bold font-mono text-emerald-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันที่ขอซื้อ / วันที่ใบ PR <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 1. วันกำหนดส่งของ & แจ้งเตือน */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      วันกำหนดส่งของ (Delivery Due Date)
                    </label>
                    <div className="flex items-center gap-1 text-2xs text-emerald-700 font-semibold">
                      <span>ลัด:</span>
                      <button
                        type="button"
                        onClick={() => handleSetQuickDueDate(15)}
                        className="hover:underline px-1 py-0.5 bg-emerald-50 rounded cursor-pointer"
                      >
                        +15 วัน
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetQuickDueDate(30)}
                        className="hover:underline px-1 py-0.5 bg-emerald-50 rounded cursor-pointer"
                      >
                        +30 วัน
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={deliveryDueDate}
                      onChange={(e) => setDeliveryDueDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                    />
                  </div>
                  <p className="text-2xs text-slate-400 mt-1">
                    * เมื่อใกล้ถึงวันกำหนดส่ง ระบบจะแจ้งเตือนและสามารถส่งอีเมลแจ้งเตือนได้
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="mt-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รายการจัดซื้อ / ชื่องาน / โครงการ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น จัดซื้อสารเคมีและอุปกรณ์ห้องปฏิบัติการ, จัดซื้อเครื่องคอมพิวเตอร์..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ปีงบประมาณ
                  </label>
                  <input
                    type="number"
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    หมวดหมู่หลัก
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RecordCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="material">วัสดุสิ้นเปลือง</option>
                    <option value="asset">ครุภัณฑ์</option>
                    <option value="service">จ้างเหมา / บริการ</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>

                {/* 3. หมวดวัสดุสิ้นเปลืองย่อย (วิทยาศาสตร์ / งานบ้าน / ฯลฯ) */}
                {category === 'material' ? (
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">
                      หมวดวัสดุสิ้นเปลือง <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={materialSubType}
                      onChange={(e) => setMaterialSubType(e.target.value)}
                      className="w-full px-3 py-2 bg-emerald-50/60 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-950 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {materialSubtypes.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      แหล่งงบประมาณ
                    </label>
                    <select
                      value={budgetSource}
                      onChange={(e) => setBudgetSource(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="เงินรายได้สาขาวิชา">เงินรายได้สาขาวิชา</option>
                      <option value="งบประมาณแผ่นดิน (งบดำเนินงาน)">งบประมาณแผ่นดิน (งบดำเนินงาน)</option>
                      <option value="งบประมาณแผ่นดิน (งบลงทุน)">งบประมาณแผ่นดิน (งบลงทุน)</option>
                      <option value="งบประมาณคณะ">งบประมาณคณะ</option>
                      <option value="ทุนวิจัย/บริการวิชาการ">ทุนวิจัย/บริการวิชาการ</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ผู้ขอซื้อ / ผู้ประสานงาน
                  </label>
                  <input
                    type="text"
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    หน่วยงาน / สาขาวิชา
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 1.5: เลขที่หนังสือ อว. และเลขที่งานพัสดุ (ตามระบบราชการ/มข.) */}
            <div className="p-4 bg-sky-50/50 border border-sky-200 rounded-2xl">
              <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>เลขที่หนังสือ อว. และเลขที่งานพัสดุ (หากยังไม่มีใส่ '-' สามารถแก้ไขได้ภายหลัง)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">
                    เลขที่ อว.
                  </label>
                  <input
                    type="text"
                    value={mhesiNumber}
                    onChange={(e) => setMhesiNumber(e.target.value)}
                    placeholder="เช่น อว 6603.10.1/142 หรือ -"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">
                    ส่งหนังสือออกวันที่
                  </label>
                  <input
                    type="text"
                    value={mhesiDate}
                    onChange={(e) => setMhesiDate(e.target.value)}
                    placeholder="เช่น 2025-01-16 หรือ -"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">
                    เอกสารตรวจรับเลขที่
                  </label>
                  <input
                    type="text"
                    value={inspectionDocNumber}
                    onChange={(e) => setInspectionDocNumber(e.target.value)}
                    placeholder="เช่น ตรวจรับที่ 14/2568 หรือ -"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">
                    เลขที่ PUR- (ใบสั่งซื้อ)
                  </label>
                  <input
                    type="text"
                    value={purNumber}
                    onChange={(e) => setPurNumber(e.target.value)}
                    placeholder="เช่น PUR-68-0042 หรือ -"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">
                    เลขบันทึกพัสดุ RFQ-
                  </label>
                  <input
                    type="text"
                    value={rfqNumber}
                    onChange={(e) => setRfqNumber(e.target.value)}
                    placeholder="เช่น RFQ-68-0115 หรือ -"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: ข้อมูลร้านค้าและรหัสร้านค้า (Pop-up ให้เลือก) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>2. รหัสร้านค้าและคู่ค้า (Vendor)</span>
                </h4>

                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(true)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>🔍 Pop-up เลือกรหัสร้านค้า</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสร้านค้า (Vendor Code)
                  </label>
                  <input
                    type="text"
                    value={vendorCode}
                    onChange={(e) => setVendorCode(e.target.value)}
                    placeholder="เช่น V-001 (กดปุ่ม Pop-up เพื่อเลือก)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-emerald-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อร้านค้า / บริษัทผู้ขาย
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="เช่น บริษัท เคเคยู สเตชั่นเนอรี่ จำกัด"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: ผู้จัดทำ TOR / ผู้ทำราคากลาง / ผู้ตรวจรับ (Dropdown จาก Master list) */}
            <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>3. บันทึกผู้จัดทำ TOR / ราคากลาง / ผู้ตรวจรับ</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* ผู้จัดทำ TOR */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ผู้จัดทำ TOR / คุณลักษณะ
                  </label>
                  <input
                    list="staff-tor-list"
                    type="text"
                    value={torMaker}
                    onChange={(e) => setTorMaker(e.target.value)}
                    placeholder="เลือกหรือพิมพ์ชื่อ..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <datalist id="staff-tor-list">
                    {staffMembers.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>

                {/* ผู้ทำราคากลาง */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ผู้กำหนดราคากลาง
                  </label>
                  <input
                    list="staff-price-list"
                    type="text"
                    value={priceEstimator}
                    onChange={(e) => setPriceEstimator(e.target.value)}
                    placeholder="เลือกหรือพิมพ์ชื่อ..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <datalist id="staff-price-list">
                    {staffMembers.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>

                {/* ผู้ตรวจรับพัสดุ */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ผู้ตรวจรับพัสดุ / กรรมการ
                  </label>
                  <input
                    list="staff-inspector-list"
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    placeholder="เลือกหรือพิมพ์ชื่อ..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <datalist id="staff-inspector-list">
                    {staffMembers.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Section 4: รายการพัสดุ & คิดแยก VAT */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>4. รายการสิ่งของ และการคิดภาษี VAT 7%</span>
                </h4>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มแถวรายการ</span>
                </button>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                        <th className="py-2.5 px-2 w-28 text-center">รหัสสินค้า</th>
                        <th className="py-2.5 px-3 min-w-[180px]">รายละเอียดรายการพัสดุ</th>
                        <th className="py-2.5 px-2 w-20 text-right">จำนวน</th>
                        <th className="py-2.5 px-2 w-24">หน่วยนับ</th>
                        <th className="py-2.5 px-2 w-28 text-right">ราคา/หน่วย (บ.)</th>
                        <th className="py-2.5 px-3 w-32 text-right">รวมเงิน (บ.)</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it, idx) => (
                        <tr key={it.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-center text-slate-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={it.code || '-'}
                              onChange={(e) => handleUpdateItem(idx, 'code', e.target.value)}
                              placeholder="-"
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              required
                              value={it.name}
                              onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                              placeholder="เช่น ชุดสารเคมี, อาหารเลี้ยงเชื้อ, จานเพาะเชื้อ..."
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="1"
                              step="any"
                              value={it.quantity}
                              onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-right focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={it.unit}
                              onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                              placeholder="ชุด/กล่อง/ชิ้น"
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={it.unitPrice}
                              onChange={(e) => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-right focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                            {formatBaht(it.totalPrice)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* VAT Option & Summary Calculation Cards */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-3">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                    <span>การคำนวณภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                  </span>

                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="vatType"
                        value="included"
                        checked={vatType === 'included'}
                        onChange={() => setVatType('included')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>ราคารวม VAT 7% แล้ว</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="vatType"
                        value="excluded"
                        checked={vatType === 'excluded'}
                        onChange={() => setVatType('excluded')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>ราคาไม่รวม VAT (บวก 7%)</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="vatType"
                        value="exempt"
                        checked={vatType === 'exempt'}
                        onChange={() => setVatType('exempt')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>ยกเว้น VAT</span>
                    </label>
                  </div>
                </div>

                {/* 3 Summary Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                    <div className="text-2xs text-slate-500">ราคาก่อนภาษี (Subtotal)</div>
                    <div className="text-base font-bold text-slate-800 font-mono mt-0.5">
                      {formatBaht(subtotalBeforeVat)}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
                    <div className="text-2xs text-amber-700">ภาษีมูลค่าเพิ่ม (VAT 7%)</div>
                    <div className="text-base font-bold text-amber-900 font-mono mt-0.5">
                      {formatBaht(vatAmount)}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-600 text-white rounded-xl text-center shadow-xs">
                    <div className="text-2xs text-emerald-100 font-medium">ยอดสั่งซื้อสุทธิรวม VAT</div>
                    <div className="text-lg font-bold font-mono mt-0.5">
                      {formatBaht(totalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: แนบรูปภาพและไฟล์เอกสาร */}
            <div>
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-emerald-600" />
                <span>5. แนบรูปถ่ายสินค้า / ใบเสร็จ / ไฟล์เอกสาร (Attachments)</span>
              </h4>

              <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">เลือกประเภทไฟล์:</span>
                    <select
                      value={selectedAttachmentCategory}
                      onChange={(e) => setSelectedAttachmentCategory(e.target.value as AttachmentCategory)}
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="photo">📷 รูปถ่ายพัสดุ / กล่องสินค้า</option>
                      <option value="receipt">🧾 ใบเสร็จรับเงิน / ใบส่งของ</option>
                      <option value="pr_file">📄 สแกนใบ PR ที่เซ็นแล้ว</option>
                      <option value="document">📑 เอกสารอื่นๆ</option>
                    </select>
                  </div>

                  <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>คลิกเพื่ออัปโหลดไฟล์ / รูปภาพ</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Uploaded Attachments Preview */}
                {attachments.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="relative group p-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
                      >
                        {att.type.startsWith('image/') ? (
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-full h-20 object-cover rounded-lg mb-1"
                          />
                        ) : (
                          <div className="w-full h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mb-1">
                            <Paperclip className="w-6 h-6" />
                          </div>
                        )}
                        <p className="text-2xs font-semibold text-slate-700 truncate" title={att.name}>
                          {att.name}
                        </p>
                        <span className="text-3xs text-emerald-700 bg-emerald-50 px-1 rounded">
                          {att.category === 'photo'
                            ? 'รูปของ'
                            : att.category === 'receipt'
                            ? 'ใบเสร็จ'
                            : att.category === 'pr_file'
                            ? 'ใบ PR'
                            : 'เอกสาร'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="ลบไฟล์นี้"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 mt-2">
                    ยังไม่มีไฟล์แนบ (สามารถแนบรูปถ่ายกล่อง หรือใบเสร็จได้ทั้งตอนนี้และภายหลัง)
                  </p>
                )}
              </div>
            </div>

            {/* Section 6: สถานะและหมายเหตุ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  สถานะพัสดุ
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RecordStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pending_inspection">🟡 รอตรวจรับ (ของมาถึงแล้วรอตรวจนับ)</option>
                  <option value="inspected">🟢 นับของแล้ว (ตรวจรับและนับของเสร็จสิ้น)</option>
                  <option value="ordering">🔵 กำลังรอร้านส่งมอบ</option>
                  <option value="cancelled">⚪ ยกเลิกรายการ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมายเหตุเพิ่มเติม
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="เช่น เบิกจ่ายงบพิเศษ, นัดทดสอบอุปกรณ์..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              {editingRecord && onDelete ? (
                <div>
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 rounded-xl px-3 py-1.5 text-xs">
                      <span className="font-bold text-rose-800">ยืนยันลบ PR นี้?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(editingRecord.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                      >
                        ลบทันที
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:text-rose-850 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบรายการนี้</span>
                    </button>
                  )}
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingRecord ? 'บันทึกการแก้ไข' : 'บันทึกใบ PR ทันที'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Vendor Select Pop-up Modal */}
      {isVendorModalOpen && (
        <VendorSelectModal
          isOpen={isVendorModalOpen}
          onClose={() => setIsVendorModalOpen(false)}
          vendors={vendors}
          onSelectVendor={handleSelectVendor}
          onAddNewVendor={onAddNewVendor}
          selectedVendorCode={vendorCode}
        />
      )}
    </>
  );
};
