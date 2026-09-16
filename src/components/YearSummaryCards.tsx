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
  const subtotal = summary?.subtotal ?? summary?.totalSubtotalAmount ?? 0;
  const vat = summary?.vat ?? summary?.totalVatAmount ?? 0;
  const count = summary?.count ?? summary?.totalRecords ?? 0;

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-slate-800">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ยอดรวมก่อนภาษี (SUBTOTAL)
                </p>
                <h3 className="text-3xl font-extrabold mt-2 tracking-tight">
                  ฿{formatCurrency(subtotal)}
                </h3>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl text-2xl border border-slate-700">
                🧮
              </div>
            </div>
            <p className="text-xs text-slate-400">ราคายังไม่รวมภาษีมูลค่าเพิ่ม</p>
          </div>
        </div>

        <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-blue-500">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                  ภาษีมูลค่าเพิ่ม (VAT 7%)
                </p>
                <h3 className="text-3xl font-extrabold mt-2 tracking-tight">
                  ฿{formatCurrency(vat)}
                </h3>
              </div>
              <div className="p-3 bg-blue-500/80 rounded-xl text-2xl border border-blue-400">
                %
              </div>
            </div>
            <p className="text-xs text-blue-100">คำนวณแยกภาษี VAT ให้ระบบ</p>
          </div>
        </div>

        <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-md relative overflow-hidden border border-emerald-500">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  จำนวนใบ PR ทั้งสิ้น
                </p>
                <h3 className="text-3xl font-extrabold mt-2 tracking-tight">
                  {count} <span className="text-lg font-normal">ฉบับ</span>
                </h3>
              </div>
              <div className="p-3 bg-emerald-500/80 rounded-xl text-2xl border border-emerald-400">
                📄
              </div>
            </div>
            <p className="text-xs text-emerald-100">แสดงผลตามรายการที่มีในระบบ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
