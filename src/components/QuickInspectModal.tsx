import React, { useState, useMemo } from 'react';
import { PurchaseRecord, AttachmentFile, ReceivingRound, RecordStatus } from '../types';
import {
  CheckCircle2,
  Upload,
  X,
  Camera,
  Layers,
  Package,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Check,
  RotateCcw,
} from 'lucide-react';
import { formatThaiDate, getItemReceivedStats } from '../utils';

interface QuickInspectModalProps {
  record: PurchaseRecord | null;
  onClose: () => void;
  onConfirmInspect: (
    recordId: string,
    inspectedDate: string,
    inspectedBy: string,
    notes: string,
    newAttachments: AttachmentFile[],
    roundData?: {
      isBatchMode: boolean;
      receivingRound?: ReceivingRound;
      newStatus: RecordStatus;
      deliveryNoteNumber?: string;
      inspectionDocNumber?: string;
    }
  ) => void;
}

export const QuickInspectModal: React.FC<QuickInspectModalProps> = ({
  record,
  onClose,
  onConfirmInspect,
}) => {
  if (!record) return null;

  const today = new Date().toISOString().split('T')[0];

  // Check existing rounds
  const existingRounds = record.receivingRounds || [];
  const nextRoundNumber = existingRounds.length + 1;

  // Determine initial inspection mode: if record has previous rounds, default to 'receive_round'
  const [inspectionMode, setInspectionMode] = useState<'receive_all' | 'receive_round'>(
    existingRounds.length > 0 || record.status === 'partial_inspected'
      ? 'receive_round'
      : 'receive_all'
  );

  const [roundNumber, setRoundNumber] = useState(nextRoundNumber);
  const [inspectedDate, setInspectedDate] = useState(today);
  const [inspectedBy, setInspectedBy] = useState(
    record.inspectorName || 'นายสมศักดิ์ วงศ์สวัสดิ์ (นักวิชาการพัสดุ)'
  );
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
  const [inspectionDocNumber, setInspectionDocNumber] = useState(
    record.inspectionDocNumber && record.inspectionDocNumber !== '-'
      ? record.inspectionDocNumber
      : `ตรวจรับงวดที่ ${nextRoundNumber}/2568`
  );

  // Per-item received quantity in this round
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    record.items.forEach((it) => {
      const stats = getItemReceivedStats(record, it.id);
      // Default to receiving remaining items
      initial[it.id] = stats.remaining;
    });
    return initial;
  });

  const [inspectionNote, setInspectionNote] = useState(
    existingRounds.length > 0
      ? `ตรวจรับพัสดุงวดที่ ${nextRoundNumber} ตรวจนับสภาพเรียบร้อย`
      : 'ตรวจนับของครบถ้วนตามจำนวน สภาพเรียบร้อยสมบูรณ์ ไม่มีชำรุดเสียหาย'
  );

  const [isFinalRound, setIsFinalRound] = useState(false);
  const [newAttachments, setNewAttachments] = useState<AttachmentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Calculate stats for this round
  const roundSummary = useMemo(() => {
    let totalOrdered = 0;
    let totalPreviouslyReceived = 0;
    let totalReceivingThisRound = 0;
    let totalRemainingAfterThis = 0;

    record.items.forEach((it) => {
      const stats = getItemReceivedStats(record, it.id);
      const qtyThisRound = Number(itemQuantities[it.id]) || 0;
      const remainingAfter = Math.max(0, stats.remaining - qtyThisRound);

      totalOrdered += stats.ordered;
      totalPreviouslyReceived += stats.received;
      totalReceivingThisRound += qtyThisRound;
      totalRemainingAfterThis += remainingAfter;
    });

    const isAllRemainingReceived = totalRemainingAfterThis === 0 && totalReceivingThisRound > 0;

    return {
      totalOrdered,
      totalPreviouslyReceived,
      totalReceivingThisRound,
      totalRemainingAfterThis,
      isAllRemainingReceived,
    };
  }, [record, itemQuantities]);

  const handleSetItemQty = (itemId: string, value: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, value),
    }));
  };

  const handleReceiveAllRemaining = () => {
    const updated: Record<string, number> = {};
    record.items.forEach((it) => {
      const stats = getItemReceivedStats(record, it.id);
      updated[it.id] = stats.remaining;
    });
    setItemQuantities(updated);
  };

  const handleClearRoundQuantities = () => {
    const updated: Record<string, number> = {};
    record.items.forEach((it) => {
      updated[it.id] = 0;
    });
    setItemQuantities(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray: File[] = Array.from(files);

    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newFile: AttachmentFile = {
          id: `att-inspect-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'image/jpeg',
          dataUrl,
          category: 'photo',
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        setNewAttachments((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    setIsUploading(false);
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setNewAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inspectionMode === 'receive_all') {
      // Single full delivery
      onConfirmInspect(
        record.id,
        inspectedDate,
        inspectedBy,
        inspectionNote,
        newAttachments,
        {
          isBatchMode: false,
          newStatus: 'inspected',
        }
      );
    } else {
      // Batch / Round delivery
      const roundItems = record.items.map((it) => ({
        itemId: it.id,
        itemName: it.name,
        orderedQuantity: it.quantity,
        receivedQuantity: Number(itemQuantities[it.id]) || 0,
        unit: it.unit,
      }));

      const isComplete = roundSummary.isAllRemainingReceived || isFinalRound;
      const newStatus: RecordStatus = isComplete ? 'inspected' : 'partial_inspected';

      const newRound: ReceivingRound = {
        id: `round-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        roundNumber: Number(roundNumber) || nextRoundNumber,
        receivedDate: inspectedDate,
        receivedBy: inspectedBy,
        deliveryNoteNumber: deliveryNoteNumber.trim() || undefined,
        inspectionDocNumber: inspectionDocNumber.trim() || undefined,
        note: inspectionNote,
        items: roundItems,
        isCompletedRemaining: isComplete,
        attachments: newAttachments,
        createdAt: new Date().toISOString(),
      };

      onConfirmInspect(
        record.id,
        inspectedDate,
        inspectedBy,
        inspectionNote,
        newAttachments,
        {
          isBatchMode: true,
          receivingRound: newRound,
          newStatus,
          deliveryNoteNumber,
          inspectionDocNumber,
        }
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                บันทึกการตรวจรับพัสดุ / ตรวจนับของ
              </h3>
              <p className="text-xs text-blue-200">
                รองรับทั้งการรับครบในครั้งเดียว และการทยอยรับเป็นรอบๆ (งวดส่งมอบ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Target PR Info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">
                เลขที่ PR: <span className="text-blue-900 font-bold font-mono">{record.prNumber}</span>
              </span>
              <span>วันที่ขอซื้อ: {formatThaiDate(record.requestDate)}</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              {record.title}
            </h4>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                ผู้ขอซื้อ: {record.requester}
              </span>
              {record.vendorName && (
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                  ร้านค้า: {record.vendorName}
                </span>
              )}
              {existingRounds.length > 0 && (
                <span className="bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded border border-purple-200">
                  บันทึกรับไปแล้ว {existingRounds.length} รอบ
                </span>
              )}
            </div>
          </div>

          {/* Mode Selector: Single Full Delivery vs. Round/Batch Delivery */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              รูปแบบการตรวจรับของในครั้งนี้
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInspectionMode('receive_all')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  inspectionMode === 'receive_all'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    inspectionMode === 'receive_all'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {inspectionMode === 'receive_all' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    ตรวจรับครบทั้งหมดในครั้งเดียว
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5">
                    ของส่งมาครบทุกรายการ 100% สภาพเรียบร้อยสมบูรณ์
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setInspectionMode('receive_round')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  inspectionMode === 'receive_round'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-950 ring-2 ring-purple-500/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    inspectionMode === 'receive_round'
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {inspectionMode === 'receive_round' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-700" />
                    <span>ทยอยรับเป็นรอบๆ (รับบางส่วน)</span>
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5">
                    ของส่งมาเป็นงวดๆ ทยอยนับจำนวนและตรวจรับทีละรอบ
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Batch Delivery Items Table (When receive_round is selected) */}
          {inspectionMode === 'receive_round' && (
            <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-700 text-white font-bold text-xs flex items-center justify-center">
                    #{roundNumber}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-950">
                      ระบุจำนวนที่รับในงวด / รอบที่ {roundNumber}
                    </span>
                    <span className="text-2xs text-purple-700 block">
                      (กรอกจำนวนสิ่งของที่นับได้ในรอบนี้)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleReceiveAllRemaining}
                    className="px-2 py-1 text-2xs font-semibold bg-white hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-md transition-colors cursor-pointer"
                  >
                    รับครบที่เหลือทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={handleClearRoundQuantities}
                    className="px-2 py-1 text-2xs font-semibold bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-md transition-colors cursor-pointer"
                  >
                    ตั้งค่าเป็น 0
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-purple-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-purple-100/70 text-purple-950 font-semibold border-b border-purple-200">
                    <tr>
                      <th className="py-2 px-3">รายการพัสดุ</th>
                      <th className="py-2 px-3 text-center">สั่งซื้อ</th>
                      <th className="py-2 px-3 text-center">รับแล้ว</th>
                      <th className="py-2 px-3 text-center">คงค้าง</th>
                      <th className="py-2 px-3 text-center bg-purple-200/60 font-bold text-purple-900">
                        รับรอบนี้
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {record.items.map((it) => {
                      const stats = getItemReceivedStats(record, it.id);
                      const currentVal = itemQuantities[it.id] ?? 0;

                      return (
                        <tr key={it.id} className="hover:bg-purple-50/30">
                          <td className="py-2 px-3">
                            <div className="font-semibold text-slate-900">{it.name}</div>
                            {it.code && it.code !== '-' && (
                              <div className="text-3xs font-mono text-slate-500">
                                รหัส: {it.code}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center text-slate-600 font-mono">
                            {stats.ordered} {it.unit}
                          </td>
                          <td className="py-2 px-3 text-center text-emerald-700 font-semibold font-mono">
                            {stats.received}
                          </td>
                          <td className="py-2 px-3 text-center text-amber-700 font-semibold font-mono">
                            {stats.remaining}
                          </td>
                          <td className="py-2 px-3 text-center bg-purple-50/50">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={0}
                                max={stats.remaining}
                                value={currentVal}
                                onChange={(e) =>
                                  handleSetItemQty(it.id, parseInt(e.target.value) || 0)
                                }
                                className="w-16 px-2 py-1 text-center font-bold font-mono text-purple-900 bg-white border border-purple-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-xs"
                              />
                              <span className="text-3xs text-slate-500">{it.unit}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Round Summary status note */}
              <div className="p-2.5 bg-white border border-purple-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-700 shrink-0" />
                  <span className="text-purple-950 font-medium">
                    รับรอบนี้รวม: <strong>{roundSummary.totalReceivingThisRound}</strong> ชิ้น
                    {roundSummary.totalRemainingAfterThis > 0 ? (
                      <span className="text-amber-800 ml-1">
                        (คงเหลืออีก {roundSummary.totalRemainingAfterThis} ชิ้น เพื่อรอรับรอบถัดไป)
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold ml-1">
                        (ครบถ้วน 100% แล้ว)
                      </span>
                    )}
                  </span>
                </div>

                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFinalRound || roundSummary.isAllRemainingReceived}
                    onChange={(e) => setIsFinalRound(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                  <span className="text-2xs font-bold text-purple-950">
                    ถือเป็นรอบสุดท้าย (ตรวจรับครบถ้วนสมบูรณ์)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Inspection Date, Inspector & Reference Docs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่ตรวจรับ / ตรวจนับ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={inspectedDate}
                onChange={(e) => setInspectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ผู้นับของ / ผู้ตรวจรับ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={inspectedBy}
                onChange={(e) => setInspectedBy(e.target.value)}
                placeholder="ชื่อ-นามสกุล และตำแหน่ง"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {/* Document numbers */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลขที่เอกสารตรวจรับ (ถ้ามี)
              </label>
              <input
                type="text"
                value={inspectionDocNumber}
                onChange={(e) => setInspectionDocNumber(e.target.value)}
                placeholder="เช่น ตรวจรับที่ 12/2568 หรือ ตรวจรับงวดที่ 1"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลขที่ใบส่งของ / ใบกำกับภาษีรอบนี้ (ถ้ามี)
              </label>
              <input
                type="text"
                value={deliveryNoteNumber}
                onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                placeholder="เช่น DO-68-019 หรือ INV-4491"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          {/* Condition Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ผลการตรวจนับของ / สภาพสิ่งของในรอบนี้
            </label>
            <textarea
              rows={2}
              value={inspectionNote}
              onChange={(e) => setInspectionNote(e.target.value)}
              placeholder="ระบุสภาพของที่ได้รับ เช่น ของครบตามที่ระบุในงวดนี้ กล่องสมบูรณ์ มีการควบคุมอุณหภูมิ..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* Photo / Document Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>แนบรูปถ่ายของที่นับได้ หรือใบส่งของประจำรอบ</span>
              <span className="text-slate-400 font-normal text-2xs">
                (JPG, PNG, PDF)
              </span>
            </label>

            {/* Upload Button Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-900 rounded-xl p-3.5 text-center bg-slate-50/60 transition-colors">
              <input
                type="file"
                id="quick-inspect-file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="quick-inspect-file"
                className="cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-950 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  คลิกเพื่อเลือกรูปถ่ายกล่อง/พัสดุ หรือใบส่งของ
                </div>
                <div className="text-2xs text-slate-500">
                  ถ่ายรูปจากมือถือหรือแท็บเล็ตแล้วแนบเก็บไว้เป็นหลักฐานประจำรอบได้ทันที
                </div>
              </label>
            </div>

            {/* Thumbnail previews */}
            {newAttachments.length > 0 && (
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {newAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center"
                  >
                    {att.type.startsWith('image/') ? (
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-600 p-2 text-center truncate">
                        {att.name}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              สถานะหลังบันทึก:{' '}
              {inspectionMode === 'receive_all' || roundSummary.isAllRemainingReceived || isFinalRound ? (
                <span className="font-bold text-emerald-700">นับของแล้ว (ครบถ้วน)</span>
              ) : (
                <span className="font-bold text-purple-700">รับแล้วบางส่วน (รอบที่ {roundNumber})</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className={`inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs hover:shadow-sm transition-colors cursor-pointer ${
                  inspectionMode === 'receive_round' && !roundSummary.isAllRemainingReceived && !isFinalRound
                    ? 'bg-purple-700 hover:bg-purple-800'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {inspectionMode === 'receive_round' && !roundSummary.isAllRemainingReceived && !isFinalRound
                    ? `บันทึกตรวจรับรอบที่ ${roundNumber}`
                    : 'บันทึกสถานะ: นับของแล้ว'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
