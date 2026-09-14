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
  Lock,
  Unlock
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
  // เพิ่มตัวแปรสำหรับระบบแอดมินเข้ามา
  isAdmin?: boolean;
  onAdminToggle?: () => void;
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
  isAdmin = false,
  onAdminToggle
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md select-none">
      {/* แถบบนสุด: ชื่อมหาวิทยาลัย */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between border-b border-white/10 text-xs font-medium text-slate-300">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-amber-400" />
          <span>สาขาวิชาจุลชีววิทยา คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</span>
        </div>
        
        {/* ส่วนล็อกอินแอดมินด้วยกุญแจหน้าชื่ออีเมล */}
        <div 
          onClick={onAdminToggle}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full cursor-pointer transition-all ${
            isAdmin 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'hover:bg-white/10 text-slate-300'
          }`}
          title={isAdmin ? "คลิกเพื่อออกจากระบบแอดมิน" : "คลิกเพื่อเข้าสู่ระบบแอดมิน"}
        >
          {isAdmin ? (
            <Unlock className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span className="font-mono">{userEmail || 'saitpa@kku.ac.th'}</span>
          {isAdmin && <span className="text-[10px] bg-green-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">ADMIN</span>}
        </div>
      </div>

      {/* แถบล่าง: ชื่อระบบ (เอาตัวเลข พ.ศ. 2568 ออกแล้ว) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-inner">
              <FileSpreadsheet className="h-8 w-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                ระบบบันทึกการจัดซื้อจัดจ้างวัสดุและครุภัณฑ์
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                บันทึกเลขที่ PR • เตือนวันส่งของ • รหัสร้านค้า • คิดแยก VAT 7% • สรุปยอดรวมทั้งปีในหน้าแดชบอร์ดแรก
              </p>
            </div>
          </div>

          {/* ปุ่มสั่งการต่าง ๆ ขวามือ */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenEmailAlerts}
              className="relative p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              title="การแจ้งเตือนอีเมล"
            >
              <BellRing className="h-5 w-5 text-slate-300" />
              {dueAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-between" style={{ justifyContent: 'center' }}>
                  {dueAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenAdminConfig}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
              title="ตั้งค่าข้อมูลหลัก"
            >
              <Settings className="h-5 w-5 text-slate-300" />
            </button>

            <button
              onClick={onOpenExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/20 border border-emerald-500/30 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>ส่งออก Excel</span>
            </button>

            <button
              onClick={onOpenNewModal}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-950/20 border border-blue-500/30 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>เพิ่มบันทึก PR ใหม่</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
