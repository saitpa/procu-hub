import React from 'react';
import {
  Plus,
  Calendar,
  FileSpreadsheet,
  Settings,
  Mail,
  BellRing,
  ShieldCheck,
  User,
  GraduationCap,
} from 'lucide-react';

interface HeaderProps {
  currentFiscalYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
  onOpenNewModal: () => void;
  onOpenExportExcel: () => void;
  onExportCSV: () => void;
  onOpenAdminConfig: () => void;
  onOpenEmailAlerts: () => void;
  dueAlertCount: number;
  userEmail: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentFiscalYear,
  availableYears,
  onYearChange,
  onOpenNewModal,
  onOpenExportExcel,
  onExportCSV,
  onOpenAdminConfig,
  onOpenEmailAlerts,
  dueAlertCount,
  userEmail,
}) => {
  return (
    <header className="relative bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white sticky top-0 z-30 shadow-md border-b border-indigo-900/60 overflow-hidden">
      {/* Decorative concentric circles matching the Subtotal card */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full border-4 border-white/5 pointer-events-none" />
      <div className="absolute right-24 -bottom-6 w-32 h-32 rounded-full border-2 border-white/10 pointer-events-none" />

      {/* Top Banner with University Identity & User Email */}
      <div className="relative z-10 bg-indigo-950/90 px-4 sm:px-6 lg:px-8 py-1.5 border-b border-blue-900/50 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-200">
          <GraduationCap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-medium">สาขาวิชาจุลชีววิทยา คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-mono text-2xs">{userEmail}</span>
            <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-3xs font-semibold">
              ผู้ดูแลระบบ
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3.5 gap-3">
          {/* Emblem & App Title matching reference photo */}
          <div className="flex items-center gap-3">
            {/* University gold/navy emblem icon */}
            <div className="w-11 h-11 rounded-2xl bg-white text-blue-950 flex items-center justify-center font-bold text-xl shadow-md shrink-0 border-2 border-yellow-400">
              <span className="text-2xl" role="img" aria-label="emblem">
                🏛️
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  ระบบบันทึกการจัดซื้อจัดจ้างวัสดุและครุภัณฑ์
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-white/20 text-blue-100 border border-white/20">
                  พ.ศ. {currentFiscalYear}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                บันทึกเลขที่ใบ PR • เตือนวันส่งของ • รหัสร้านค้า • คิดแยก VAT 7% • สรุปยอดรวมทั้งปี ในหน้าแดชบอร์ดแรก
              </p>
            </div>
          </div>

          {/* Action Buttons & Year Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Fiscal Year Selector */}
            <div className="flex items-center bg-blue-950/80 rounded-xl px-2.5 py-1 border border-blue-700/50 text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-300 mr-1.5 shrink-0" />
              <span className="text-blue-200 font-medium mr-1.5">ปีงบฯ:</span>
              <select
                id="fiscal-year-select"
                value={currentFiscalYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                aria-label="เลือกปีงบประมาณ"
                className="bg-white text-blue-950 text-xs font-bold rounded-lg px-2 py-1 border-0 focus:outline-hidden focus:ring-2 focus:ring-yellow-400 cursor-pointer shadow-2xs"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    พ.ศ. {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Alert Button with badge */}
            <button
              id="email-alert-btn"
              onClick={onOpenEmailAlerts}
              type="button"
              className="relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-900 bg-yellow-300 hover:bg-yellow-400 rounded-xl transition-all shadow-xs cursor-pointer"
              title="ตรวจสอบรายการและส่งอีเมลแจ้งเตือนวันกำหนดส่ง"
            >
              <BellRing className="w-3.5 h-3.5 text-slate-900" />
              <span>เตือนกำหนดส่ง</span>
              {dueAlertCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-2xs font-extrabold animate-bounce">
                  {dueAlertCount}
                </span>
              )}
            </button>

            {/* Admin Master Data button */}
            <button
              id="admin-config-btn"
              onClick={onOpenAdminConfig}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl transition-colors shadow-2xs cursor-pointer"
              title="จัดการหมวดวัสดุ, รายชื่อผู้ตรวจรับ/TOR, และรหัสร้านค้า"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">จัดการระบบ</span>
            </button>

            {/* Export Excel (.xlsx) */}
            <button
              id="export-excel-btn"
              onClick={onOpenExportExcel}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 active:bg-emerald-400 rounded-xl transition-all shadow-xs hover:shadow cursor-pointer"
              title="ส่งออกรายงานสรุปรวมทั้งหมดเป็นไฟล์ Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-950" />
              <span>ส่งออก Excel</span>
            </button>

            {/* Add New PR Record Button */}
            <button
              id="add-new-pr-btn"
              onClick={onOpenNewModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-950 bg-white hover:bg-blue-50 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-900 stroke-[3]" />
              <span>บันทึกใบ PR ใหม่</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
