import React, { useState, useEffect } from 'react';

interface PurchaseRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRecord?: any;
  vendors: any[];
  staffMembers: any[];
  materialSubtypes: string[];
  currentFiscalYear: number;
  onSave: (record: any) => void;
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
  const [formData, setFormData] = useState<any>({
    id: `rec-${Date.now()}`,
    prNumber: '',
    title: '',
    vendorName: '',
    amount: 0,
    category: 'วัสดุวิทยาศาสตร์',
    subType: materialSubtypes[0] || 'ทั่วไป',
    status: 'กำลังรอร้านส่งมอบ',
    fiscalYear: currentFiscalYear,
    deliveryDueDate: '',
    committee: [],
    attachments: [],
    notes: '',
  });

  useEffect(() => {
    if (editingRecord) {
      setFormData(editingRecord);
    } else {
      setFormData({
        id: `rec-${Date.now()}`,
        prNumber: `PR-${currentFiscalYear}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: '',
        vendorName: vendors[0]?.name || '',
        amount: 0,
        category: 'วัสดุวิทยาศาสตร์',
        subType: materialSubtypes[0] || 'ทั่วไป',
        status: 'กำลังรอร้านส่งมอบ',
        fiscalYear: currentFiscalYear,
        deliveryDueDate: new Date().toISOString().split('T')[0],
        committee: [],
        attachments: [],
        notes: '',
      });
    }
  }, [editingRecord, currentFiscalYear, vendors, materialSubtypes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">
            {editingRecord ? '✏️ แก้ไขบันทึก PR' : '➕ เพิ่มบันทึก PR ใหม่'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">เลขที่ PR</label>
              <input
                type="text"
                required
                value={formData.prNumber || ''}
                onChange={(e) => setFormData({ ...formData, prNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ปีงบประมาณ</label>
              <input
                type="number"
                required
                value={formData.fiscalYear || currentFiscalYear}
                onChange={(e) => setFormData({ ...formData, fiscalYear: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อรายการ / คำอธิบาย</label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ระบุชื่อรายการพัสดุ..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ร้านค้า / ผู้จำหน่าย</label>
              <input
                type="text"
                required
                value={formData.vendorName || ''}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ระบุชื่อร้านค้า..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={formData.amount || 0}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">ประเภทวัสดุ</label>
              <select
                value={formData.category || 'วัสดุวิทยาศาสตร์'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="วัสดุวิทยาศาสตร์">วัสดุวิทยาศาสตร์</option>
                <option value="วัสดุสำนักงาน">วัสดุสำนักงาน</option>
                <option value="ครุภัณฑ์">ครุภัณฑ์</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">สถานะ</label>
              <select
                value={formData.status || 'กำลังรอร้านส่งมอบ'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="กำลังรอร้านส่งมอบ">กำลังรอร้านส่งมอบ</option>
                <option value="รอตรวจรับ">รอตรวจรับ</option>
                <option value="รับแล้วบางส่วน (รอบฯ)">รับแล้วบางส่วน (รอบฯ)</option>
                <option value="นับของแล้ว (ครบ)">นับของแล้ว (ครบ)</option>
                <option value="เดือนวันกำหนดส่ง">เดือนวันกำหนดส่ง</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">กำหนดส่งมอบ</label>
            <input
              type="date"
              value={formData.deliveryDueDate || ''}
              onChange={(e) => setFormData({ ...formData, deliveryDueDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">หมายเหตุ</label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="บันทึกรายละเอียดเพิ่มเติม..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
