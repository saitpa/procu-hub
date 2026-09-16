import React from 'react';
import { formatCurrency } from '../utils';

interface YearSummaryCardsProps {
  summary: any;
  availableYears: number[];
  currentYear: number | string;
  onYearChange: (year: number | string) => void;
}

export const YearSummaryCards: React.FC<YearSummaryCardsProps> = ({
  summary,
  availableYears,
  currentYear,
  onYearChange,
}) => {
  // ดึงค่ายอดเงิน
  const totalAmount = summary?.totalAmount ?? summary?.totalGrandAmount ?? summary?.total ?? 0;
  const subtotal = summary?.subtotalAmount ?? summary?.totalSubtotalAmount ?? summary?.subtotal ?? 0;
  const vat = summary?.vatAmount ?? summary?.totalVatAmount ?? summary?.vat ?? 0;
  const count = summary?.totalRecords ?? summary?.count ?? 0;

  // ดึงจำนวนรายการตามสถานะต่างๆ
  const orderingCount = summary?.orderingCount ?? summary?.pendingCount ?? 0;
  const partialCount = summary?.partialCount ?? 0;
  const inspectedCount = summary?.inspectedCount ?? summary?.completedCount ?? 0;
  const overdueCount = summary?.overdueCount ?? 0;
  const cancelledCount = summary?.cancelledCount ?? 0;

  return (
    <div className="space-y-4">
      {/* 📅 ตัวเลือกปีงบประมาณ */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">📅 เลือกปีงบประมาณ:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onYearChange('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentYear === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด
            </button>
            {(availableYears || []).map((yr) => (
              <button
                key={yr}
                onClick={() => onYearChange(yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  Number(currentYear) === Number(yr)
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                พ.ศ. {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🎯 แถวที่ 1: การ์ดสรุปยอดเงินหลัก 4 กล่อง */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ยอดเงินจัดซื้อรวม (รวม VAT) */}
        <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-md relative overflow-hidden border border-emerald-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                ยอดเงินจัดซื้อรวม (รวม VAT)
              </p>
              <h3 className="text-2xl font-extrabold mt-1 tracking-tight">
                ฿{formatCurrency(totalAmount)}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/80 rounded-xl text-xl border border-emerald-400">
              📊
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-emerald-100">
            <span>ปีงบประมาณ {currentYear === 'all' ? 'ทั้งหมด' : currentYear}</span>
            <span className="bg-emerald-700/60 px-2 py-0.5 rounded-md">รวมทุกรายการ</span>
          </div>
        </div>

        {/* 2. ยอดรวมก่อนภาษี (SUBTOTAL) */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md relative overflow-hidden border border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                ยอดรวมก่อนภาษี (SUBTOTAL)
              </p>
              <h3 className="text-2xl font-extrabold mt-1 tracking-tight">
                ฿{formatCurrency(subtotal)}
              </h3>
            </div>
            <div className="p-2.5 bg-slate-800 rounded-xl text-xl border border-slate-700">
              🧮
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">ราคายังไม่รวมภาษีมูลค่าเพิ่ม</p>
        </div>

        {/* 3. ภาษีมูลค่าเพิ่ม (VAT 7%) */}
        <div className="bg-blue-600 text-white rounded-2xl p-5 shadow-md relative overflow-hidden border border-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                ภาษีมูลค่าเพิ่ม (VAT 7%)
              </p>
              <h3 className="text-2xl font-extrabold mt-1 tracking-tight">
                ฿{formatCurrency(vat)}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-500/80 rounded-xl text-xl border border-blue-400">
              %
            </div>
          </div>
          <p className="text-xs text-blue-100 mt-3">คำนวณแยกภาษี VAT ให้ระบบ</p>
        </div>

        {/* 4. จำนวนใบ PR ทั้งสิ้น */}
        <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-md relative overflow-hidden border border-emerald-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                จำนวนใบ PR ทั้งสิ้น
              </p>
              <h3 className="text-2xl font-extrabold mt-1 tracking-tight">
                {count} <span className="text-sm font-normal">ฉบับ</span>
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/80 rounded-xl text-xl border border-emerald-400">
              📄
            </div>
          </div>
          <p className="text-xs text-emerald-100 mt-3">แสดงผลตามรายการที่มีในระบบ</p>
        </div>
      </div>

      {/* 🎯 แถวที่ 2: การ์ดสรุปสถานะและแจ้งเตือน 5 กล่อง */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. รอตรวจรับ */}
        <div className="bg-amber-500 text-white rounded-2xl p-4 shadow-sm border border-amber-400">
          <p className="text-xs font-semibold text-amber-100">รอตรวจรับ</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-2xl font-bold">{orderingCount}</h4>
            <span className="text-xs font-normal">รายการ</span>
          </div>
        </div>

        {/* 2. ตรวจรับบางส่วน */}
        <div className="bg-purple-600 text-white rounded-2xl p-4 shadow-sm border border-purple-500">
          <p className="text-xs font-semibold text-purple-100">ตรวจรับบางส่วน</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-2xl font-bold">{partialCount}</h4>
            <span className="text-xs font-normal">รายการ</span>
          </div>
        </div>

        {/* 3. ตรวจรับแล้ว */}
        <div className="bg-emerald-500 text-white rounded-2xl p-4 shadow-sm border border-emerald-400">
          <p className="text-xs font-semibold text-emerald-100">ตรวจรับแล้ว</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-2xl font-bold">{inspectedCount}</h4>
            <span className="text-xs font-normal">รายการ</span>
          </div>
        </div>

        {/* 4. เกินกำหนดส่งมอบ */}
        <div className="bg-orange-600 text-white rounded-2xl p-4 shadow-sm border border-orange-500">
          <p className="text-xs font-semibold text-orange-100">เกินกำหนดส่งมอบ</p>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-2xl font-bold">{overdueCount}</h4>
            <span className="text-xs font-normal">รายการ</span>
          </div>
        </div>

        {/* 5. ยกเลิกรายการ */}
        <div className="bg-red-600 text-white rounded-2xl p-4 shadow-sm border border-red-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-red-100">ยกเลิกรายการ</p>
            <span className="bg-red-700 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">ยกเลิก</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-2xl font-bold">{cancelledCount}</h4>
            <span className="text-xs font-normal">รายการ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
