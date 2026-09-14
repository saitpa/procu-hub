import React, { useState } from 'react';
import { PurchaseRecord } from '../types';
import {
  exportPurchaseRecordsToExcel,
} from '../utils/excelExport';
import {
  formatBaht,
  formatNumber,
} from '../utils';
import {
  X,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Building2,
  DollarSign,
  Package,
  Sparkles,
  ArrowDownToLine,
} from 'lucide-react';

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFiscalYear: number;
  availableYears: number[];
  records: PurchaseRecord[]; // Filtered or active records
  allRecords: PurchaseRecord[]; // Complete database records
  notificationEmail: string;
  onExportCSV: () => void;
}

export const ExportExcelModal: React.FC<ExportExcelModalProps> = ({
  isOpen,
  onClose,
  currentFiscalYear,
  availableYears,
  records,
  allRecords,
  notificationEmail,
  onExportCSV,
}) => {
  const [selectedYearOption, setSelectedYearOption] = useState<number | 'all' | 'filtered'>(
    currentFiscalYear
  );
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Determine target records based on user's selection
  let targetRecords: PurchaseRecord[] = [];
  let scopeLabel = '';

  if (selectedYearOption === 'all') {
    targetRecords = allRecords;
    scopeLabel = 'ข้อมูลทุกปีงบประมาณ (ทั้งหมด)';
  } else if (selectedYearOption === 'filtered') {
    targetRecords = records;
    scopeLabel = `ข้อมูลตามตัวกรองปัจจุบัน (${records.length} รายการ)`;
  } else {
    targetRecords = allRecords.filter((r) => r.fiscalYear === selectedYearOption);
    scopeLabel = `เฉพาะปีงบประมาณ พ.ศ. ${selectedYearOption}`;
  }

  // Quick stats
  const totalAmount = targetRecords.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalSubtotal = targetRecords.reduce((sum, r) => sum + (r.subtotalBeforeVat || 0), 0);
  const totalVat = targetRecords.reduce((sum, r) => sum + (r.vatAmount || 0), 0);
  const totalItemsCount = targetRecords.reduce((sum, r) => sum + (r.items?.length || 0), 0);
  const batchRecordsCount = targetRecords.filter(
    (r) => r.receivingRounds && r.receivingRounds.length > 0
  ).length;

  const handleDownloadExcel = () => {
    try {
      setIsExporting(true);
      setSuccessMessage(null);

      const fy = selectedYearOption === 'filtered' ? 'all' : selectedYearOption;
      const filename = exportPurchaseRecordsToExcel({
        fiscalYear: fy,
        records: targetRecords,
        allRecords,
        notificationEmail,
      });

      setSuccessMessage(`ดาวน์โหลดสำเร็จ! บันทึกเป็นไฟล์ "${filename}" เรียบร้อยแล้ว`);
      setTimeout(() => {
        setIsExporting(false);
      }, 500);
    } catch (err: any) {
      setIsExporting(false);
      alert(err?.message || 'เกิดข้อผิดพลาดในการสร้างไฟล์ Excel');
    }
  };

  return (
    <div
      id="export-excel-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 px-5 sm:px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>ส่งออกรายงานสรุปรวมเป็นไฟล์ Excel (.xlsx)</span>
              </h3>
              <p className="text-xs text-emerald-200">
                สาขาวิชาจุลชีววิทยา คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Option Selector: Choose which dataset to export */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>เลือกรอบข้อมูลปีงบประมาณที่ต้องการสรุป:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Selected Fiscal Year */}
              <button
                type="button"
                onClick={() => setSelectedYearOption(currentFiscalYear)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedYearOption === currentFiscalYear
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    ปีงบฯ {currentFiscalYear}
                  </span>
                  {selectedYearOption === currentFiscalYear && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
                <div className="text-2xs text-slate-500">
                  {allRecords.filter((r) => r.fiscalYear === currentFiscalYear).length} รายการ
                  (ปีปัจจุบัน)
                </div>
              </button>

              {/* Option 2: All Fiscal Years */}
              <button
                type="button"
                onClick={() => setSelectedYearOption('all')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedYearOption === 'all'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    ทุกปีงบประมาณ
                  </span>
                  {selectedYearOption === 'all' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
                <div className="text-2xs text-slate-500">
                  {allRecords.length} รายการ (รวมทุกปี)
                </div>
              </button>

              {/* Option 3: Current Filtered View */}
              <button
                type="button"
                onClick={() => setSelectedYearOption('filtered')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedYearOption === 'filtered'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    ตามผลการค้นหา
                  </span>
                  {selectedYearOption === 'filtered' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
                <div className="text-2xs text-slate-500">
                  {records.length} รายการ (ที่กำลังแสดง)
                </div>
              </button>
            </div>
          </div>

          {/* Quick Metrics Summary for the selected export scope */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 mb-2">
              ภาพรวมข้อมูลที่จะส่งออก ({scopeLabel}):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-3xs text-slate-400 font-bold uppercase">จำนวนใบ PR</span>
                <p className="text-base font-black text-slate-900 font-mono">
                  {formatNumber(targetRecords.length)}{' '}
                  <span className="text-2xs font-normal text-slate-500">รายการ</span>
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-3xs text-slate-400 font-bold uppercase">ยอดเงินรวมสุทธิ</span>
                <p className="text-base font-black text-emerald-700 font-mono">
                  {formatBaht(totalAmount)}
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-3xs text-slate-400 font-bold uppercase">ราคาก่อน VAT</span>
                <p className="text-base font-black text-slate-800 font-mono">
                  {formatBaht(totalSubtotal)}
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-3xs text-slate-400 font-bold uppercase">จำนวนรายการพัสดุ</span>
                <p className="text-base font-black text-slate-900 font-mono">
                  {formatNumber(totalItemsCount)}{' '}
                  <span className="text-2xs font-normal text-slate-500">รายการ</span>
                </p>
              </div>
            </div>
          </div>

          {/* Details of What's Inside the Excel File */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>แผ่นงาน (Worksheets) 4 แท็บที่จะได้รับในไฟล์ Excel:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Sheet 1 Card */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  1
                </div>
                <div>
                  <div className="font-bold text-slate-900">สรุปภาพรวมผู้บริหาร</div>
                  <div className="text-2xs text-slate-600 mt-0.5 leading-relaxed">
                    สรุปยอดรวมสุทธิ, คิดแยก VAT 7%, สรุปตามสถานะตรวจรับ, สรุปตามหมวดวัสดุย่อย, และยอดซื้อตามร้านค้า
                  </div>
                </div>
              </div>

              {/* Sheet 2 Card */}
              <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-xl flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  2
                </div>
                <div>
                  <div className="font-bold text-slate-900">ทะเบียนรายการจัดซื้อจัดจ้าง</div>
                  <div className="text-2xs text-slate-600 mt-0.5 leading-relaxed">
                    ตารางคุม PR ละเอียด 38 คอลัมน์ (เลข PR, วันส่งของ, ร้านค้า, ผู้ตรวจรับ, TOR, ราคาก่อน VAT, เลขที่ อว., PUR-)
                  </div>
                </div>
              </div>

              {/* Sheet 3 Card */}
              <div className="p-3 bg-teal-50/50 border border-teal-200/80 rounded-xl flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                  3
                </div>
                <div>
                  <div className="font-bold text-slate-900">รายละเอียดสิ่งของพัสดุ</div>
                  <div className="text-2xs text-slate-600 mt-0.5 leading-relaxed">
                    เจาะลึกพัสดุทุกรายการ: รหัสสินค้า, ชื่อสิ่งของ, จำนวนสั่งซื้อ, จำนวนที่รับแล้ว, จำนวนคงค้าง, ราคา/หน่วย
                  </div>
                </div>
              </div>

              {/* Sheet 4 Card */}
              <div className="p-3 bg-purple-50/50 border border-purple-200/80 rounded-xl flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-700 text-white font-black flex items-center justify-center text-xs shrink-0">
                  4
                </div>
                <div>
                  <div className="font-bold text-slate-900">ประวัติการตรวจรับเป็นรอบ</div>
                  <div className="text-2xs text-slate-600 mt-0.5 leading-relaxed">
                    รายละเอียดการทยอยส่งมอบ: ลำดับรอบ, วันที่รับ, ผู้ตรวจรับ, เลขที่ใบส่งของ/ใบกำกับ, เลขที่ตรวจรับ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Download Actions */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onExportCSV}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-slate-500" />
              <span>ดาวน์โหลดไฟล์ CSV แทน</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={isExporting || targetRecords.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>
                {isExporting ? 'กำลังสร้างไฟล์ Excel...' : 'ดาวน์โหลดไฟล์ Excel (.xlsx) ทันที'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
