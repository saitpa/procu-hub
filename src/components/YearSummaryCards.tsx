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
      {/* แถวที่ 1: การ์ดสรุปยอดรวมหลัก (โทนสีน้ำเงินเข้ม หรูหรา สะอาดตา) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ยอดสั่งซื้อรวมทั้งปี - น้ำเงินเข้มอมเขียวมรกต */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-5 rounded-2xl shadow-xl border border-blue-800/40 relative overflow-hidden transform hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">ยอดสั่งซื้อรวมทั้งปี (รวม VAT)</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight text-white drop-shadow">
                {formatCurrency(summary.totalAmount)}
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <select
                  value={currentYear}
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  className="bg-blue-900/60 hover:bg-blue-800/80 border border-blue-500/40 text-xs text-blue-100 rounded-lg px-2.5 py-1 outline-none font-bold cursor-pointer backdrop-blur-md transition-colors"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr} className="bg-slate-900 text-white">
                      ปีงบฯ {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-3 bg-blue-600/20 border border-blue-400/30 rounded-2xl text-2xl backdrop-blur-md shadow-inner text-blue-300">💳</div>
          </div>
        </div>

        {/* ยอดรวมก่อนภาษี - น้ำเงินเข้ม ไนท์บลู */}
        <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white p-5 rounded-2xl shadow-xl border border-blue-800/40 relative overflow-hidden transform hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">ยอดรวมก่อนภาษี (SUBTOTAL)</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight text-white drop-shadow">
                {formatCurrency(summary.subtotalAmount)}
              </h3>
              <p className="text-xs text-blue-300/80 mt-3 font-medium">ราคายังไม่รวมภาษีมูลค่าเพิ่ม</p>
            </div>
            <div className="p-3 bg-blue-600/20 border border-blue-400/30 rounded-2xl text-2xl backdrop-blur-md shadow-inner text-blue-300">🧮</div>
          </div>
        </div>

        {/* ภาษีมูลค่าเพิ่ม - น้ำเงินแซฟไฟร์ Deep Royal Blue */}
        <div className="bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-xl border border-blue-800/40 relative overflow-hidden transform hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">ภาษีมูลค่าเพิ่ม (VAT 7%)</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight text-white drop-shadow">
                {formatCurrency(summary.vatAmount)}
              </h3>
              <p className="text-xs text-blue-300/80 mt-3 font-medium">คำนวณแยกภาษี VAT ให้ระบบ</p>
            </div>
            <div className="p-3 bg-blue-600/20 border border-blue-400/30 rounded-2xl text-2xl backdrop-blur-md shadow-inner text-blue-300">%</div>
          </div>
        </div>

        {/* จำนวนใบ PR ทั้งสิ้น - น้ำเงินเนวี่ Navy Blue */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-5 rounded-2xl shadow-xl border border-blue-800/40 relative overflow-hidden transform hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">จำนวนใบ PR ทั้งสิ้น</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight text-white drop-shadow">
                {summary.totalPrCount} <span className="text-base font-normal text-blue-200">ฉบับ</span>
              </h3>
              <p className="text-xs text-blue-300/80 mt-3 font-medium">รวมเอกสารจัดซื้อทุกสถานะ</p>
            </div>
            <div className="p-3 bg-blue-600/20 border border-blue-400/30 rounded-2xl text-2xl backdrop-blur-md shadow-inner text-blue-300">📄</div>
          </div>
        </div>
      </div>

      {/* แถวที่ 2: การ์ดแยกตามสถานะ (ปรับเป็นสีสันสดใสสว่าง คอนทราสต์ชัดเจน Vibrant Bright Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. รอตรวจรับ - เหลืองส้มสดใส Bright Amber/Yellow */}
        <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-slate-900 p-4.5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all border border-amber-300">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold tracking-wide uppercase bg-slate-900/15 text-slate-900 px-2 py-0.5 rounded-md">
              รอตรวจรับ
            </span>
            <span className="text-lg p-1.5 bg-slate-900/10 rounded-xl">⏳</span>
          </div>
          <p className="text-2xl font-black mt-3 drop-shadow-sm text-slate-900">
            {summary.pendingCount} <span className="text-xs font-bold">รายการ</span>
          </p>
          <p className="text-xs text-slate-900 font-black mt-1 bg-slate-900/10 px-2 py-1 rounded-lg inline-block">
            {formatCurrency(summary.pendingAmount)}
          </p>
        </div>

        {/* 2. รับแล้วบางส่วน - ม่วงนีออนสดใส Bright Neon Purple */}
        <div className="bg-gradient-to-br from-fuchsia-600 via-purple-600 to-violet-600 text-white p-4.5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all border border-fuchsia-400">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold tracking-wide uppercase bg-white/20 text-white px-2 py-0.5 rounded-md">
              รับแล้วบางส่วน (รอบฯ)
            </span>
            <span className="text-lg p-1.5 bg-white/20 rounded-xl">📦</span>
          </div>
          <p className="text-2xl font-black mt-3 drop-shadow-sm text-white">
            {summary.partialCount} <span className="text-xs font-bold">รายการ</span>
          </p>
          <p className="text-xs text-white font-black mt-1 bg-white/20 px-2 py-1 rounded-lg inline-block">
            {formatCurrency(summary.partialAmount)}
          </p>
        </div>

        {/* 3. นับของแล้ว (ครบ) - เขียวมะนาวสดใส Bright Lime/Emerald */}
        <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white p-4.5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all border border-emerald-300">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold tracking-wide uppercase bg-white/20 text-white px-2 py-0.5 rounded-md">
              นับของแล้ว (ครบ)
            </span>
            <span className="text-lg p-1.5 bg-white/20 rounded-xl">✅</span>
          </div>
          <p className="text-2xl font-black mt-3 drop-shadow-sm text-white">
            {summary.completeCount} <span className="text-xs font-bold">รายการ</span>
          </p>
          <p className="text-xs text-white font-black mt-1 bg-white/20 px-2 py-1 rounded-lg inline-block">
            {formatCurrency(summary.completeAmount)}
          </p>
        </div>

        {/* 4. กำลังรอร้านส่งมอบ - ส้มแสดสดใส Vibrant Bright Orange */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white p-4.5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all border border-orange-300">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold tracking-wide uppercase bg-white/20 text-white px-2 py-0.5 rounded-md">
              กำลังรอร้านส่งมอบ
            </span>
            <span className="text-lg p-1.5 bg-white/20 rounded-xl">🚚</span>
          </div>
          <p className="text-2xl font-black mt-3 drop-shadow-sm text-white">
            {summary.waitingDeliveryCount} <span className="text-xs font-bold">รายการ</span>
          </p>
          <p className="text-xs text-white font-black mt-1 bg-white/20 px-2 py-1 rounded-lg inline-block">
            {formatCurrency(summary.waitingDeliveryAmount)}
          </p>
        </div>

        {/* 5. เดือนวันกำหนดส่ง - แดงนีออนเตือนภัย Bright Neon Red */}
        <div className="bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 text-white p-4.5 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all border border-rose-300 animate-pulse">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold tracking-wide uppercase bg-white/20 text-white px-2 py-0.5 rounded-md">
              เดือนวันกำหนดส่ง
            </span>
            <span className="text-lg p-1.5 bg-white/20 rounded-xl">🚨</span>
          </div>
          <p className="text-2xl font-black mt-3 drop-shadow-sm text-white">
            {summary.dueThisMonthCount} <span className="text-xs font-bold">รายการ</span>
          </p>
          <p className="text-xs text-white font-black mt-1 bg-white/20 px-2 py-1 rounded-lg inline-block">
            {formatCurrency(summary.dueThisMonthAmount)}
          </p>
        </div>
      </div>
    </div>
  );
};
