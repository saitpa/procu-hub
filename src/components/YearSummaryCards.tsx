import React from 'react';
import { YearSummary } from '../types';
import { formatBaht, formatNumber } from '../utils';
import {
  Wallet,
  Clock,
  CheckCircle2,
  Truck,
  FileText,
  Calculator,
  Percent,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface YearSummaryCardsProps {
  summary: YearSummary;
  selectedStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  onOpenEmailAlerts?: () => void;
}

export const YearSummaryCards: React.FC<YearSummaryCardsProps> = ({
  summary,
  selectedStatusFilter,
  onSelectStatusFilter,
  onOpenEmailAlerts,
}) => {
  return (
    <div className="mb-6 space-y-4">
      {/* 4 Financial & Total Volume Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: ยอดรวมสั่งซื้อทั้งปี (Emerald Green) */}
        <div
          onClick={() => onSelectStatusFilter('all')}
          className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm transition-all duration-150 cursor-pointer hover:shadow-md ${
            selectedStatusFilter === 'all'
              ? 'ring-4 ring-emerald-300 ring-offset-2 scale-[1.01]'
              : 'hover:opacity-95'
          }`}
        >
          {/* Decorative circular watermarks */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full border-4 border-white/10 pointer-events-none" />
          <div className="absolute right-4 -bottom-4 w-18 h-18 rounded-full border-2 border-white/20 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <span className="text-2xs sm:text-xs font-semibold uppercase tracking-wider text-emerald-100">
              ยอดสั่งซื้อรวมทั้งปี (รวม VAT)
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-xs">
              {formatBaht(summary.totalAmount)}
            </div>
            <div className="text-2xs sm:text-xs text-emerald-100 font-medium mt-1">
              ปีงบฯ {summary.fiscalYear} • ทั้งหมด {formatNumber(summary.totalCount)} รายการ
            </div>
          </div>
        </div>

        {/* Card 2: ราคาก่อนภาษี (Deep Navy Blue) */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-sm transition-all duration-150">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full border-4 border-white/10 pointer-events-none" />
          <div className="absolute right-4 -bottom-4 w-18 h-18 rounded-full border-2 border-white/20 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <span className="text-2xs sm:text-xs font-semibold uppercase tracking-wider text-blue-200">
              ยอดรวมก่อนภาษี (Subtotal)
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-xs">
              {formatBaht(summary.totalSubtotalBeforeVat)}
            </div>
            <div className="text-2xs sm:text-xs text-blue-200 font-medium mt-1">
              ราคาที่ยังไม่รวมภาษีมูลค่าเพิ่ม
            </div>
          </div>
        </div>

        {/* Card 3: ภาษีมูลค่าเพิ่ม VAT 7% (Bright Sky Blue) */}
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm transition-all duration-150">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full border-4 border-white/10 pointer-events-none" />
          <div className="absolute right-4 -bottom-4 w-18 h-18 rounded-full border-2 border-white/20 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <span className="text-2xs sm:text-xs font-semibold uppercase tracking-wider text-sky-100">
              ภาษีมูลค่าเพิ่ม (VAT 7%)
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-xs">
              {formatBaht(summary.totalVatAmount)}
            </div>
            <div className="text-2xs sm:text-xs text-sky-100 font-medium mt-1">
              คำนวณแยกภาษี VAT ให้ระบบ
            </div>
          </div>
        </div>

        {/* Card 4: จำนวนใบ PR ทั้งหมด (Teal / Sage Green) */}
        <div
          onClick={() => onSelectStatusFilter('all')}
          className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-sm transition-all duration-150 cursor-pointer"
        >
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full border-4 border-white/10 pointer-events-none" />
          <div className="absolute right-4 -bottom-4 w-18 h-18 rounded-full border-2 border-white/20 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between">
            <span className="text-2xs sm:text-xs font-semibold uppercase tracking-wider text-teal-100">
              จำนวนใบ PR ทั้งสิ้น
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white drop-shadow-xs">
              {formatNumber(summary.totalCount)}{' '}
              <span className="text-base font-normal text-teal-200">ฉบับ</span>
            </div>
            <div className="text-2xs sm:text-xs text-teal-100 font-medium mt-1">
              คลิกเพื่อแสดงทุกสถานะ
            </div>
          </div>
        </div>
      </div>

      {/* 5 Operational Status & Tracking Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 5: รอตรวจรับ (Amber / Orange) */}
        <div
          onClick={() => onSelectStatusFilter('pending_inspection')}
          className={`relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm transition-all duration-150 cursor-pointer ${
            selectedStatusFilter === 'pending_inspection'
              ? 'ring-4 ring-amber-300 ring-offset-2 scale-[1.01]'
              : 'hover:opacity-95'
          }`}
        >
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-amber-100">
              รอตรวจรับ
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-xs">
              {formatNumber(summary.pendingInspectionCount)}{' '}
              <span className="text-xs font-normal text-amber-100">รายการ</span>
            </div>
            <div className="text-2xs text-amber-100 font-medium mt-0.5 truncate">
              {formatBaht(summary.pendingInspectionAmount)}
            </div>
          </div>
        </div>

        {/* Card 6: ทยอยรับเป็นรอบ (Purple / Indigo) */}
        <div
          onClick={() => onSelectStatusFilter('partial_inspected')}
          className={`relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 text-white shadow-sm transition-all duration-150 cursor-pointer ${
            selectedStatusFilter === 'partial_inspected'
              ? 'ring-4 ring-purple-300 ring-offset-2 scale-[1.01]'
              : 'hover:opacity-95'
          }`}
        >
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-purple-200">
              รับแล้วบางส่วน (รอบๆ)
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-xs">
              {formatNumber(summary.partialInspectedCount)}{' '}
              <span className="text-xs font-normal text-purple-200">รายการ</span>
            </div>
            <div className="text-2xs text-purple-200 font-medium mt-0.5 truncate">
              {formatBaht(summary.partialInspectedAmount)}
            </div>
          </div>
        </div>

        {/* Card 7: นับของแล้ว (Emerald Green) */}
        <div
          onClick={() => onSelectStatusFilter('inspected')}
          className={`relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-sm transition-all duration-150 cursor-pointer ${
            selectedStatusFilter === 'inspected'
              ? 'ring-4 ring-emerald-300 ring-offset-2 scale-[1.01]'
              : 'hover:opacity-95'
          }`}
        >
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-emerald-100">
              นับของแล้ว (ครบ)
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-xs">
              {formatNumber(summary.inspectedCount)}{' '}
              <span className="text-xs font-normal text-emerald-200">รายการ</span>
            </div>
            <div className="text-2xs text-emerald-100 font-medium mt-0.5 truncate">
              {formatBaht(summary.inspectedAmount)}
            </div>
          </div>
        </div>

        {/* Card 8: กำลังรอร้านส่งมอบ (Sunset Orange) */}
        <div
          onClick={() => onSelectStatusFilter('ordering')}
          className={`relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm transition-all duration-150 cursor-pointer ${
            selectedStatusFilter === 'ordering'
              ? 'ring-4 ring-orange-300 ring-offset-2 scale-[1.01]'
              : 'hover:opacity-95'
          }`}
        >
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-orange-100">
              กำลังรอร้านส่งมอบ
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-xs">
              {formatNumber(summary.orderingCount)}{' '}
              <span className="text-xs font-normal text-orange-100">รายการ</span>
            </div>
            <div className="text-2xs text-orange-100 font-medium mt-0.5 truncate">
              {formatBaht(summary.orderingAmount)}
            </div>
          </div>
        </div>

        {/* Card 9: เตือนวันกำหนดส่ง (Coral Rose / Red) */}
        <div
          onClick={() => {
            if (onOpenEmailAlerts) onOpenEmailAlerts();
          }}
          className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-sm transition-all duration-150 cursor-pointer hover:opacity-95"
        >
          <div className="relative z-10 flex items-start justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-rose-100 flex items-center gap-1">
              <span>เตือนวันกำหนดส่ง</span>
              {(summary.overdueCount > 0 || summary.nearDueCount > 0) && (
                <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
              )}
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="relative z-10 mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-xs">
              {summary.overdueCount + summary.nearDueCount}{' '}
              <span className="text-xs font-normal text-rose-200">รายการ</span>
            </div>
            <div className="text-2xs text-rose-100 font-medium mt-0.5 flex items-center justify-between">
              <span>
                {summary.overdueCount > 0 ? `เกินกำหนด ${summary.overdueCount}` : 'ใกล้กำหนด'}
              </span>
              <span className="underline font-bold text-yellow-200">ส่ง Email</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
