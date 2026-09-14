import React, { useState } from 'react';
import { Vendor, StaffMember } from '../types';
import {
  X,
  Plus,
  Trash2,
  Settings,
  Tags,
  Users,
  Store,
  Mail,
  CheckCircle2,
  AlertCircle,
  BellRing,
  Database,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

interface AdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialSubtypes: string[];
  onUpdateMaterialSubtypes: (subtypes: string[]) => void;
  staffMembers: StaffMember[];
  onUpdateStaffMembers: (staff: StaffMember[]) => void;
  vendors: Vendor[];
  onUpdateVendors: (vendors: Vendor[]) => void;
  notificationEmail: string;
  onUpdateNotificationEmail: (email: string) => void;
  alertDaysBefore: number;
  onUpdateAlertDaysBefore: (days: number) => void;
  onClearAllSampleRecords?: () => void;
  onClearAllRecords?: () => void;
  onResetDefaultData?: () => void;
  sampleRecordsCount?: number;
  totalRecordsCount?: number;
}

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({
  isOpen,
  onClose,
  materialSubtypes,
  onUpdateMaterialSubtypes,
  staffMembers,
  onUpdateStaffMembers,
  vendors,
  onUpdateVendors,
  notificationEmail,
  onUpdateNotificationEmail,
  alertDaysBefore,
  onUpdateAlertDaysBefore,
  onClearAllSampleRecords,
  onClearAllRecords,
  onResetDefaultData,
  sampleRecordsCount = 0,
  totalRecordsCount = 0,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'material' | 'staff' | 'vendors' | 'email' | 'data'>('material');

  // Inline error message state (no alert() in iframe!)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New material subtype input
  const [newMaterialName, setNewMaterialName] = useState('');

  // New staff input
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPosition, setNewStaffPosition] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'tor' | 'price' | 'inspector' | 'all'>('all');

  // Local email state
  const [tempEmail, setTempEmail] = useState(notificationEmail);
  const [tempDays, setTempDays] = useState(alertDaysBefore);
  const [emailSavedMsg, setEmailSavedMsg] = useState(false);

  // Material subtype actions
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!newMaterialName.trim()) return;
    if (materialSubtypes.includes(newMaterialName.trim())) {
      setErrorMessage('มีหมวดหมู่นี้ในระบบแล้ว');
      return;
    }
    onUpdateMaterialSubtypes([...materialSubtypes, newMaterialName.trim()]);
    setNewMaterialName('');
  };

  const handleRemoveMaterial = (name: string) => {
    setErrorMessage(null);
    if (materialSubtypes.length <= 1) {
      setErrorMessage('ต้องมีหมวดหมู่อย่างน้อย 1 หมวด');
      return;
    }
    onUpdateMaterialSubtypes(materialSubtypes.filter((m) => m !== name));
  };

  // Staff actions
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!newStaffName.trim()) return;
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim(),
      position: newStaffPosition.trim() || 'อาจารย์ / บุคลากรสาขาวิชา',
      department: 'สาขาวิชาจุลชีววิทยา คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น',
      role: newStaffRole,
    };
    onUpdateStaffMembers([...staffMembers, newStaff]);
    setNewStaffName('');
    setNewStaffPosition('');
  };

  const handleRemoveStaff = (id: string) => {
    setErrorMessage(null);
    if (staffMembers.length <= 1) {
      setErrorMessage('ต้องมีรายชื่อบุคลากรอย่างน้อย 1 ท่าน');
      return;
    }
    onUpdateStaffMembers(staffMembers.filter((s) => s.id !== id));
  };

  // Vendor actions
  const handleRemoveVendor = (id: string) => {
    onUpdateVendors(vendors.filter((v) => v.id !== id));
  };

  // Save email settings
  const handleSaveEmailSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateNotificationEmail(tempEmail);
    onUpdateAlertDaysBefore(Number(tempDays));
    setEmailSavedMsg(true);
    setTimeout(() => setEmailSavedMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header with Navy / Indigo-Blue theme */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                จัดการฐานข้อมูลระบบและรายชื่อ (Admin Master Data)
              </h3>
              <p className="text-xs text-blue-200">
                เพิ่ม/แก้ไข หมวดหมู่วัสดุ, รายชื่อคณะกรรมการ/ผู้ตรวจรับ, ร้านค้า, และการแจ้งเตือน
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2 gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('material')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'material'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>หมวดวัสดุสิ้นเปลือง ({materialSubtypes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'staff'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>รายชื่อบุคลากร/ผู้ตรวจรับ ({staffMembers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vendors')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vendors'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>รหัสร้านค้า ({vendors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'email'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>การแจ้งเตือนกำหนดส่ง (Email)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-rose-600" />
            <span>จัดการข้อมูลตัวอย่าง & ล้างข้อมูล ({sampleRecordsCount > 0 ? `${sampleRecordsCount} ตัวอย่าง` : '0 ตัวอย่าง'})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Inline Error Notice */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-800 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          {/* 1. MATERIAL SUBTYPES TAB */}
          {activeTab === 'material' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>จัดการหมวดหมู่วัสดุสิ้นเปลือง:</strong> แอดมินสามารถเพิ่มหมวดหมู่ใหม่ เช่น <em>"วัสดุวิทยาศาสตร์"</em> หรือ <em>"วัสดุงานบ้าน"</em> เพื่อให้ผู้ขอซื้อเลือกได้จาก Dropdown ในใบ PR ทันที
                </div>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddMaterial} className="flex gap-2">
                <input
                  type="text"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  placeholder="พิมพ์ชื่อหมวดวัสดุใหม่ เช่น วัสดุวิทยาศาสตร์, วัสดุงานบ้าน..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มหมวด</span>
                </button>
              </form>

              {/* Material Subtypes List */}
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {materialSubtypes.map((name, idx) => (
                  <div
                    key={name}
                    className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-2xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ลบหมวดหมู่นี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. STAFF MEMBERS TAB */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>จัดการรายชื่อบุคลากร (ผู้จัดทำ TOR / ผู้ทำราคากลาง / ผู้ตรวจรับ):</strong> รายชื่อเหล่านี้จะแสดงใน Dropdown ให้เลือกในแบบฟอร์มใบ PR ช่วยลดการพิมพ์ซ้ำและสะกดชื่อถูกต้อง
                </div>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddStaff} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-700">เพิ่มรายชื่ออาจารย์/เจ้าหน้าที่ใหม่</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="text"
                      required
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="ชื่อ-นามสกุล (เช่น ผศ.ดร. ...)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newStaffPosition}
                      onChange={(e) => setNewStaffPosition(e.target.value)}
                      placeholder="ตำแหน่ง (เช่น อาจารย์ประจำสาขา)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">หน้าที่หลัก:</span>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as any)}
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">ใช้ได้ทุกหน้าที่ (TOR/ราคากลาง/ตรวจรับ)</option>
                      <option value="tor">ผู้จัดทำ TOR</option>
                      <option value="price">ผู้ทำราคากลาง</option>
                      <option value="inspector">ผู้ตรวจรับพัสดุ</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>บันทึกรายชื่อ</span>
                  </button>
                </div>
              </form>

              {/* Staff List */}
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[280px] overflow-y-auto">
                {staffMembers.map((staff) => (
                  <div
                    key={staff.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">{staff.name}</div>
                      <div className="text-2xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{staff.position}</span>
                        <span>•</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                          {staff.role === 'tor'
                            ? 'ผู้จัดทำ TOR'
                            : staff.role === 'price'
                            ? 'ผู้ทำราคากลาง'
                            : staff.role === 'inspector'
                            ? 'ผู้ตรวจรับพัสดุ'
                            : 'ทั่วไป (ทุกหน้าที่)'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(staff.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ลบรายชื่อนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. VENDORS TAB */}
          {activeTab === 'vendors' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2">
                <Store className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>รหัสร้านค้าและคู่ค้า (Vendor Master):</strong> สามารถตรวจสอบหรือลบรหัสร้านค้าที่ผูกไว้ในระบบ (เมื่อเพิ่มในใบ PR จะแสดงให้เลือกทันที)
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 shrink-0 mt-0.5">
                        {vendor.code}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900">{vendor.name}</div>
                        <div className="text-2xs text-slate-500 mt-0.5">
                          {vendor.taxId && <span>Tax ID: {vendor.taxId} | </span>}
                          {vendor.phone && <span>โทร: {vendor.phone} | </span>}
                          {vendor.contactPerson && <span>ผู้ติดต่อ: {vendor.contactPerson}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVendor(vendor.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ลบร้านค้านี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. EMAIL ALERTS TAB */}
          {activeTab === 'email' && (
            <form onSubmit={handleSaveEmailSettings} className="space-y-5">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
                <BellRing className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 mb-1">
                    การแจ้งเตือนวันกำหนดส่งของทาง Email (Delivery Due Date Alerts)
                  </h4>
                  <p className="text-emerald-800 leading-relaxed">
                    ระบบจะตรวจสอบวันกำหนดส่งมอบในแต่ละใบ PR หากรายการใดใกล้ถึงวันกำหนดส่ง (เช่น ภายใน 7 วัน) หรือเกินกำหนดส่ง ระบบจะแสดงแถบเตือนสีแดง/ส้ม พร้อมส่งอีเมลแจ้งเตือนสรุปรายการถึงเจ้าหน้าที่สาขาวิชาทันที
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมลผู้รับการแจ้งเตือน (Email Recipient)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    placeholder="saitpa@kku.ac.th"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-2xs text-slate-500 mt-1">
                  ค่าเริ่มต้น: <span className="font-mono text-emerald-700">saitpa@kku.ac.th</span> (สามารถเพิ่มหรือแก้ไขได้)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  แจ้งเตือนล่วงหน้าก่อนถึงวันส่งมอบ (วัน)
                </label>
                <select
                  value={tempDays}
                  onChange={(e) => setTempDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={3}>ล่วงหน้า 3 วัน</option>
                  <option value={5}>ล่วงหน้า 5 วัน</option>
                  <option value={7}>ล่วงหน้า 7 วัน (แนะนำ)</option>
                  <option value={10}>ล่วงหน้า 10 วัน</option>
                  <option value={14}>ล่วงหน้า 14 วัน</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {emailSavedMsg ? (
                  <span className="text-xs text-emerald-700 font-bold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    บันทึกการตั้งค่าอีเมลเรียบร้อยแล้ว
                  </span>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  บันทึกการตั้งค่าแจ้งเตือน
                </button>
              </div>
            </form>
          )}

          {/* 5. DATA & SAMPLE DATA MANAGEMENT TAB */}
          {activeTab === 'data' && (
            <div className="space-y-5">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <div className="font-bold text-sm text-slate-900 mb-1">
                  จัดการฐานข้อมูลรายการจัดซื้อและข้อมูลตัวอย่างเริ่มต้น
                </div>
                <p>
                  คุณสามารถลบข้อมูลตัวอย่าง (Default mock data) ที่ระบบสร้างไว้ให้
                  เพื่อเริ่มต้นใช้งานด้วยฐานข้อมูลว่างเปล่าสำหรับบันทึกรายการจัดซื้อจริงของสาขาวิชา
                </p>
              </div>

              {/* Action 1: Delete Sample Data Only */}
              <div className="p-4 border border-rose-200 bg-rose-50/50 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-sm text-rose-950 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-700" />
                      <span>ลบเฉพาะข้อมูลตัวอย่างเริ่มต้น (PR-68-001 ถึง PR-68-005)</span>
                    </div>
                    <p className="text-xs text-rose-800 mt-1">
                      สถานะ: มีข้อมูลตัวอย่างอยู่ในระบบ{' '}
                      <strong className="font-mono">{sampleRecordsCount}</strong> รายการ (จากทั้งหมด {totalRecordsCount} รายการ)
                    </p>
                    <p className="text-2xs text-slate-500 mt-0.5">
                      * รายการ PR จริงที่คุณสร้างขึ้นเองจะไม่ถูกลบ
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={sampleRecordsCount === 0}
                    onClick={() => {
                      if (onClearAllSampleRecords) {
                        onClearAllSampleRecords();
                        onClose();
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5 shadow-xs ${
                      sampleRecordsCount > 0
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบข้อมูลตัวอย่างทั้งหมด ({sampleRecordsCount})</span>
                  </button>
                </div>
              </div>

              {/* Action 2: Clear All Records */}
              <div className="p-4 border border-slate-200 bg-white rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>ล้างรายการจัดซื้อทั้งหมดในฐานข้อมูล</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      ล้างรายการ PR ทั้งหมด ({totalRecordsCount} รายการ) ให้เป็นหน้าจอว่างเปล่า
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={totalRecordsCount === 0}
                    onClick={() => {
                      if (onClearAllRecords) {
                        onClearAllRecords();
                        onClose();
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5 ${
                      totalRecordsCount > 0
                        ? 'bg-slate-800 hover:bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ล้างข้อมูลจัดซื้อทั้งหมด</span>
                  </button>
                </div>
              </div>

              {/* Action 3: Restore Default Mock Data */}
              <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-sm text-blue-950 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-blue-700" />
                      <span>คืนค่าข้อมูลตัวอย่างเริ่มต้น 5 รายการ</span>
                    </div>
                    <p className="text-xs text-blue-800 mt-1">
                      โหลดชุดข้อมูลสาธิตสำหรับทดสอบระบบกลับมาใหม่
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onResetDefaultData) {
                        onResetDefaultData();
                        onClose();
                      }
                    }}
                    className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>โหลดข้อมูลตัวอย่างกลับมา</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
