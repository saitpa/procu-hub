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

  const autoPrNumber = `PR-${String(defaultFiscalYear).slice(-2)}-${String(
    existingPrCount + 1
  ).padStart(3, '0')}`;

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

  const [mhesiNumber, setMhesiNumber] = useState<string>(
    editingRecord?.mhesiNumber ?? '-'
  );
  const [mhesiDate, setMhesiDate] = useState<string>(
    editingRecord?.mhesiDate ?? '-'
  );

  const [vendorCode, setVendorCode] = useState(editingRecord?.vendorCode || '');
  const [vendorName, setVendorName] = useState(editingRecord?.vendorName || '');
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  const [torMaker, setTorMaker] = useState(editingRecord?.torMaker || '');
  const [priceEstimator, setPriceEstimator] = useState(editingRecord?.priceEstimator || '');
  const [inspectorName, setInspectorName] = useState(
    editingRecord?.inspectorName || 'นายสมศักดิ์ วงศ์สวัสดิ์ (นักวิชาการพัสดุ)'
  );

  const [inspectionDocNumber, setInspectionDocNumber] = useState<string>(
    editingRecord?.inspectionDocNumber ?? '-'
  );
  const [purNumber, setPurNumber] = useState<string>(
    editingRecord?.purNumber ?? '-'
  );
  const [rfqNumber, setRfqNumber] = useState<string>(
    editingRecord?.rfqNumber ?? '-'
  );

  const [vatType, setVatType] = useState<VatType>(editingRecord?.vatType || 'included');

  const [status, setStatus] = useState<RecordStatus>(
    editingRecord ? editingRecord.status : 'pending_inspection'
  );
  const [notes, setNotes] = useState(editingRecord?.notes || '');

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

  const [attachments, setAttachments] = useState<AttachmentFile[]>(
    editingRecord?.attachments || []
  );
  const [selectedAttachmentCategory, setSelectedAttachmentCategory] =
    useState<AttachmentCategory>('receipt');

  const rawItemsSum = items.reduce((sum, it) => sum + (Number(it.totalPrice) || 0), 0);

  const { subtotalBeforeVat, vatAmount, totalAmount } = calculateVatBreakdown(
    rawItemsSum,
    vatType
  );

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

  const handleSelectVendor = (vendor: Vendor) => {
    setVendorCode(vendor.code);
    setVendorName(vendor.name);
  };

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

      mhesiNumber: mhesiNumber.trim() || '-',
      mhesiDate: mhesiDate.trim() || '-',

      vendorCode: vendorCode.trim() || undefined,
      vendorName: vendorName.trim() || undefined,

      torMaker: torMaker.trim() || undefined,
      priceEstimator: priceEstimator.trim() || undefined,
      inspectorName: inspectorName.trim() || undefined,

      inspectionDocNumber: inspectionDocNumber.trim() || '-',
      purNumber: purNumber.trim() || '-',
      rfqNumber: rfqNumber.trim() || '-',

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

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
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
                  <label className="block text-xs font-bold text-slate-
