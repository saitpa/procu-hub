import React, { useState } from 'react';
import { PurchaseRecord, AttachmentFile } from '../types';
import {
  formatBaht,
  formatThaiDate,
  STATUS_CONFIG,
  CATEGORY_CONFIG,
  formatFileSize,
  getDueDateStatus,
  getItemReceivedStats,
  getOverallReceivingProgress,
} from '../utils';
import {
  X,
  Printer,
  Calendar,
  User,
  Building2,
  Receipt,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Truck,
  Edit2,
  Trash2,
  ExternalLink,
  Store,
  UserCheck,
  Calculator,
  AlertTriangle,
  Tag,
  Layers,
  Package,
  Check,
} from 'lucide-react';

interface PurchaseRecordDetailModalProps {
  record: PurchaseRecord | null;
  onClose: () => void;
  onEdit: (record: PurchaseRecord) => void;
  onDelete: (id: string) => void;
  onQuickInspect: (record: PurchaseRecord) => void;
  onAddAttachments: (recordId: string, newFiles: AttachmentFile[]) => void;
  onViewAttachment: (att: AttachmentFile) => void;
}

export const PurchaseRecordDetailModal: React.FC<
  PurchaseRecordDetailModalProps
> = ({
  record,
  onClose,
  onEdit,
  onDelete,
  onQuickInspect,
  onAddAttachments,
  onViewAttachment,
}) => {
  if (!record) return null;

  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const statusMeta = STATUS_CONFIG[record.status] || STATUS_CONFIG.pending_inspection;
  const categoryMeta = CATEGORY_CONFIG[record.category] || CATEGORY_CONFIG.material;
  const dueDateStatus = getDueDateStatus(record.deliveryDueDate, record.status);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray: File[] = Array.from(files);
    const addedFiles: AttachmentFile[] = [];

    let count = 0;
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addedFiles.push({
          id: `att-add-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'image/jpeg',
          dataUrl,
          category: file.type.startsWith('image/') ? 'photo' : 'receipt',
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        });

        count++;
        if (count === filesArray.length) {
          onAddAttachments(record.id, addedFiles);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-900 to-indigo-950 text-white font-bold text-sm tracking-wide shadow-2xs font-mono">
              {record.prNumber}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.badge}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryMeta.badge}`}
            >
              {categoryMeta.label}
            </span>
            {record.materialSubType && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-700" />
                {record.materialSubType}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="พิมพ์ใบสรุปรายการนี้"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="แก้ไขข้อมูล"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 rounded-lg px-2 py-1 text-xs">
                <span className="font-bold text-rose-700 text-2xs">ต้องการลบ?</span>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(record.id);
                    onClose();
                  }}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-2xs font-bold transition-colors cursor-pointer"
                >
                  ยืนยันลบ
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-1.5 py-0.5 bg-white border border-slate-300 text-slate-700 rounded text-2xs cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="ลบรายการนี้"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title & Amount Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {record.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  วันที่ขอซื้อ: {formatThaiDate(record.requestDate)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  ผู้ขอซื้อ: {record.requester}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  งบฯ: {record.budgetSource} (ปี {record.fiscalYear})
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 shrink-0">
              <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
                ยอดจัดซื้อสุทธิรวม VAT
              </span>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {formatBaht(record.totalAmount)}
              </span>
            </div>
          </div>

          {/* 1. Due Date Alert Card */}
          {record.deliveryDueDate && (
            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              dueDateStatus ? dueDateStatus.badgeClass : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>
                  <strong>วันครบกำหนดส่งมอบ:</strong> {formatThaiDate(record.deliveryDueDate)}
                </span>
              </div>
              {dueDateStatus && (
                <span className="font-bold text-xs">
                  {dueDateStatus.text}
                </span>
              )}
            </div>
          )}

          {/* 2. Vendor & Officers Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Vendor info */}
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5 mb-1">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>ร้านค้าคู่ค้า (Vendor)</span>
              </div>
              <div className="text-slate-800 font-semibold">
                {record.vendorName || '-'}
              </div>
              {record.vendorCode && (
                <div className="mt-1 text-2xs font-mono text-emerald-700">
                  รหัสร้านค้า: <span className="font-bold">{record.vendorCode}</span>
                </div>
              )}
            </div>

            {/* Committee / Officers */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>ผู้จัดทำและตรวจรับ</span>
              </div>
              <div className="space-y-0.5 text-2xs text-slate-600">
                <div>
                  <span className="font-medium text-slate-500">ผู้จัดทำ TOR:</span>{' '}
                  <span className="font-semibold text-slate-800">{record.torMaker || '-'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500">ผู้ทำราคากลาง:</span>{' '}
                  <span className="font-semibold text-slate-800">{record.priceEstimator || '-'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500">ผู้ตรวจรับ:</span>{' '}
                  <span className="font-semibold text-slate-800">{record.inspectorName || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Receiving & Inspection Status Banners */}
          {record.status === 'partial_inspected' && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-700" />
                    <span>สถานะ: ทยอยรับพัสดุเป็นรอบๆ (รับแล้วบางส่วน)</span>
                  </h4>
                  <p className="text-xs text-purple-800 mt-0.5">
                    บันทึกการส่งมอบไปแล้ว {record.receivingRounds?.length || 1} รอบ ยังคงมีรายการค้างส่งมอบ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onQuickInspect(record);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Layers className="w-4 h-4" />
                  <span>+ บันทึกตรวจรับรอบถัดไป</span>
                </button>
              </div>

              {/* Progress bar */}
              {(() => {
                const prog = getOverallReceivingProgress(record);
                return (
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-950 mb-1.5">
                      <span>ความคืบหน้าการรับของรวมทั้งหมด</span>
                      <span>{prog.percentage}% ({prog.totalReceived} / {prog.totalOrdered} ชิ้น)</span>
                    </div>
                    <div className="w-full bg-purple-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all"
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Quick Inspection Prompt if pending inspection */}
          {record.status === 'pending_inspection' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>สถานะ: อยู่ระหว่างรอตรวจรับพัสดุ</span>
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  รองรับทั้งการตรวจรับครบ 100% ในครั้งเดียว หรือเริ่มบันทึกการทยอยรับเป็นรอบๆ
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickInspect(record);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกตรวจรับ / ทยอยรับเป็นรอบ</span>
              </button>
            </div>
          )}

          {/* Inspected Record Details if inspected */}
          {record.status === 'inspected' && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>บันทึกการตรวจนับของ (ตรวจรับครบถ้วนสมบูรณ์แล้ว)</span>
                </h4>
                {record.inspectedDate && (
                  <span className="text-xs text-emerald-800 font-medium">
                    วันที่นับของ: {formatThaiDate(record.inspectedDate)}
                  </span>
                )}
              </div>
              {record.inspectedBy && (
                <p className="text-xs text-emerald-800 mt-1">
                  <span className="font-semibold">ผู้นับของ/ผู้ตรวจรับ:</span> {record.inspectedBy}
                </p>
              )}
              {record.inspectionNote && (
                <div className="mt-2 p-2.5 bg-white rounded-lg border border-emerald-100 text-xs text-slate-700">
                  <span className="font-semibold text-emerald-900">สภาพ/ผลการนับ:</span>{' '}
                  {record.inspectionNote}
                </div>
              )}
            </div>
          )}

          {/* Dedicated Section: Receiving Rounds History (If rounds exist) */}
          {record.receivingRounds && record.receivingRounds.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-700" />
                  <span>ประวัติการตรวจรับพัสดุแต่ละรอบ ({record.receivingRounds.length} รอบ)</span>
                </h4>
                {record.status === 'partial_inspected' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onQuickInspect(record);
                    }}
                    className="text-xs text-purple-700 font-bold hover:underline cursor-pointer"
                  >
                    + บันทึกรอบถัดไป
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {record.receivingRounds.map((rnd) => (
                  <div
                    key={rnd.id}
                    className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-purple-800 text-white font-bold flex items-center justify-center text-xs">
                          #{rnd.roundNumber}
                        </span>
                        <span className="font-bold text-slate-900">
                          ตรวจรับรอบที่ {rnd.roundNumber}
                        </span>
                        <span className="text-slate-500 font-medium">
                          วันที่ {formatThaiDate(rnd.receivedDate)}
                        </span>
                      </div>
                      <span className="text-slate-600">
                        ผู้ตรวจรับ: <strong className="text-slate-800">{rnd.receivedBy}</strong>
                      </span>
                    </div>

                    {/* Reference docs & notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400">เลขที่ใบส่งของ/ใบกำกับ:</span>{' '}
                        <strong className="text-slate-800 font-mono">
                          {rnd.deliveryNoteNumber || '-'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">เลขที่เอกสารตรวจรับ:</span>{' '}
                        <strong className="text-slate-800 font-mono">
                          {rnd.inspectionDocNumber || '-'}
                        </strong>
                      </div>
                      {rnd.note && (
                        <div className="sm:col-span-2 text-slate-700 pt-1 border-t border-slate-100">
                          <span className="text-slate-400">ผลการตรวจนับ:</span> {rnd.note}
                        </div>
                      )}
                    </div>

                    {/* Items table in this round */}
                    {rnd.items && rnd.items.length > 0 && (
                      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <table className="w-full text-2xs text-left">
                          <thead className="bg-slate-100/70 text-slate-700">
                            <tr>
                              <th className="py-1.5 px-2.5">รายการพัสดุ</th>
                              <th className="py-1.5 px-2.5 text-center">สั่งซื้อ</th>
                              <th className="py-1.5 px-2.5 text-center font-bold text-purple-900 bg-purple-50">
                                รับรอบนี้
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rnd.items.map((it) => (
                              <tr key={it.itemId}>
                                <td className="py-1.5 px-2.5 text-slate-800">{it.itemName}</td>
                                <td className="py-1.5 px-2.5 text-center text-slate-500 font-mono">
                                  {it.orderedQuantity} {it.unit}
                                </td>
                                <td className="py-1.5 px-2.5 text-center font-bold font-mono text-purple-900 bg-purple-50/50">
                                  {it.receivedQuantity} {it.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Round attachments */}
                    {rnd.attachments && rnd.attachments.length > 0 && (
                      <div className="pt-1">
                        <div className="text-3xs font-semibold text-slate-500 mb-1">
                          รูปถ่าย/เอกสารแนบประจำรอบนี้:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rnd.attachments.map((att) => (
                            <button
                              key={att.id}
                              type="button"
                              onClick={() => onViewAttachment(att)}
                              className="inline-flex items-center gap-1.5 px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-2xs font-medium cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3 text-purple-700" />
                              <span className="truncate max-w-[140px]">{att.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items Table & VAT Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                รายการสิ่งของที่จัดซื้อ ({record.items.length} รายการ)
              </h4>
              {(record.deliveryType === 'batch' || (record.receivingRounds && record.receivingRounds.length > 0)) && (
                <span className="text-2xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                  รายการนี้ส่งมอบและตรวจรับเป็นรอบ
                </span>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">ลำดับ</th>
                    <th className="py-2.5 px-3">รายการ</th>
                    <th className="py-2.5 px-3 text-center">สั่งซื้อ</th>
                    {(record.deliveryType === 'batch' || (record.receivingRounds && record.receivingRounds.length > 0)) && (
                      <>
                        <th className="py-2.5 px-3 text-center text-emerald-700">รับแล้ว</th>
                        <th className="py-2.5 px-3 text-center text-amber-700">คงค้าง</th>
                      </>
                    )}
                    <th className="py-2.5 px-3 text-right">ราคา/หน่วย</th>
                    <th className="py-2.5 px-3 text-right">รวมเงิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {record.items.map((it, idx) => {
                    const stats = getItemReceivedStats(record, it.id);
                    const isBatch = record.deliveryType === 'batch' || (record.receivingRounds && record.receivingRounds.length > 0);

                    return (
                      <tr key={it.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-900">{it.name}</div>
                          {it.code && it.code !== '-' && (
                            <div className="text-3xs text-slate-500 font-mono">รหัส: {it.code}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-700 font-mono">
                          {it.quantity} {it.unit}
                        </td>
                        {isBatch && (
                          <>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-700 font-mono">
                              {stats.received}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-amber-700 font-mono">
                              {stats.remaining}
                            </td>
                          </>
                        )}
                        <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                          {formatBaht(it.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                          {formatBaht(it.totalPrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* VAT Breakdown Footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-3 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>ราคาก่อนภาษีมูลค่าเพิ่ม (Subtotal):</span>
                  <span className="font-mono font-semibold">
                    {formatBaht(record.subtotalBeforeVat || record.totalAmount / 1.07)}
                  </span>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>
                    ภาษีมูลค่าเพิ่ม (VAT 7%){' '}
                    {record.vatType === 'exempt' ? '(ได้รับการยกเว้น)' : ''}:
                  </span>
                  <span className="font-mono font-semibold">
                    {formatBaht(record.vatAmount || record.totalAmount - (record.totalAmount / 1.07))}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-700 pt-1 border-t border-slate-200">
                  <span>ยอดสุทธิรวมทั้งสิ้น:</span>
                  <span className="font-mono">
                    {formatBaht(record.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments & Photos Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span>รูปถ่ายและไฟล์เอกสารแนบ ({record.attachments.length} ไฟล์)</span>
              </h4>

              {/* Upload extra attachment */}
              <div>
                <input
                  type="file"
                  id="detail-upload-file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="detail-upload-file"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-emerald-700 rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isUploading ? 'กำลังอัปโหลด...' : 'แนบไฟล์/รูปเพิ่ม'}</span>
                </label>
              </div>
            </div>

            {record.attachments.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                ยังไม่มีรูปถ่ายหรือไฟล์เอกสารแนบในรายการนี้
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {record.attachments.map((att) => {
                  const isImage = att.type.startsWith('image/');
                  return (
                    <div
                      key={att.id}
                      onClick={() => onViewAttachment(att)}
                      className="group relative border border-slate-200 hover:border-emerald-400 rounded-xl overflow-hidden bg-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                    >
                      {isImage ? (
                        <div className="aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-slate-100 flex flex-col items-center justify-center text-slate-500 p-2">
                          <FileText className="w-8 h-8 text-emerald-600 mb-1" />
                          <span className="text-2xs text-slate-500 uppercase font-semibold">
                            {att.type.includes('pdf') ? 'PDF' : 'DOCUMENT'}
                          </span>
                        </div>
                      )}

                      <div className="p-2">
                        <div className="text-2xs font-semibold text-slate-800 truncate" title={att.name}>
                          {att.name}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-3xs text-slate-400">
                          <span>{formatFileSize(att.size)}</span>
                          <span className="text-emerald-700 font-medium">คลิกเพื่อดู</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 rounded-xl px-3 py-1.5 text-xs">
                <span className="font-bold text-rose-800">ยืนยันต้องการลบ PR นี้?</span>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(record.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                >
                  ลบทันที
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-700 hover:text-rose-850 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบรายการนี้</span>
              </button>
            )}
            <span className="text-2xs text-slate-400 hidden sm:inline">
              สร้างเมื่อ: {formatThaiDate(record.createdAt)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
