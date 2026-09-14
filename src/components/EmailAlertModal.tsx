import React, { useState } from 'react';
import { PurchaseRecord } from '../types';
import { formatBaht, formatThaiDate, getDueDateStatus } from '../utils';
import {
  X,
  Mail,
  AlertTriangle,
  Clock,
  Send,
  Copy,
  CheckCircle2,
  ExternalLink,
  Store,
  Calendar,
} from 'lucide-react';

interface EmailAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: PurchaseRecord[];
  recipientEmail: string;
  alertDaysBefore: number;
}

export const EmailAlertModal: React.FC<EmailAlertModalProps> = ({
  isOpen,
  onClose,
  records,
  recipientEmail,
  alertDaysBefore,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Filter records that have a deliveryDueDate and are either overdue or near due
  const dueRecords = records
    .map((r) => {
      const status = getDueDateStatus(r.deliveryDueDate, r.status);
      return { record: r, dueStatus: status };
    })
    .filter((item) => item.dueStatus && (item.dueStatus.isOverdue || item.dueStatus.isNearDue))
    .sort((a, b) => {
      // Overdue first, then closest due date
      if (a.dueStatus?.isOverdue && !b.dueStatus?.isOverdue) return -1;
      if (!a.dueStatus?.isOverdue && b.dueStatus?.isOverdue) return 1;
      return (a.dueStatus?.daysDiff || 0) - (b.dueStatus?.daysDiff || 0);
    });

  // Compose email subject & body
  const emailSubject = `[แจ้งเตือนกำหนดส่งพัสดุ] พบ ${dueRecords.length} รายการใกล้ครบกำหนด/เกินกำหนดส่งมอบ (สาขาวิชาวิทยาการคอมพิวเตอร์)`;
  
  const emailBodyText = `เรียน เจ้าหน้าที่ผู้เกี่ยวข้องและอาจารย์ผู้ประสานงาน

ระบบบันทึกการจัดซื้อและติดตามใบ PR ขอแจ้งเตือนรายการพัสดุที่ใกล้ถึงวันกำหนดส่งมอบ หรือเกินกำหนดส่งมอบ เพื่อการติดตามร้านค้าคู่สัญญา ดังนี้:

${dueRecords
  .map((item, idx) => {
    const r = item.record;
    const st = item.dueStatus;
    const statusText = st?.isOverdue
      ? `🚨 เกินกำหนดส่ง ${st.daysDiff} วัน`
      : st?.daysDiff === 0
      ? `⚠️ ครบกำหนดส่งมอบวันนี้`
      : `⏰ ใกล้ครบกำหนดส่งในอีก ${st?.daysDiff} วัน`;

    return `ลำดับที่ ${idx + 1}:
- เลขที่ PR: ${r.prNumber}
- รายการ: ${r.title}
- ร้านค้า/ผู้ขาย: ${r.vendorName || '-'} (รหัสร้าน: ${r.vendorCode || '-'})
- ผู้ขอซื้อ: ${r.requester}
- วันที่กำหนดส่ง: ${formatThaiDate(r.deliveryDueDate)}
- สถานะกำหนดส่ง: ${statusText}
- ยอดสั่งซื้อ: ${formatBaht(r.totalAmount)}
`;
  })
  .join('\n----------------------------------------\n\n')}

กรุณาติดต่อประสานงานร้านค้าคู่สัญญาเพื่อติดตามการส่งมอบหรือจัดเตรียมนับของตรวจรับต่อไป

ขอแสดงความนับถือ
ระบบบันทึกการจัดซื้อจัดจ้างพัสดุ สาขาวิชาวิทยาการคอมพิวเตอร์และสารสนเทศ
อีเมลผู้รับการแจ้งเตือน: ${recipientEmail}
วันที่แจ้งเตือน: ${new Date().toLocaleDateString('th-TH')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBodyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(
      recipientEmail
    )}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(
      emailBodyText
    )}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleSimulateSend = () => {
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header with Navy / Indigo-Blue theme */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                แจ้งเตือนกำหนดส่งมอบพัสดุทาง Email
              </h3>
              <p className="text-xs text-blue-200">
                ส่งแจ้งเตือนถึง: <span className="font-mono underline">{recipientEmail}</span>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {sentSuccess && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-3 text-xs sm:text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>ส่งการแจ้งเตือนสำเร็จแล้ว!</strong> ระบบส่งข้อความสรุปรายการเตือนไปยัง{' '}
                <span className="font-mono font-bold">{recipientEmail}</span> เรียบร้อยแล้ว
              </div>
            </div>
          )}

          {dueRecords.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                ไม่มีรายการที่ใกล้ครบกำหนดหรือเกินกำหนดส่งในขณะนี้
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                ทุกรายการที่มีวันกำหนดส่งยังอยู่ในเกณฑ์เวลาปกติ (เกินกว่า {alertDaysBefore} วัน) หรือตรวจนับของเสร็จสิ้นแล้ว
              </p>
            </div>
          ) : (
            <>
              {/* Alert Summary Banner */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    พบ <strong>{dueRecords.length} รายการ</strong> ที่ต้องติดตามการส่งมอบจากร้านค้า
                  </span>
                </div>
                <span className="font-semibold text-2xs bg-white px-2 py-1 rounded border border-amber-300">
                  แจ้งเตือนล่วงหน้า {alertDaysBefore} วัน
                </span>
              </div>

              {/* Due Items List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  รายการที่ต้องติดตามส่งมอบ
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-[260px] overflow-y-auto">
                  {dueRecords.map(({ record: r, dueStatus: st }) => (
                    <div key={r.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {r.prNumber}
                          </span>
                          <span className={`text-2xs px-2 py-0.5 rounded-full border ${st?.badgeClass}`}>
                            {st?.text}
                          </span>
                        </div>
                        <h5 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                          {r.title}
                        </h5>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-2xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Store className="w-3 h-3 text-slate-400" />
                            {r.vendorName || '-'} (รหัส: {r.vendorCode || '-'})
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            กำหนดส่ง: {formatThaiDate(r.deliveryDueDate)}
                          </span>
                          <span className="font-bold text-slate-700">
                            ยอดเงิน: {formatBaht(r.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Preview Accordion */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>ตัวอย่างข้อความอีเมลแจ้งเตือน (Email Preview)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-2xs text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>คัดลอกข้อความ</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl text-2xs font-mono overflow-x-auto max-h-[160px] whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {emailBodyText}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-2xs text-slate-500">
            ระบบรองรับทั้งการคลิกเปิด Email Client หรือกดส่งจำลอง
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              ปิด
            </button>
            <button
              type="button"
              onClick={handleOpenMailClient}
              className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>เปิดใน Mail App</span>
            </button>
            <button
              type="button"
              onClick={handleSimulateSend}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่งแจ้งเตือนทาง Email ทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
