import React from 'react';
import { PurchaseRecord, AttachmentFile } from '../types';
import {
  formatBaht,
  formatThaiDate,
  STATUS_CONFIG,
  CATEGORY_CONFIG,
  getDueDateStatus,
  getOverallReceivingProgress,
} from '../utils';
import {
  FileText,
  CheckCircle2,
  Eye,
  Edit2,
  Trash2,
  Store,
  Calendar,
  Tag,
  Layers,
  Plus,
  RotateCcw,
} from 'lucide-react';

interface PurchaseRecordListProps {
  records: PurchaseRecord[];
  isAdmin?: boolean;
  onViewDetail: (record: PurchaseRecord) => void;
  onEdit: (record: PurchaseRecord) => void;
  onDelete: (record: PurchaseRecord) => void;
  onQuickInspect: (record: PurchaseRecord) => void;
  onViewAttachment?: (att: AttachmentFile) => void;
  onAddNewRecord?: () => void;
  onRestoreDefaultData?: () => void;
}

export const PurchaseRecordList: React.FC<PurchaseRecordListProps> = ({
  records,
  isAdmin = false,
  onViewDetail,
  onEdit,
  onDelete,
  onQuickInspect,
  onViewAttachment,
  onAddNewRecord,
  onRestoreDefaultData,
}) => {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-900 border border-blue-100">
          <FileText className="w-8 h-8 text-blue-900" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          ไม่พบบันทึกการจัดซื้อในระบบ
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          ระบบว่างเปล่าพร้อมสำหรับการเริ่มบันทึกรายการจัดซื้อจริงของสาขาวิชาจุลชีววิทยาแล้ว
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onAddNewRecord && (
            <button
              type="button"
              onClick={onAddNewRecord}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4 text-yellow-400 stroke-[3]" />
              <span>บันทึกใบ PR ใหม่</span>
            </button>
          )}
          {onRestoreDefaultData && (
            <button
              type="button"
              onClick={onRestoreDefaultData}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>โหลดข้อมูลตัวอย่างเริ่มต้น</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Desktop / Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white font-semibold text-xs uppercase tracking-wider border-b border-indigo-950">
            <tr>
              <th className="py-3.5 px-4 text-blue-100">เลขที่ PR / วันที่</th>
              <th className="py-3.5 px-4 text-blue-100">รายการจัดซื้อ / ร้านค้า</th>
              <th className="py-3.5 px-4 text-blue-100">กำหนดส่ง / ผู้จัดทำ</th>
              <th className="py-3.5 px-4 text-right text-blue-100">ยอดรวม (VAT)</th>
              <th className="py-3.5 px-4 text-center text-blue-100">ไฟล์/รูปแนบ</th>
              <th className="py-3.5 px-4 text-blue-100">สถานะ / ตรวจรับ</th>
              <th className="py-3.5 px-4 text-center text-blue-100">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((rec: any) => {
              const statusMeta = STATUS_CONFIG[rec.status] || STATUS_CONFIG.pending_inspection;
              const categoryMeta = CATEGORY_CONFIG[rec.category] || CATEGORY_CONFIG.material;
              const dueDateStatus = getDueDateStatus(rec.deliveryDueDate, rec.status);

              // 🟢 ป้องกัน NaN ดึงค่ายอดเงินจากทุกรูปแบบชื่อคอลัมน์
              const rawAmount = rec.amount ?? rec.totalAmount ?? rec.subtotalAmount ?? 0;
              const displayAmount = isNaN(Number(rawAmount)) ? 0 : Number(rawAmount);

              const rawVat = rec.vatAmount ?? rec.vat_amount ?? 0;
              const displayVat = isNaN(Number(rawVat)) ? 0 : Number(rawVat);

              return (
                <tr
                  key={rec.id}
                  className="hover:bg-emerald-50/30 transition-colors group"
                >
                  {/* PR Number & Date */}
                  <td className="py-3.5 px-4 align-top">
                    <button
                      type="button"
                      onClick={() => onViewDetail(rec)}
                      className="font-bold font-mono text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{rec.prNumber}</span>
                    </button>
                    <div className="text-2xs text-slate-400 mt-0.5">
                      {formatThaiDate(rec.prDate || rec.requestDate)}
                    </div>
                  </td>

                  {/* Title, Category & Vendor */}
                  <td className="py-3.5 px-4 align-top max-w-xs lg:max-w-sm">
                    <div
                      onClick={() => onViewDetail(rec)}
                      className="font-semibold text-slate-900 group-hover:text-emerald-950 cursor-pointer line-clamp-2"
                    >
                      {rec.title}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span
                        className={`text-2xs font-medium px-2 py-0.5 rounded-full border ${categoryMeta.badge}`}
                      >
                        {categoryMeta.label}
                      </span>

                      {/* Material Sub-Type Badge */}
                      {(rec.subType || rec.materialSubType) && (
                        <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-emerald-700" />
                          <span>{rec.subType || rec.materialSubType}</span>
                        </span>
                      )}

                      {/* Vendor code and name */}
                      {rec.vendorName && (
                        <span className="text-2xs text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md truncate max-w-[170px] flex items-center gap-1">
                          <Store className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
                          {rec.vendorCode && <strong className="font-mono text-emerald-800">{rec.vendorCode}</strong>}
                          <span>{rec.vendorName}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Delivery Due Date & Officers */}
                  <td className="py-3.5 px-4 align-top">
                    {rec.deliveryDueDate ? (
                      <div className="mb-1">
                        {dueDateStatus ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-bold border ${dueDateStatus.badgeClass}`}>
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>{dueDateStatus.text}</span>
                          </span>
                        ) : (
                          <span className="text-2xs text-slate-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>ส่ง: {formatThaiDate(rec.deliveryDueDate)}</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xs text-slate-400 mb-1">- ไม่ระบุวันส่ง -</div>
                    )}

                    <div className="text-3xs text-slate-500 space-y-0.5">
                      {rec.torMaker && <div>ผู้ทำ TOR: <span className="text-slate-700">{rec.torMaker}</span></div>}
                    </div>
                  </td>

                  {/* Amount & VAT */}
                  <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                    <div className="font-bold text-slate-900 text-sm font-mono">
                      {formatBaht(displayAmount)}
                    </div>
                    <div className="text-3xs text-emerald-700 mt-0.5">
                      {rec.vatType === 'exempt'
                        ? 'ยกเว้น VAT'
                        : `(VAT 7%: ${formatBaht(displayVat)})`}
                    </div>
                  </td>

                  {/* Attachments */}
                  <td className="py-3.5 px-4 align-top text-center">
                    {rec.attachments && rec.attachments.length > 0 ? (
                      <div className="inline-flex items-center gap-1">
                        {rec.attachments.slice(0, 2).map((att: any) => (
                          <button
                            key={att.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onViewAttachment) onViewAttachment(att);
                            }}
                            className="w-7 h-7 rounded border border-slate-200 overflow-hidden hover:scale-110 transition-transform cursor-pointer shadow-2xs relative"
                            title={`คลิกเพื่อดู: ${att.name}`}
                          >
                            {att.type && att.type.startsWith('image/') ? (
                              <img
                                src={att.dataUrl}
                                alt={att.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-600">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-2xs text-slate-300">- ไม่มีแนบ -</span>
                    )}
                  </td>

                  {/* Status & Quick Action */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border w-fit ${statusMeta.badge}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </span>

                      {rec.status === 'pending_inspection' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickInspect(rec);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-2xs font-bold shadow-2xs transition-colors cursor-pointer w-fit"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ตรวจนับของแล้ว</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 align-top text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onViewDetail(rec)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        title="ดูรายละเอียด/ไฟล์แนบ"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(rec)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 rounded-md hover:bg-amber-50 transition-colors cursor-pointer"
                        title="แก้ไขข้อมูลใบ PR"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(rec)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-200">
        {records.map((rec: any) => {
          const statusMeta = STATUS_CONFIG[rec.status] || STATUS_CONFIG.pending_inspection;
          const rawAmount = rec.amount ?? rec.totalAmount ?? rec.subtotalAmount ?? 0;
          const displayAmount = isNaN(Number(rawAmount)) ? 0 : Number(rawAmount);

          return (
            <div key={rec.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <button
                    type="button"
                    onClick={() => onViewDetail(rec)}
                    className="font-bold text-emerald-700 hover:underline text-sm font-mono"
                  >
                    {rec.prNumber}
                  </button>
                  <span className="text-2xs text-slate-400 ml-2">
                    {formatThaiDate(rec.prDate || rec.requestDate)}
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold border ${statusMeta.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                  {statusMeta.label}
                </span>
              </div>

              <h4
                onClick={() => onViewDetail(rec)}
                className="text-sm font-semibold text-slate-900 mt-2 cursor-pointer line-clamp-2"
              >
                {rec.title}
              </h4>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    {formatBaht(displayAmount)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onViewDetail(rec)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-md"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(rec)}
                    className="p-1.5 text-slate-500 hover:text-amber-700 rounded-md"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(rec)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
