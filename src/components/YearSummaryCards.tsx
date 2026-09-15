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
  summary: any;
  availableYears: (number | string)[]; // 🟢 เพิ่ม string เพื่อรองรับ 'all'
  currentYear: number | string;       // 🟢 เพิ่ม string
  onYearChange: (year: any) => void;
}

export const YearSummaryCards: React.FC<YearSummaryCardsProps> = ({
  summary,
  availableYears,
  currentYear,
  onYearChange,
}) => {
  // ฟังก์ชันแปลงตัวเลขเงิน พร้อมป้องกันการแสดงผล NaN ให้เป็น 0
  const formatCurrency = (num: number) => {
    const safeNum = isNaN(num) || num === undefined || num === null ? 0 : num;
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(safeNum);
  };

  // ฟังก์ชันแปลงจำนวนรายการ พร้อมป้องกัน NaN ให้เป็น 0
  const formatCount = (count: number) => {
    return isNaN(count) || count === undefined || count === null ? 0 : count;
  };

  return (
    <div className="space-y-4">
      {/* แถวที่ 1: การ์ดสรุปยอดรวมงบประมาณ (4 การ์ดหลัก - ปรับขนาดตัวหนังสือสบายตา) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* กล่องที่ 1: ยอดสั่งซื้อรวมทั้งปี (เขียวสว่าง) */}
        <div className="bg-[#00A97F] text-white p-4.5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-sm font-bold tracking-wide text-white">
                ยอดสั่งซื้อรวมทั้งปี (รวม VAT)
              </h3>
              <p className="text-2xl font-extrabold mt-1.5 tracking-tight">
                {formatCurrency(summary?.totalAmount)}
              </p>
            </div>
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-lg backdrop-blur-sm">
              💳
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-emerald-100 z-10">
            <div className="flex items-center gap-2">
              <select
                value={currentYear}
                onChange={(e) => {
                  const val = e.target.value;
                  onYearChange(val === 'all' ? 'all' : Number(val));
                }}
                className="bg-black/20 border border-white/30 text-white rounded-md px-2 py-0.5 outline-none font-medium cursor-pointer text-xs"
              >
                <option value="all" className="bg-slate-800 text-white">
                  🌐 ทั้งหมด (ทุกปีงบฯ)
                </option>
                {availableYears
                  .filter((yr) => yr !== 'all')
                  .map((yr) => (
                    <option key={yr} value={yr} className="bg-slate-800 text-white">
                      ปีงบฯ {yr}
                    </option>
                  ))}
              </select>
              <span>· ทั้งหมด {formatCount(summary?.totalPrCount)} รายการ</span>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 border-[10px] border-white/10 rounded-full pointer-events-none" />
        </div>

        {/* กล่องที่ 2: ยอดรวมก่อนภาษี (น้ำเงินกรมท่า) */}
        <div className="bg-[#1E295D] text-white p-4.5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-sm font-bold tracking-wide text-white">
                ยอดรวมก่อนภาษี (SUBTOTAL)
              </h3>
              <p className="text-2xl font-extrabold mt-1.5 tracking-tight">
                {formatCurrency(summary?.subtotalAmount)}
              </p>
            </div>
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-lg backdrop-blur-sm">
              🧮
            </div>
          </div>
          <p className="text-xs text-indigo-200 mt-3 font-medium z-10">
            ราคายังไม่รวมภาษีมูลค่าเพิ่ม
          </p>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 border-[10px] border-white/10 rounded-full pointer-events-none" />
        </div>

        {/* กล่องที่ 3: ภาษีมูลค่าเพิ่ม (ฟ้าสดใส) */}
        <div className="bg-[#0080FF] text-white p-4.5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-sm font-bold tracking-wide text-white">
                ภาษีมูลค่าเพิ่ม (VAT 7%)
              </h3>
              <p className="text-2xl font-extrabold mt-1.5 tracking-tight">
                {formatCurrency(summary?.vatAmount)}
              </p>
            </div>
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-lg font-bold backdrop-blur-sm">
              %
            </div>
          </div>
          <p className="text-xs text-sky-100 mt-3 font-medium z-10">
            คำนวณแยกภาษี VAT ให้ระบบ
          </p>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 border-[10px] border-white/10 rounded-full pointer-events-none" />
        </div>

        {/* กล่องที่ 4: จำนวนใบ PR ทั้งสิ้น (เขียวมรกต) */}
        <div className="bg-[#00A36C] text-white p-4.5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-sm font-bold tracking-wide text-white">
                จำนวนใบ PR ทั้งสิ้น
              </h3>
              <p className="text-2xl font-extrabold mt-1.5 tracking-tight">
                {formatCount(summary?.totalPrCount)} <span className="text-sm font-normal">ฉบับ</span>
              </p>
            </div>
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-lg backdrop-blur-sm">
              📄
            </div>
          </div>
          <p className="text-xs text-emerald-100 mt-3 font-medium z-10">
            คลิกเพื่อแสดงทุกสถานะ
          </p>
          <div className="absolute -right-6 -bottom-6 w-28 h-28 border-[10px] border-white/10 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* แถวที่ 2: การ์ดแยกตามสถานะการจัดซื้อ (5 การ์ดสีสันสดใส ขนาดสบายตา) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. รอตรวจรับ (#FF9900) */}
        <div className="bg-[#FF9900] text-white p-4 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[105px]">
          <div className="flex justify-between items-center z-10">
            <span className="text-xs font-bold">รอตรวจรับ</span>
            <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">⏳</span>
          </div>
          <div className="mt-2 z-10">
            <p className="text-lg font-extrabold">{formatCount(summary?.pendingCount)} <span className="text-xs font-normal">รายการ</span></p>
            <p className="text-xs font-medium text-amber-100 mt-0.5">{formatCurrency(summary?.pendingAmount)}</p>
          </div>
        </div>

        {/* 2. รับแล้วบางส่วน (#5B21B6) */}
        <div className="bg-[#5B21B6] text-white p-4 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[105px]">
          <div className="flex justify-between items-center z-10">
            <span className="text-xs font-bold">รับแล้วบางส่วน (รอบฯ)</span>
            <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">📦</span>
          </div>
          <div className="mt-2 z-10">
            <p className="text-lg font-extrabold">{formatCount(summary?.partialCount)} <span className="text-xs font-normal">รายการ</span></p>
            <p className="text-xs font-medium text-purple-200 mt-0.5">{formatCurrency(summary?.partialAmount)}</p>
          </div>
        </div>

        {/* 3. นับของแล้ว ครบ (#009951) */}
        <div className="bg-[#009951] text-white p-4 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[105px]">
          <div className="flex justify-between items-center z-10">
            <span className="text-xs font-bold">นับของแล้ว (ครบ)</span>
            <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">✅</span>
          </div>
          <div className="mt-2 z-10">
            <p className="text-lg font-extrabold">{formatCount(summary?.completeCount)} <span className="text-xs font-normal">รายการ</span></p>
            <p className="text-xs font-medium text-emerald-100 mt-0.5">{formatCurrency(summary?.completeAmount)}</p>
          </div>
        </div>

        {/* 4. กำลังรอร้านส่งมอบ (#FF6600) */}
        <div className="bg-[#FF6600] text-white p-4 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[105px]">
          <div className="flex justify-between items-center z-10">
            <span className="text-xs font-bold">กำลังรอร้านส่งมอบ</span>
            <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">🚚</span>
          </div>
          <div className="mt-2 z-10">
            <p className="text-lg font-extrabold">{formatCount(summary?.waitingDeliveryCount)} <span className="text-xs font-normal">รายการ</span></p>
            <p className="text-xs font-medium text-orange-100 mt-0.5">{formatCurrency(summary?.waitingDeliveryAmount)}</p>
          </div>
        </div>

        {/* 5. เดือนวันกำหนดส่ง (#FF0033) */}
        <div className="bg-[#FF0033] text-white p-4 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[105px]">
          <div className="flex justify-between items-center z-10">
            <span className="text-xs font-bold">เดือนวันกำหนดส่ง</span>
            <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">🚨</span>
          </div>
          <div className="mt-2 flex items-end justify-between z-10">
            <div>
              <p className="text-lg font-extrabold">{formatCount(summary?.dueThisMonthCount)} <span className="text-xs font-normal">รายการ</span></p>
              <p className="text-xs font-medium text-rose-100 mt-0.5">ใกล้กำหนด</p>
            </div>
            <button className="text-[11px] font-bold bg-amber-300 hover:bg-amber-400 text-slate-900 px-2 py-0.5 rounded shadow-sm transition-colors">
              ส่ง Email
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
