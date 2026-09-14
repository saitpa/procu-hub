import React from 'react';

interface HeaderProps {
  isAdmin: boolean;
  onAdminToggle: () => void;
  notificationEmail: string;
  dueAlertCount: number;
  onOpenEmailModal: () => void;
  onOpenAdminConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onAdminToggle,
  notificationEmail,
  dueAlertCount,
  onOpenEmailModal,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800">
      {/* Sub-header แสดงชื่อหน่วยงาน */}
      <div className="bg-slate-950/60 px-4 sm:px-6 lg:px-8 py-1.5 text-xs text-slate-400 border-b border-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span>🎓 สาขาวิชาจุลชีววิทยา คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono">👤 {notificationEmail}</span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* โลโก้และชื่อระบบ */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400 text-2xl shadow-inner">
            📄
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ระบบบันทึกการจัดซื้อจัดจ้างวัสดุและครุภัณฑ์
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              บันทึกเลขที่ PR · เดือนวันส่งของ · รหัสร้านค้า · คิดแยก VAT 7% · สรุปยอดรวมทั้งปีในหน้าแดชบอร์ดแรก
            </p>
          </div>
        </div>

        {/* ปุ่มตั้งค่าเฉพาะการใช้งานหลัก (ไม่มีปุ่ม Excel หรือ ปุ่มเพิ่ม PR แล้ว) */}
        <div className="flex items-center gap-2">
          {/* ปุ่มแจ้งเตือน Email */}
          <button
            type="button"
            onClick={onOpenEmailModal}
            className="relative p-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
            title="ตั้งค่าการแจ้งเตือนอีเมล"
          >
            🔔
            {dueAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                {dueAlertCount}
              </span>
            )}
          </button>

          {/* ปุ่ม Admin Mode */}
          <button
            type="button"
            onClick={onAdminToggle}
            className={`p-2.5 rounded-lg transition-colors border flex items-center gap-1.5 text-sm font-medium cursor-pointer ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title={isAdmin ? "ออกจากโหมดแอดมิน" : "เข้าสู่ระบบแอดมิน"}
          >
            ⚙️ {isAdmin ? 'Admin' : ''}
          </button>
        </div>
      </div>
    </header>
  );
};
