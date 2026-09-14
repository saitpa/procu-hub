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
      {/* แถวที่ 1: การ์ดสรุปยอดรวมงบประมาณ (4 การ์ดหลัก - ไล่เฉดสีสดใสพรีเมียม) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ยอดสั่งซื้อรวมทั้งปี */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden transform hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">ยอดสั่งซื้อรวมทั้งปี (รวม VAT)</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight drop-shadow-sm">
                {formatCurrency(summary.totalAmount)}
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <select
                  value={currentYear}
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  className="bg-white/20 hover:bg-white/30 border border-white/40 text-xs text-white rounded-lg px-2.5 py-1 outline-none font-bold cursor-pointer backdrop-blur-md transition-colors"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr} className="bg-slate-800 text-white">
                      ปีงบฯ {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl text-2xl backdrop-blur-md shadow-inner">💳</div>
          </div>
        </div>

        {/* ยอดรวมก่อนภาษี */}
        <div className="bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-950 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden transform hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">ยอดรวมก่อนภาษี (SUBTOTAL)</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight drop-shadow-sm">
                {formatCurrency(summary.subtotalAmount)}
              </h3>
              <p className="text-xs text-indigo-300 mt-3 font-medium">ราคายังไม่รวมภาษีมูลค่าเพิ่ม</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl text-2xl backdrop-blur-md shadow-inner">🧮</div>
          </div>
        </div>

        {/* ภาษีมูลค่าเพิ่ม */}
        <div className="bg-gradient-to-br from-blue-500 via-sky-600 to-cyan-600 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden transform hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-sky-100 uppercase tracking-wider">ภาษีมูลค่าเพิ่ม (VAT 7%)</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight drop-shadow-sm">
                {formatCurrency(summary.vatAmount)}
              </h3>
              <p className="text-xs text-sky-200 mt-3 font-medium">คำนวณแยกภาษี VAT ให้ระบบ</p>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl text-2xl backdrop-blur-md shadow-inner">%</div>
          </div>
        </div>

        {/* จำนวนใบ PR ทั้งสิ้น */}
        <div className="bg-gradient-to-br from-teal-500 via-emerald-600 to-green-600 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden transform hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-teal-100 uppercase tracking-wider">จำนวนใบ PR ทั้งสิ้น</p>
              <h3 className="text-2xl font-black mt-1 tracking-tight drop-shadow-sm">
                {summary.totalPrCount} <span className="text-base font-normal">ฉบับ</span>
              </h3>
              <p className="text-xs text-teal-200 mt-3 font-medium">รวมเอกสารจัดซื้อทุกสถานะ</p>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl text-2xl backdrop-blur-md shadow-inner">📄</div>
          </div>
        </div>
      </div>

      {/* แถวที่ 2: การ์ดสถานะจัดซื้อ 5 สีสดใสโดดเด่น (Vibrant Status Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. รอตรวจรับ (สีส้มสด Amber/Orange) */}
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-white p-4.5 rounded-2xl shadow-md transform hover:-translate-y-1 transition-all border border-amber-300/40">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold tracking-wide uppercase text-amber-950/80 bg-white/30 px-2 py-0.5 rounded-md">รอตรวจรับ</span>
            <span className="text-lg p-1.5 bg-white/20 rounded-xl">⏳</span>
          </div>
          <p className="text-2xl font-extrabold mt-3 drop-shadow-sm">{summary.pendingCount} <span className="text-xs font-normal">รายการ</span></p>
          <p className="text-xs text-amber-950 font-bold mt-1 bg-amber-300/40 px-2 py-1 rounded-lg inline-block">{formatCurrency(summary.pendingAmount)}</p>
        </div>

        {/* 2. รับแล้วบางส่วน (สีม่วงนีออน Purple/Violet) */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4.5 rounded-2xl shadow-md transform hover:-translate-y-1 transition-all border border-purple-400/40">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold tracking-wide uppercase text-purple-100 bg-white/20 px-2 py-0.5 rounded-md">รับแล้วบางส่วน (รอบฯ)</span>
            <span className="text-lg p-1.5 bg-white/20 rounded-xl">📦</span>
          </div>
          <p className="text-2xl font-extrabold mt-3 drop-shadow-sm">{summary.partialCount} <span className="text-xs font-normal">รายการ</span></p>
          <p className="text-xs text-purple-200 font-bold mt-1 bg-purple-700/50 px-2 py-1 rounded-lg inline-block">{formatCurrency(summary.partialAmount)}</p>
        </div>

        {/* 3. นับของแล้ว ครบ (สีเขียวสด Emerald/Green) */}
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-4.5 rounded-2xl shadow-md transform hover:-translate-y-1 transition-all border border-emerald-300/40">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold tracking-wide uppercase text-emerald-950/80 bg-white/30 px-2 py-0.5 rounded-md">นับของแล้ว (ครบ)</span>
            <span className="text-lg p-1.5 bg-white/20 rounded-xl">✅</span>
          </div>
          <p className="text-2xl font-extrabold mt-3 drop-shadow-sm">{summary.completeCount} <span className="text-xs font-normal">รายการ</span></p>
          <p className="text-xs text-emerald-950 font-bold mt-1 bg-emerald-300/40 px-2 py-1 rounded-lg inline-block">{formatCurrency(summary.completeAmount)}</p>
        </div>

        {/* 4. กำลังรอร้านส่งมอบ (สีแสดแคนดี้ Orange/Amber) */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-4.5 rounded-2xl shadow-md transform hover:-translate-y-1 transition-all border border-orange-300/40">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold tracking-wide uppercase text-orange-950/80 bg-white/30 px-2 py-0.5 rounded-md">กำลังรอร้านส่งมอบ</span>
            <span className="text-lg p-1.5 bg-white/20 rounded-xl">🚚</span>
          </div>
          <p className="text-2xl font-extrabold mt-3 drop-shadow-sm">{summary.waitingDeliveryCount} <span className="text-xs font-normal">รายการ</span></p>
          <p className="text-xs text-orange-950 font-bold mt-1 bg-orange-300/40 px-2 py-1 rounded-lg inline-block">{formatCurrency(summary.waitingDeliveryAmount)}</p>
        </div>

        {/* 5. เดือนวันกำหนดส่ง (สีแดงเตือนภัย Rose/Red) */}
        <div className="bg-gradient-to-br from-rose-500 to-red-600 text-white p-4.5 rounded-2xl shadow-md transform hover:-translate-y-1 transition-all border border-rose-300/40">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold tracking-wide uppercase text-rose-100 bg-white/20 px-2 py-0.5 rounded-md">เดือนวันกำหนดส่ง</span>
            <span className="text-lg p-1.5 bg-white/20 rounded-xl">🚨</span>
          </div>
          <p className="text-2xl font-extrabold mt-3 drop-shadow-sm">{summary.dueThisMonthCount} <span className="text-xs font-normal">รายการ</span></p>
          <p className="text-xs text-rose-100 font-bold mt-1 bg-rose-700/50 px-2 py-1 rounded-lg inline-block">{formatCurrency(summary.dueThisMonthAmount)}</p>
        </div>
      </div>
    </div>
  );
};
