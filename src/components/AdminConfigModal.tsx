import React, { useState } from 'react';

interface AdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: any[];
  setVendors: React.Dispatch<React.SetStateAction<any[]>>;
  staffMembers: any[];
  setStaffMembers: React.Dispatch<React.SetStateAction<any[]>>;
  materialSubtypes: string[];
  setMaterialSubtypes: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({
  isOpen,
  onClose,
  vendors,
  setVendors,
  staffMembers,
  setStaffMembers,
  materialSubtypes,
  setMaterialSubtypes,
}) => {
  const [activeTab, setActiveTab] = useState<'vendors' | 'staff' | 'subtypes'>('vendors');

  // Input states สำหรับเพิ่มข้อมูลใหม่
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorTaxId, setNewVendorTaxId] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('กรรมการตรวจรับ');
  const [newSubtype, setNewSubtype] = useState('');

  if (!isOpen) return null;

  // --- จัดการร้านค้า ---
  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;
    const newVendor = {
      id: `v-${Date.now()}`,
      name: newVendorName.trim(),
      taxId: newVendorTaxId.trim() || '-',
    };
    const updated = [...vendors, newVendor];
    setVendors(updated);
    localStorage.setItem('pr_tracker_vendors', JSON.stringify(updated));
    setNewVendorName('');
    setNewVendorTaxId('');
  };

  const handleDeleteVendor = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้านี้?')) {
      const updated = vendors.filter((v) => v.id !== id);
      setVendors(updated);
      localStorage.setItem('pr_tracker_vendors', JSON.stringify(updated));
    }
  };

  // --- จัดการกรรมการ / เจ้าหน้าที่ ---
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    const newStaff = {
      id: `st-${Date.now()}`,
      name: newStaffName.trim(),
      role: newStaffRole,
    };
    const updated = [...staffMembers, newStaff];
    setStaffMembers(updated);
    localStorage.setItem('pr_tracker_staff', JSON.stringify(updated));
    setNewStaffName('');
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายชื่อนี้?')) {
      const updated = staffMembers.filter((s) => s.id !== id);
      setStaffMembers(updated);
      localStorage.setItem('pr_tracker_staff', JSON.stringify(updated));
    }
  };

  // --- จัดการย่อยประเภทวัสดุ ---
  const handleAddSubtype = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtype.trim() || materialSubtypes.includes(newSubtype.trim())) return;
    const updated = [...materialSubtypes, newSubtype.trim()];
    setMaterialSubtypes(updated);
    localStorage.setItem('pr_tracker_material_subtypes', JSON.stringify(updated));
    setNewSubtype('');
  };

  const handleDeleteSubtype = (item: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบประเภท "${item}"?`)) {
      const updated = materialSubtypes.filter((s) => s !== item);
      setMaterialSubtypes(updated);
      localStorage.setItem('pr_tracker_material_subtypes', JSON.stringify(updated));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            ⚙️ จัดการระบบแอดมิน (Admin Settings)
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'vendors'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🏪 รายชื่อร้านค้า ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'staff'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            👤 รายชื่อกรรมการ ({staffMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('subtypes')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'subtypes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🏷️ ประเภทวัสดุย่อย ({materialSubtypes.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: ร้านค้า */}
          {activeTab === 'vendors' && (
            <div className="space-y-4">
              <form onSubmit={handleAddVendor} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ชื่อร้านค้า/บริษัท..."
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="เลขผู้เสียภาษี (ถ้ามี)"
                  value={newVendorTaxId}
                  onChange={(e) => setNewVendorTaxId(e.target.value)}
                  className="w-40 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  + เพิ่มร้านค้า
                </button>
              </form>

              <div className="border rounded-xl divide-y overflow-hidden max-h-72 overflow-y-auto">
                {vendors.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-400">ไม่มีรายชื่อร้านค้า</p>
                ) : (
                  vendors.map((v) => (
                    <div key={v.id} className="p-3 flex justify-between items-center hover:bg-slate-50 text-sm">
                      <div>
                        <p className="font-semibold text-slate-800">{v.name}</p>
                        <p className="text-xs text-slate-400">เลขประจำตัวผู้เสียภาษี: {v.taxId || '-'}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteVendor(v.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition-colors"
                      >
                        🗑️ ลบ
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: กรรมการ */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <form onSubmit={handleAddStaff} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ชื่อ-นามสกุล..."
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="กรรมการตรวจรับ">กรรมการตรวจรับ</option>
                  <option value="เจ้าหน้าที่พัสดุ">เจ้าหน้าที่พัสดุ</option>
                  <option value="ผู้สั่งซื้อ">ผู้สั่งซื้อ</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  + เพิ่มรายชื่อ
                </button>
              </form>

              <div className="border rounded-xl divide-y overflow-hidden max-h-72 overflow-y-auto">
                {staffMembers.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-400">ไม่มีรายชื่อกรรมการ</p>
                ) : (
                  staffMembers.map((s) => (
                    <div key={s.id} className="p-3 flex justify-between items-center hover:bg-slate-50 text-sm">
                      <div>
                        <p className="font-semibold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-400">ตำแหน่ง: {s.role}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteStaff(s.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition-colors"
                      >
                        🗑️ ลบ
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ย่อยประเภทวัสดุ */}
          {activeTab === 'subtypes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddSubtype} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ชื่อประเภทวัสดุย่อย..."
                  value={newSubtype}
                  onChange={(e) => setNewSubtype(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  + เพิ่มประเภท
                </button>
              </form>

              <div className="border rounded-xl divide-y overflow-hidden max-h-72 overflow-y-auto">
                {materialSubtypes.length === 0 ? (
                  <p className="p-4 text-center text-sm text-slate-400">ไม่มีข้อมูลประเภทวัสดุย่อย</p>
                ) : (
                  materialSubtypes.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center hover:bg-slate-50 text-sm">
                      <span className="font-semibold text-slate-800">{item}</span>
                      <button
                        onClick={() => handleDeleteSubtype(item)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition-colors"
                      >
                        🗑️ ลบ
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
