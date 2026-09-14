import React, { useState } from 'react';
import { Vendor } from '../types';
import { X, Search, Store, Plus, Check, Phone, MapPin, Building } from 'lucide-react';

interface VendorSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: Vendor[];
  onSelectVendor: (vendor: Vendor) => void;
  onAddNewVendor: (newVendor: Vendor) => void;
  selectedVendorCode?: string;
}

export const VendorSelectModal: React.FC<VendorSelectModalProps> = ({
  isOpen,
  onClose,
  vendors,
  onSelectVendor,
  onAddNewVendor,
  selectedVendorCode,
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New vendor form fields
  const nextVendorCode = `V-${String(vendors.length + 1).padStart(3, '0')}`;
  const [newCode, setNewCode] = useState(nextVendorCode);
  const [newName, setNewName] = useState('');
  const [newTaxId, setNewTaxId] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newContact, setNewContact] = useState('');

  const filteredVendors = vendors.filter((v) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      v.code.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      (v.taxId && v.taxId.includes(q)) ||
      (v.phone && v.phone.includes(q))
    );
  });

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const created: Vendor = {
      id: `ven-${Date.now()}`,
      code: newCode.trim(),
      name: newName.trim(),
      taxId: newTaxId.trim() || undefined,
      phone: newPhone.trim() || undefined,
      address: newAddress.trim() || undefined,
      contactPerson: newContact.trim() || undefined,
    };

    onAddNewVendor(created);
    onSelectVendor(created);
    setIsAddingNew(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Mint Green theme */}
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                เลือกร้านค้า / บริษัทคู่ค้า (Vendor Directory)
              </h3>
              <p className="text-xs text-emerald-100">
                เลือกรหัสร้านค้าที่ผูกไว้ เพื่อดึงข้อมูลเข้าใบ PR อัตโนมัติ
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

        {/* Content */}
        <div className="p-6">
          {!isAddingNew ? (
            <>
              {/* Search Bar & Add button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ค้นหารหัสร้านค้า (เช่น V-001) หรือชื่อร้าน, เลขผู้เสียภาษี..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มร้านค้าใหม่</span>
                </button>
              </div>

              {/* Vendor List */}
              <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {filteredVendors.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
                    ไม่พบข้อมูลร้านค้าที่ค้นหา
                  </div>
                ) : (
                  filteredVendors.map((vendor) => {
                    const isSelected = selectedVendorCode === vendor.code;
                    return (
                      <div
                        key={vendor.id}
                        onClick={() => {
                          onSelectVendor(vendor);
                          onClose();
                        }}
                        className={`p-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/90 border-l-4 border-l-emerald-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-300 shrink-0 mt-0.5">
                            {vendor.code}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {vendor.name}
                            </h4>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-2xs text-slate-500">
                              {vendor.taxId && (
                                <span>เลขผู้เสียภาษี: {vendor.taxId}</span>
                              )}
                              {vendor.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {vendor.phone}
                                </span>
                              )}
                              {vendor.contactPerson && (
                                <span>ผู้ติดต่อ: {vendor.contactPerson}</span>
                              )}
                            </div>
                            {vendor.address && (
                              <p className="text-2xs text-slate-400 truncate mt-0.5 max-w-md">
                                {vendor.address}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>เลือกอยู่</span>
                            </>
                          ) : (
                            <span>เลือก</span>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* Add New Vendor Form */
            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">
                  กรอกข้อมูลเพิ่มร้านค้าใหม่
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  กลับไปค้นหาร้านค้า
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสร้านค้า <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="เช่น V-007"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold font-mono text-emerald-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อร้านค้า / บริษัท <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="เช่น บริษัท ออฟฟิศ แอนด์ แล็บ จำกัด"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขประจำตัวผู้เสียภาษี
                  </label>
                  <input
                    type="text"
                    value={newTaxId}
                    onChange={(e) => setNewTaxId(e.target.value)}
                    placeholder="13 หลัก เช่น 0405558001234"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อ
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="เช่น 043-123-456 หรือ 081-xxx-xxxx"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ผู้ติดต่อ / ฝ่ายขาย
                </label>
                <input
                  type="text"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="เช่น คุณกมลวรรณ (ฝ่ายขายราชการ)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ที่อยู่ร้านค้า / สำนักงาน
                </label>
                <textarea
                  rows={2}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="ที่อยู่สำหรับออกใบกำกับภาษีหรือติดต่อ..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  บันทึกร้านค้าและเลือกทันที
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
