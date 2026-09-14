import React from 'react';

interface SummaryData {
  totalAmount: number;
  subtotalAmount: number;
  vatAmount: number;
  totalPrCount: number;
  pendingCount: number;
  pendingAmount: number;
  partialCount: number;
  partialAmount: number;
  completeCount: number;
  completeAmount: number;
  waitingDeliveryCount: number;
  waitingDeliveryAmount: number;
  dueThisMonthCount: number;
  dueThisMonthAmount: number;
}

interface YearSummaryCardsProps {
  summary: SummaryData;
  availableYears: number[];
  currentYear: number;
  onYearChange: (year: number) => void;
}

export const YearSummaryCards: React.FC<YearSummaryCardsProps> = ({
  summary,
  availableYears,
  currentYear,
  onYearChange,
}) => {
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* แถวที่ 1: การ์ดสรุปยอดรวมงบประมาณ (4 การ์ดหลัก - ไล่เฉดสีสว่าง หรูหรา ตัวหนังสือใหญ่ตัวหนา) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* กล่องที่ 1: ยอดสั่งซื้อรวมทั้งปี - ไล่สีเขียวมรกตพรีเมียม (Emerald Mint Gradient) */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[145px] transform hover:-translate-y-1 transition-all border border-emerald-400/30">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-wide text-white drop-shadow-md">
                ยอดสั่งซื้อรวมทั้งปี (รวม VAT)
              </h3>
              <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight drop-shadow">
                {formatCurrency(summary.totalAmount)}
              </p>
            </div>
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md shadow-inner">
              💳
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-emerald-100 z-10">
            <div className="flex items-center gap-2">
              <select
                value={currentYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="bg-black/20 hover:bg-black/30 border border-white/40 text-white rounded-lg px-2.5 py-1 outline-none font-bold cursor-pointer backdrop-blur-md transition-colors"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr} className="bg-slate-900 text-white">
                    ปีงบฯ {yr}
                  </option>
                ))}
              </select>
              <span>· ทั้งหมด {summary.totalPrCount} รายการ</span>
            </div>
          </div>
          {/* ลายน้ำวงกลมซ้อนฉากหลัง */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 border-[14px] border-white/10 rounded-full pointer-events-none" />
        </div>

        {/* กล่องที่ 2: ยอดรวมก่อนภาษี - ไล่สีน้ำเงินเข้มไนท์บลู (Deep Night Sapphire Gradient) */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[145px] transform hover:-translate-y-1 transition-all border border-indigo-500/30">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-wide text-white drop-shadow-md">
                ยอดรวมก่อนภาษี (SUBTOTAL)
              </h3>
              <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight drop-shadow">
                {formatCurrency(summary.subtotalAmount)}
              </p>
            </div>
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md shadow-inner">
              🧮
            </div>
          </div>
          <p className="text-xs text-indigo-200/90 font-bold z-10 mt-4">
            ราคายังไม่รวมภาษีมูลค่าเพิ่ม
          </p>
          <div className="absolute -right-6 -bottom-6 w-36 h-36 border-[14px] border-white/10 rounded-full pointer-events-none" />
        </div>

        {/* กล่องที่ 3: ภาษีมูลค่าเพิ่ม - ไล่สีฟ้าสดใสนีออน (Neon Sky Blue Gradient) */}
        <div className="bg-gradient-to-br from-blue-500 via-sky-600 to-cyan-600 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[145px] transform hover:-translate-y-1 transition-all border border-sky-400/30">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-wide text-white drop-shadow-md">
                ภาษีมูลค่าเพิ่ม (VAT 7%)
              </h3>
              <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight drop-shadow">
                {formatCurrency(summary.vatAmount)}
              </p>
            </div>
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-black backdrop-blur-md shadow-inner">
              %
            </div>
          </div>
          <p className="text-xs text-sky-100 font-bold z-10 mt-4">
            คำนวณแยกภาษี VAT ให้ระบบ
          </p>
          <div className="absolute -right-6 -bottom-6 w-36 h-36 border-[14px] border-white/10 rounded-full pointer-events-none" />
        </div>

        {/* กล่องที่ 4: จำนวนใบ PR ทั้งสิ้น - ไล่สีเขียวเทอร์ควอยซ์สด (Bright Cyan Emerald Gradient) */}
        <div className="bg-gradient-to-br from-teal-500 via-emerald-600 to-green-600 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[145px] transform hover:-translate-y-1 transition-all border border-teal-400/30">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-wide text-white drop-shadow-md">
                จำนวนใบ PR ทั้งสิ้น
              </h3>
              <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight drop-shadow">
                {summary.totalPrCount} <span className="text-xl font-bold">ฉบับ</span>
              </p>
            </div>
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md shadow-inner">
              📄
            </div>
          </div>
          <p className="text-xs text-teal-100 font-bold z-10 mt-4">
            คลิกเพื่อแสดงทุกสถานะ
          </p>
          <div className="absolute -right-6 -bottom-6 w-36 h-36 border-[14px] border-white/10 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* แถวที่ 2: การ์ดแยกตามสถานะการจัดซื้อ (5 การ์ดสีสันสดใส Vibrant Gradient) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. รอตรวจรับ - ไล่เฉดสีส้มเหลืองอมทอง (Amber Sun Gradient) */}
        <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-slate-950 p-4.5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all border border-amber-300 flex flex-col justify-between min-h-[115px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black tracking-wide uppercase bg-slate-950/15 text-slate-950 px-2 py-0.5 rounded-md">
              รอตรวจรับ
            </span>
            <span className="w-7 h-7 bg-slate-950/10 rounded-xl flex items-center justify-center text-xs">⏳</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-950 drop-shadow-sm">
              {summary.pendingCount} <span className="text-xs font-bold">รายการ</span>
            </p>
            <p className="text-xs font-black text-slate-950 mt-0.5 bg-slate-950/10 px-2 py-0.5 rounded-md inline-block">
              {formatCurrency(summary.pendingAmount)}
            </p>
          </div>
        </div>

        {/* 2. รับแล้วบางส่วน - ไล่เฉดสีม่วงนีออนสดใส (Bright Violet Purple Gradient) */}
        <div className="bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 text-white p-4.5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all border border-fuchsia-400 flex flex-col justify-between min-h-[115px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black tracking-wide uppercase bg-white/20 text-white px-2 py-0.5 rounded-md">
              รับแล้วบางส่วน (รอบฯ)
            </span>
            <span className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center text-xs">📦</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-white drop-shadow-sm">
              {summary.partialCount} <span className="text-xs font-bold">รายการ</span>
            </p>
            <p className="text-xs font-black text-purple-100 mt-0.5 bg-white/20 px-2 py-0.5 rounded-md inline-block">
              {formatCurrency(summary.partialAmount)}
            </p>
          </div>
        </div>

        {/* 3. นับของแล้ว (ครบ) - ไล่เฉดสีเขียวสดใส (Vibrant Green Lime Gradient) */}
        <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white p-4.5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all border border-emerald-300 flex flex-col justify-between min-h-[115px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black tracking-wide uppercase bg-white/20 text-white px-2 py-0.5 rounded-md">
              นับของแล้ว (ครบ)
            </span>
            <span className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center text-xs">✅</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-white drop-shadow-sm">
              {summary.completeCount} <span className="text-xs font-bold">รายการ</span>
            </p>
            <p className="text-xs font-black text-emerald-100 mt-0.5 bg-white/20 px-2 py-0.5 rounded-md inline-block">
              {formatCurrency(summary.completeAmount)}
            </p>
          </div>
        </div>

        {/* 4. กำลังรอร้านส่งมอบ - ไล่เฉดสีส้มแสดสด (Bright Orange Amber Gradient) */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white p-4.5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all border border-orange-300 flex flex-col justify-between min-h-[115px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black tracking-wide uppercase bg-white/20 text-white px-2 py-0.5 rounded-md">
              กำลังรอร้านส่งมอบ
            </span>
            <span className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center text-xs">🚚</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-white drop-shadow-sm">
              {summary.waitingDeliveryCount} <span className="text-xs font-bold">รายการ</span>
            </p>
            <p className="text-xs font-black text-orange-100 mt-0.5 bg-white/20 px-2 py-0.5 rounded-md inline-block">
              {formatCurrency(summary.waitingDeliveryAmount)}
            </p>
          </div>
        </div>

        {/* 5. เดือนวันกำหนดส่ง - ไล่เฉดสีแดงเตือนภัยนีออน (Alert Neon Red Rose Gradient) */}
        <div className="bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 text-white p-4.5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all border border-rose-300 flex flex-col justify-between min-h-[115px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black tracking-wide uppercase bg-white/20 text-white px-2 py-0.5 rounded-md">
              เดือนวันกำหนดส่ง
            </span>
            <span className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center text-xs">🚨</span>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-2xl font-black text-white drop-shadow-sm">
                {summary.dueThisMonthCount} <span className="text-xs font-bold">รายการ</span>
              </p>
              <p className="text-xs font-black text-rose-100 mt-0.5">ใกล้กำหนด</p>
            </div>
            <button className="text-xs font-black bg-amber-300 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg shadow transition-colors">
              ส่ง Email
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
