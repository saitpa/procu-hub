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
    <div className="space-y-5">
      {/* แถวที่ 1: การ์ดสรุปยอดรวมงบประมาณ (4 การ์ดหลัก) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* กล่องที่ 1: ยอดสั่งซื้อรวมทั้งปี (สีเขียวมิ้นท์สว่าง #00A97F) */}
        <div className="bg-[#00A97F] text-white p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start z-10">
            <div>
              {/* หัวข้อตัวใหญ่ขึ้น และเป็นตัวหนา */}
              <h3 className="text-base sm:text-lg font-extrabold tracking-wide text-white drop-shadow-sm">
                ยอดสั่งซื้อรวมทั้งปี (รวม VAT)
              </h3>
              <p className="text-3xl font-black mt-2 tracking-tight">
                {formatCurrency(summary.totalAmount)}
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm">
              💳
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-emerald-100 z-10">
            <div className="flex items-center gap-2">
              <select
                value={currentYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="bg-black/20 border border-white/30 text-white rounded-md px-2 py-0.5 outline-none font-bold cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr} className="bg-slate-800 text-white">
                    ปีงบฯ {yr}
                  </option>
                ))}
              </select>
              <span>· ทั้งหมด {summary.totalPrCount} รายการ</span>
            </div>
          </div>
          {/* ลายน้ำวงกลมซ้อนหลังการ์ด */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 border-[12px] border-white/10 rounded-full pointer-events-none" />
        </div>

        {/* กล่องที่ 2: ยอดรวมก่อนภาษี (สีน้ำเงินเข้มกรมท่า #1E295D) */}
        <div className="bg-[#1E295D] text-white p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start z-10">
            <div>
              {/* หัวข้อตัวใหญ่ขึ้น และเป็นตัวหนา */}
              <h3 className="text-base sm:text-lg font-extrabold tracking-wide text-white drop-shadow-sm">
                ยอดรวมก่อนภาษี (SUBTOTAL)
              </h3>
              <p className="text-3xl font-black mt-2 tracking-tight">
                {formatCurrency(summary.subtotalAmount)}
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm">
              🧮
            </div>
          </div>
          <p className="text-xs text-indigo-200 mt-3 font-semibold z-10">
            ราคายังไม่รวมภาษีมูลค่าเพิ่ม
          </p>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 border-[12px] border-white/10 rounded-full pointer-events-none" />
        </div>

        {/* กล่องที่ 3: ภาษีมูลค่าเพิ่ม (สีฟ้า bright blue #0080FF) */}
        <div className="bg-[#0080FF] text-white p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start z-10">
            <div>
              {/* หัวข้อตัวใหญ่ขึ้น และเป็นตัวหนา */}
              <h3 className="text-base sm:text-lg font-extrabold tracking-wide text-white drop-shadow-sm">
                ภาษีมูลค่าเพิ่ม (VAT 7%)
              </h3>
              <p className="text-3xl font-black mt-2 tracking-tight">
                {formatCurrency(summary.vatAmount)}
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold backdrop-blur-sm">
              %
            </div>
          </div>
          <p className="text-xs text-sky-100 mt-3 font-semibold z-10">
            คำนวณแยกภาษี VAT ให้ระบบ
          </p>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 border-[12px] border-white/10 rounded-full pointer-events-none" />
        </div>

        {/* กล่องที่ 4: จำนวนใบ PR ทั้งสิ้น (สีเขียวมรกต #00A36C) */}
        <div className="bg-[#00A36C] text-white p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start z-10">
            <div>
              {/* หัวข้อตัวใหญ่ขึ้น และเป็นตัวหนา */}
              <h3 className="text-base sm:text-lg font-extrabold tracking-wide text-white drop-shadow-sm">
                จำนวนใบ PR ทั้งสิ้น
              </h3>
              <p className="text-3xl font-black mt-2 tracking-tight">
                {summary.totalPrCount} <span className="text-lg font-bold">ฉบับ</span>
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm">
              📄
            </div>
          </div>
          <p className="text-xs text-emerald-100 mt-3 font-semibold z-10">
            คลิกเพื่อแสดงทุกสถานะ
          </p>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 border-[12px] border-white/10 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* แถวที่ 2: การ์ดแยกตามสถานะการจัดซื้อ (5 การ์ดโทนสีตรงตามรูปเป๊ะ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. รอตรวจรับ (#FF9900 สีส้มสด) */}
        <div className="bg-[#FF9900] text-white p-4 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-center z-10">
            <span className="text-sm font-extrabold">รอตรวจรับ</span>
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">⏳</span>
          </div>
          <div className="mt-2 z-10">
            <p className="text-xl font-black">{summary.pendingCount} <span className="text-xs font-semibold">รายการ</span></p>
            <p className="text-xs font-bold text-amber-100 mt-0.5">{formatCurrency(summary.pendingAmount)}</p>
          </div>
        </div>

        {/* 2. รับแล้วบางส่วน (#5B21B6 สีม่วงสด) */}
        <div className="bg-[#5B21B6] text-white p-4 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-center z-10">
            <span className="text-sm font-extrabold">รับแล้วบางส่วน (รอบฯ)</span>
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">📦</span>
          </div>
          <div className="mt-2 z-10">
            <p className="text-xl font-black">{summary.partialCount} <span className="text-xs font-semibold">รายการ</span></p>
            <p className="text-xs font-bold text-purple-200 mt-0.5">{formatCurrency(summary.partialAmount)}</p>
          </div>
        </div>

        {/* 3. นับของแล้ว ครบ (#009951 สีเขียวสด) */}
        <div className="bg-[#009951] text-white p-4 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-center z-10">
            <span className="text-sm font-extrabold">นับของแล้ว (ครบ)</span>
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✅</span>
          </div>
          <div className="mt-2 z-10">
            <p className="text-xl font-black">{summary.completeCount} <span className="text-xs font-semibold">รายการ</span></p>
            <p className="text-xs font-bold text-emerald-100 mt-0.5">{formatCurrency(summary.completeAmount)}</p>
          </div>
        </div>

        {/* 4. กำลังรอร้านส่งมอบ (#FF6600 สีส้มแสด) */}
        <div className="bg-[#FF6600] text-white p-4 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-center z-10">
            <span className="text-sm font-extrabold">กำลังรอร้านส่งมอบ</span>
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">🚚</span>
          </div>
          <div className="mt-2 z-10">
            <p className="text-xl font-black">{summary.waitingDeliveryCount} <span className="text-xs font-semibold">รายการ</span></p>
            <p className="text-xs font-bold text-orange-100 mt-0.5">{formatCurrency(summary.waitingDeliveryAmount)}</p>
          </div>
        </div>

        {/* 5. เดือนวันกำหนดส่ง (#FF0033 สีแดงสด มีปุ่มส่ง Email) */}
        <div className="bg-[#FF0033] text-white p-4 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-center z-10">
            <span className="text-sm font-extrabold">เดือนวันกำหนดส่ง</span>
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">🚨</span>
          </div>
          <div className="mt-2 flex items-end justify-between z-10">
            <div>
              <p className="text-xl font-black">{summary.dueThisMonthCount} <span className="text-xs font-semibold">รายการ</span></p>
              <p className="text-xs font-bold text-rose-100 mt-0.5">ใกล้กำหนด</p>
            </div>
            <button className="text-xs font-bold bg-amber-300 hover:bg-amber-400 text-slate-900 px-2.5 py-1 rounded-md shadow-sm transition-colors">
              ส่ง Email
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
