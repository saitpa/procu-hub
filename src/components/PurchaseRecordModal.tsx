import React, { useState, useEffect } from 'react';

export interface PurchaseItem {
  id: number | string;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
}

export interface AttachmentItem {
  id: string;
  name: string;
  category: string;
  size: string;
  uploadDate: string;
}

export interface PurchaseFormData {
  id: string;
  prNumber: string;
  prDate: string;
  deliveryDueDate: string;
  title: string;
  fiscalYear: number;
  category: string;
  subType: string;
  requesterName: string;
  department: string;
  ewNo: string;
  ewDate: string;
  inspectDocNo: string;
  purNo: string;
  rfqNo: string;
  vendorCode: string;
  vendorName: string;
  torMaker: string;
  committeeChair: string;
  committeeMember: string;
  items: PurchaseItem[];
  vatType: 'include' | 'exclude' | 'no_vat';
  subtotalAmount: number;
  vatAmount: number;
  amount: number;
  attachmentCategory: string;
  attachments: AttachmentItem[];
  status: string;
  notes: string;
}

interface PurchaseRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRecord?: PurchaseFormData | null;
  vendors: Array<{ id: string | number; name: string; taxId?: string }>;
  staffMembers: Array<{ id: string | number; name: string; role: string }>;
  materialSubtypes: string[];
  currentFiscalYear: number;
  onSave: (record: PurchaseFormData) => void;
}

export const PurchaseRecordModal: React.FC<PurchaseRecordModalProps> = ({
  isOpen,
  onClose,
  editingRecord,
  vendors,
  staffMembers,
  materialSubtypes,
  currentFiscalYear,
  onSave,
}) => {
  const defaultState: PurchaseFormData = {
    id: `rec-${Date.now()}`,
    prNumber: '',
    prDate: new Date().toISOString().split('T')[0],
    deliveryDueDate: '',
    title: '',
    fiscalYear: currentFiscalYear,
    category: 'วัสดุห้องปฏิบัติการ',
    subType: materialSubtypes[0] || 'วัสดุวิทยาศาสตร์และการแพทย์',
    requesterName: 'นายสุรพงษ์ บุญมา (เจ้าหน้าที่ธุรการสาขาวิชา)',
    department: 'สาขาวิชาจุลชีววิทยา คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น',
    ewNo: '',
    ewDate: '',
    inspectDocNo: '',
    purNo: '',
    rfqNo: '',
    vendorCode: '',
    vendorName: '',
    torMaker: '',
    committeeChair: '',
    committeeMember: '',
    items: [
      { id: 1, code: '', description: '', quantity: 1, unit: 'ชิ้น', pricePerUnit: 0, total: 0 }
    ],
    vatType: 'include',
    subtotalAmount: 0,
    vatAmount: 0,
    amount: 0,
    attachmentCategory: 'ใบสั่งซื้อ/สั่งจ้าง',
    attachments: [],
    status: 'รอตรวจรับ (รอของมาส่งและตรวจรับ)',
    notes: '',
  };

  const [formData, setFormData] = useState<PurchaseFormData>(defaultState);

  useEffect(() => {
    if (editingRecord) {
      setFormData(editingRecord);
    } else {
      setFormData({
        ...defaultState,
        id: `rec-${Date.now()}`,
        prNumber: `PR-${currentFiscalYear}-${Math.floor(100 + Math.random() * 900)}`,
        fiscalYear: currentFiscalYear,
        subType: materialSubtypes[0] || 'วัสดุวิทยาศาสตร์และการแพทย์',
      });
    }
  }, [editingRecord, currentFiscalYear, materialSubtypes]);

  if (!isOpen) return null;

  const addDaysToDueDate = (days: number) => {
    const baseDate = formData.prDate ? new Date(formData.prDate) : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    setFormData({ ...formData, deliveryDueDate: baseDate.toISOString().split('T')[0] });
  };

  const calculateTotals = (itemsList: PurchaseItem[], vatTypeOption: 'include' | 'exclude' | 'no_vat') => {
    const rawTotal = itemsList.reduce((sum, item) => sum + (item.total || 0), 0);
    let subtotal = 0;
    let vat = 0;
    let grandTotal = 0;

    if (vatTypeOption === 'include') {
      grandTotal = rawTotal;
      subtotal = Number((rawTotal / 1.07).toFixed(2));
      vat = Number((grandTotal - subtotal).toFixed(2));
    } else if (vatTypeOption === 'exclude') {
      subtotal = rawTotal;
      vat = Number((subtotal * 0.07).toFixed(2));
      grandTotal = Number((subtotal + vat).toFixed(2));
    } else {
      subtotal = rawTotal;
      vat = 0;
      grandTotal = rawTotal;
    }

    setFormData((prev) => ({
      ...prev,
      items: itemsList,
      vatType: vatTypeOption,
      subtotalAmount: subtotal,
      vatAmount: vat,
      amount: grandTotal,
    }));
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...formData.items];
    const updatedItem = { ...updatedItems[index], [field]: value };

    const qty = Number(field === 'quantity' ? value : updatedItem.quantity) || 0;
    const price = Number(field === 'pricePerUnit' ? value : updatedItem.pricePerUnit) || 0;
    updatedItem.total = qty * price;

    updatedItems[index] = updatedItem;
    calculateTotals(updatedItems, formData.vatType);
  };

  const handleAddItem = () => {
    const newItem: PurchaseItem = {
      id: Date.now(),
      code: '',
      description: '',
      quantity: 1,
      unit: 'ชิ้น',
      pricePerUnit: 0,
      total: 0,
    };
    const updatedItems = [...formData.items, newItem];
    calculateTotals(updatedItems, formData.vatType);
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length === 1) return;
    const updatedItems = formData.items.filter((_, i) => i !== index);
    calculateTotals(updatedItems, formData.vatType);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles: AttachmentItem[] = Array.from(files).map((file, idx) => ({
      id: `att-${Date.now()}-${idx}`,
      name: file.name,
      category: formData.attachmentCategory,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      uploadDate: new Date().toISOString().split('T')[0],
    }));
    setFormData({
      ...formData,
      attachments: [...(formData.attachments || []), ...newFiles],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300 text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <div>
              <h3 className="font-bold text-base tracking-wide">
                บันทึกข้อมูลใบขอซื้อ/จัดจ้าง (PR ใหม่)
              </h3>
              <p className="text-[11px] text-slate-300">
                ระบุเลขที่ PR, เดือนวันส่งของ, รหัสร้านค้า, ผู้จัดทำ TOR/กรรมการตรวจรับ, และคิดแยก VAT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          
          {/* Section 1: ข้อมูลทั่วไปใบขอซื้อ (PR) */}
          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/20 space-y-3">
            <h4 className="font-bold text-emerald-800 text-xs sm:text-sm border-b border-emerald-200 pb-2">
              1. ข้อมูลทั่วไปใบขอซื้อ/จัดจ้าง (PR)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เลขที่ PR *</label>
                <input
                  type="text"
                  required
                  value={formData.prNumber || ''}
                  onChange={(e) => setFormData({ ...formData, prNumber: e.target.value })}
                  className="w-full px-3 py-1.5 border border-emerald-400 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-emerald-50/50 font-semibold text-emerald-900 outline-none"
                  placeholder="PR-68-001"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่ขอซื้อ / วันที่ใน PR *</label>
                <input
                  type="date"
                  required
                  value={formData.prDate || ''}
                  onChange={(e) => setFormData({ ...formData, prDate: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700">วันกำหนดส่งมอบ (Delivery Due Date)</label>
                  <div className="space-x-1">
                    <button
                      type="button"
                      onClick={() => addDaysToDueDate(15)}
                      className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      +15 วัน
                    </button>
                    <button
                      type="button"
                      onClick={() => addDaysToDueDate(30)}
                      className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      +30 วัน
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={formData.deliveryDueDate || ''}
                  onChange={(e) => setFormData({ ...formData, deliveryDueDate: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  * เมื่อป้อนวันที่กำหนดส่งมอบ ระบบจะแจ้งเตือนล่วงหน้าและสามารถดูเดือนวันส่งมอบได้ทันที
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">รายการที่ขอซื้อ / ชื่องาน / โครงการ *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="เช่น จัดซื้อสารเคมีและอุปกรณ์ห้องปฏิบัติการ, จัดซื้อเครื่องคอมพิวเตอร์..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ปีงบประมาณ</label>
                <input
                  type="number"
                  value={formData.fiscalYear || currentFiscalYear}
                  onChange={(e) => setFormData({ ...formData, fiscalYear: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่หลัก</label>
                <select
                  value={formData.category || 'วัสดุห้องปฏิบัติการ'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                >
                  <option value="วัสดุห้องปฏิบัติการ">วัสดุห้องปฏิบัติการ</option>
                  <option value="วัสดุวิทยาศาสตร์">วัสดุวิทยาศาสตร์</option>
                  <option value="วัสดุสำนักงาน">วัสดุสำนักงาน</option>
                  <option value="ครุภัณฑ์">ครุภัณฑ์</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดวัสดุที่ดึงใช้จริง *</label>
                <select
                  value={formData.subType || ''}
                  onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
                  className="w-full px-3 py-1.5 border border-emerald-400 rounded-lg bg-emerald-50/50 font-semibold text-emerald-900 outline-none"
                >
                  {materialSubtypes.map((sub, idx) => (
                    <option key={idx} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ผู้ขอซื้อ / ผู้ประสานงาน</label>
                <input
                  type="text"
                  value={formData.requesterName || ''}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หน่วยงาน / สาขาวิชา</label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            {/* เอกสารอ้างอิงเพิ่มเติม */}
            <div className="border border-sky-200 rounded-lg p-3 bg-sky-50/30 space-y-2">
              <p className="text-xs font-bold text-sky-800">
                📄 เลขที่หนังสือ อว. และเอกสารที่สำคัญ (หากยังไม่มีให้เว้นว่างไว้)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">เลขที่ อว.</label>
                  <input
                    type="text"
                    value={formData.ewNo || ''}
                    onChange={(e) => setFormData({ ...formData, ewNo: e.target.value })}
                    className="w-full px-2 py-1 border rounded text-xs outline-none"
                    placeholder="-"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">ส่งหนังสือออกวันที่</label>
                  <input
                    type="date"
                    value={formData.ewDate || ''}
                    onChange={(e) => setFormData({ ...formData, ewDate: e.target.value })}
                    className="w-full px-2 py-1 border rounded text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">เอกสารตรวจรับเลขที่</label>
                  <input
                    type="text"
                    value={formData.inspectDocNo || ''}
                    onChange={(e) => setFormData({ ...formData, inspectDocNo: e.target.value })}
                    className="w-full px-2 py-1 border rounded text-xs outline-none"
                    placeholder="-"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">เลขที่ PUR- (ใบสั่งซื้อ)</label>
                  <input
                    type="text"
                    value={formData.purNo || ''}
                    onChange={(e) => setFormData({ ...formData, purNo: e.target.value })}
                    className="w-full px-2 py-1 border rounded text-xs outline-none"
                    placeholder="-"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-0.5">เลขบันทึกพัสดุ RFQ-</label>
                  <input
                    type="text"
                    value={formData.rfqNo || ''}
                    onChange={(e) => setFormData({ ...formData, rfqNo: e.target.value })}
                    className="w-full px-2 py-1 border rounded text-xs outline-none"
                    placeholder="-"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: รหัสร้านค้า/ผู้ขาย */}
          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/10 space-y-3">
            <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
              <h4 className="font-bold text-emerald-800 text-xs sm:text-sm">
                🏬 2. รหัสร้านค้า/ผู้ขาย (VENDOR)
              </h4>
              <button
                type="button"
                className="px-2.5 py-1 text-xs bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
              >
                🔍 Popup เลือกตามร้านค้า
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสร้านค้า (Vendor Code)</label>
                <input
                  type="text"
                  value={formData.vendorCode || ''}
                  onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none"
                  placeholder="เช่น V-001 (หากไม่มี Pop-up ให้พิมพ์เพิ่ม)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อร้านค้า / บริษัทผู้ขาย</label>
                <select
                  value={formData.vendorName || ''}
                  onChange={(e) => {
                    const selected = vendors.find((v) => v.name === e.target.value);
                    setFormData({
                      ...formData,
                      vendorName: e.target.value,
                      vendorCode: selected?.taxId || formData.vendorCode,
                    });
                  }}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                >
                  <option value="">-- เลือกบริษัท / ร้านค้า --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: ผู้จัดทำ TOR / กรรมการ */}
          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/10 space-y-3">
            <h4 className="font-bold text-emerald-800 text-xs sm:text-sm border-b border-emerald-200 pb-2">
              👤 3. ผู้จัดทำ TOR / ประธานกรรมการ / กรรมการตรวจรับ
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ผู้จัดทำ TOR / คุณลักษณะ</label>
                <select
                  value={formData.torMaker || ''}
                  onChange={(e) => setFormData({ ...formData, torMaker: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                >
                  <option value="">เลือกรหัสหรือชื่อตัวอย่าง...</option>
                  {staffMembers.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ผู้กำหนดราคาชี้แจง</label>
                <select
                  value={formData.committeeChair || ''}
                  onChange={(e) => setFormData({ ...formData, committeeChair: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                >
                  <option value="">เลือกรหัสหรือชื่อตัวอย่าง...</option>
                  {staffMembers.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ผู้ตรวจรับพัสดุ / กรรมการ</label>
                <select
                  value={formData.committeeMember || ''}
                  onChange={(e) => setFormData({ ...formData, committeeMember: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                >
                  <option value="">เลือกชื่อกรรมการตรวจรับ...</option>
                  {staffMembers.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: รายการพัสดุและ VAT 7% */}
          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/10 space-y-3">
            <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
              <h4 className="font-bold text-emerald-800 text-xs sm:text-sm">
                🏷️ 4. รายการพัสดุขอซื้อ และการคิดภาษี VAT 7%
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 text-xs bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
              >
                + เพิ่มรายการพัสดุ
              </button>
            </div>

            {/* ตารางพัสดุ */}
            <div className="overflow-x-auto border rounded-xl bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs border-b">
                    <th className="p-2 w-10 text-center">#</th>
                    <th className="p-2 w-28">รหัสพัสดุ</th>
                    <th className="p-2">รายละเอียดรายการพัสดุ</th>
                    <th className="p-2 w-20 text-center">จำนวน</th>
                    <th className="p-2 w-20 text-center">หน่วยนับ</th>
                    <th className="p-2 w-28 text-right">ราคา/หน่วย (บาท)</th>
                    <th className="p-2 w-32 text-right">รวมเงิน (บาท)</th>
                    <th className="p-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {formData.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.code || ''}
                          onChange={(e) => handleItemChange(idx, 'code', e.target.value)}
                          className="w-full px-2 py-1 border rounded outline-none"
                          placeholder="-"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 border rounded outline-none"
                          placeholder="เช่น อุปกรณ์สายเคเบิล, สารเคมีทดลอง..."
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-center outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.unit || 'ชิ้น'}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-center outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.pricePerUnit || 0}
                          onChange={(e) => handleItemChange(idx, 'pricePerUnit', Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-right outline-none"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold text-slate-800">
                        {(item.total || 0).toLocaleString()} ฿
                      </td>
                      <td className="p-2 text-center">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-500 hover:text-rose-700 font-bold"
                            title="ลบรายการ"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ตัวเลือกการคิดภาษี VAT */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                <span className="text-slate-500">📊 การคิดคำนวณภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="vatType"
                    checked={formData.vatType === 'include'}
                    onChange={() => calculateTotals(formData.items, 'include')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  ราคารวม VAT 7% แล้ว
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="vatType"
                    checked={formData.vatType === 'exclude'}
                    onChange={() => calculateTotals(formData.items, 'exclude')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  ราคายังไม่รวม VAT (บวกเพิ่ม 7%)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="vatType"
                    checked={formData.vatType === 'no_vat'}
                    onChange={() => calculateTotals(formData.items, 'no_vat')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  ยกเว้น VAT
                </label>
              </div>

              {/* การ์ดสรุปยอดเงินแบบ 3 กล่อง */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-500 font-medium">ราคาก่อนภาษี (Subtotal)</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">
                    {formData.subtotalAmount?.toLocaleString()} ฿
                  </p>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl text-center">
                  <p className="text-xs text-amber-800 font-medium">ภาษีมูลค่าเพิ่ม (VAT 7%)</p>
                  <p className="text-xl font-bold text-amber-900 mt-1">
                    {formData.vatAmount?.toLocaleString()} ฿
                  </p>
                </div>

                <div className="bg-emerald-600 text-white p-3 rounded-xl text-center shadow-md">
                  <p className="text-xs font-medium text-emerald-100">ยอดสั่งซื้อสุทธิรวม VAT</p>
                  <p className="text-2xl font-extrabold mt-1 tracking-tight">
                    {formData.amount?.toLocaleString()} ฿
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: เอกสารแนบและสถานะ */}
          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/10 space-y-3">
            <h4 className="font-bold text-emerald-800 text-xs sm:text-sm border-b border-emerald-200 pb-2">
              📎 5. แนบรูปถ่ายใบสั่งซื้อ / ใบเสร็จ / ไฟล์เอกสาร (ATTACHMENTS)
            </h4>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <select
                value={formData.attachmentCategory || 'ใบสั่งซื้อ/สั่งจ้าง'}
                onChange={(e) => setFormData({ ...formData, attachmentCategory: e.target.value })}
                className="w-full sm:w-60 px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none text-xs"
              >
                <option value="ใบสั่งซื้อ/สั่งจ้าง">📄 ใบสั่งซื้อ / สั่งจ้าง</option>
                <option value="ใบเสนอราคา">📄 ใบเสนอราคา</option>
                <option value="ใบส่งของ/ใบเสร็จ">📄 ใบส่งของ / ใบเสร็จ</option>
                <option value="เอกสารตรวจรับ">📄 เอกสารตรวจรับ</option>
              </select>

              <label className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg cursor-pointer transition-colors shadow-sm">
                <span>📤 คลิกเพื่อเลือกอัปโหลดไฟล์ / รูปภาพ</span>
                <input type="file" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {formData.attachments?.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {formData.attachments.map((att) => (
                  <div key={att.id} className="flex justify-between items-center text-xs bg-white p-2.5 rounded-lg border">
                    <span className="truncate max-w-xs font-medium text-slate-700">
                      📎 [{att.category}] {att.name} ({att.size})
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        attachments: formData.attachments.filter((a) => a.id !== att.id)
                      })}
                      className="text-rose-600 hover:underline font-bold"
                    >
                      ลบไฟล์
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะจัดซื้อ</label>
                <select
                  value={formData.status || 'รอตรวจรับ (รอของมาส่งและตรวจรับ)'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white outline-none"
                >
                  <option value="รอตรวจรับ (รอของมาส่งและตรวจรับ)">รอตรวจรับ (รอของมาส่งและตรวจรับ)</option>
                  <option value="ตรวจรับแล้ว (อยู่ในขั้นตอนตั้งเบิก)">ตรวจรับแล้ว (อยู่ในขั้นตอนตั้งเบิก)</option>
                  <option value="เบิกจ่ายเรียบร้อย">เบิกจ่ายเรียบร้อย</option>
                  <option value="ยกเลิกการสั่งซื้อ">ยกเลิกการสั่งซื้อ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none"
                  placeholder="เช่น ส่งของช้ากว่ากำหนด, รอเอกสารกำกับภาษีเพิ่มเติม..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all hover:shadow-lg"
            >
              💾 บันทึกข้อมูลใบ PR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
