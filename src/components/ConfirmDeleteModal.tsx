import React from 'react';
import { PurchaseRecord } from '../types';
import { formatBaht, formatThaiDate } from '../utils';
import { Trash2, AlertTriangle, X, CheckCircle2, RotateCcw, ShieldAlert } from 'lucide-react';

export type DeleteModalType =
  | { mode: 'single'; record: PurchaseRecord }
  | { mode: 'all_sample'; sampleCount: number }
  | { mode: 'clear_all'; totalCount: number }
  | { mode: 'reset_default' };

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  modalData: DeleteModalType | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  modalData,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !modalData) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                modalData.mode === 'reset_default'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {modalData.mode === 'reset_default' ? (
                <RotateCcw className="w-6 h-6" />
              ) : modalData.mode === 'all_sample' ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {modalData.mode === 'single' && 'ยืนยันการลบรายการใบ PR'}
                {modalData.mode === 'all_sample' && 'ลบข้อมูลตัวอย่างเริ่มต้นทั้งหมด'}
                {modalData.mode === 'clear_all' && 'ล้างรายการจัดซื้อทั้งหมด'}
                {modalData.mode === 'reset_default' && 'คืนค่าข้อมูลตัวอย่างเริ่มต้น'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {modalData.mode === 'single' && 'การดำเนินการนี้จะลบรายการออกจากระบบ'}
                {modalData.mode === 'all_sample' && 'ลบข้อมูลจำลองเพื่อเตรียมใช้งานจริง'}
                {modalData.mode === 'clear_all' && 'ลบข้อมูลทุกรายการในฐานข้อมูล'}
                {modalData.mode === 'reset_default' && 'โหลดชุดข้อมูลตัวอย่าง 5 รายการกลับมา'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-3">
          {modalData.mode === 'single' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {modalData.record.prNumber}
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatBaht(modalData.record.totalAmount)}
                </span>
              </div>
              <div className="font-medium text-slate-800 line-clamp-2">
                {modalData.record.title}
              </div>
              {modalData.record.vendorName && (
                <div className="text-slate-500 flex items-center gap-1">
                  <span>ร้านค้า:</span>
                  <span className="font-semibold text-slate-700">{modalData.record.vendorName}</span>
                </div>
              )}
              <div className="text-slate-400 text-3xs">
                วันที่ขอซื้อ: {formatThaiDate(modalData.record.requestDate)}
              </div>
            </div>
          )}

          {modalData.mode === 'all_sample' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>จะทำการลบข้อมูลตัวอย่างจำนวน {modalData.sampleCount} รายการ</span>
                </div>
                <p className="text-rose-700 leading-relaxed">
                  ระบบจะลบเฉพาะรายการตัวอย่างเริ่มต้น (PR-68-001 ถึง PR-68-005) ออกจากระบบทั้งหมด
                  เพื่อให้คุณเริ่มต้นกรอกข้อมูลจริงของสาขาวิชาได้อย่างสะอาดและเรียบร้อย
                </p>
              </div>
              <p className="text-2xs text-slate-500 italic">
                * หากคุณได้เคยสร้างรายการ PR จริงไว้ รายการเหล่านั้นจะไม่ถูกลบ
              </p>
            </div>
          )}

          {modalData.mode === 'clear_all' && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                <span>คำเตือน: ลบรายการจัดซื้อทั้งหมด ({modalData.totalCount} รายการ)</span>
              </div>
              <p className="text-rose-700 leading-relaxed">
                การดำเนินการนี้จะล้างข้อมูลรายการจัดซื้อทั้งหมดในฐานข้อมูลทันที
              </p>
            </div>
          )}

          {modalData.mode === 'reset_default' && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-2">
              <p className="leading-relaxed">
                ระบบจะโหลดข้อมูลตัวอย่างเริ่มต้น 5 รายการ (PR-68-001 ถึง PR-68-005)
                พร้อมข้อมูลร้านค้าและรายชื่อบุคลากรตัวอย่างกลับมาให้ใหม่
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              modalData.mode === 'reset_default'
                ? 'bg-blue-800 hover:bg-blue-900'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {modalData.mode === 'reset_default' ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ยืนยันโหลดข้อมูลตัวอย่าง</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {modalData.mode === 'single'
                    ? 'ยืนยันการลบรายการ'
                    : modalData.mode === 'all_sample'
                    ? 'ยืนยันลบข้อมูลตัวอย่างทั้งหมด'
                    : 'ยืนยันล้างข้อมูลทั้งหมด'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
