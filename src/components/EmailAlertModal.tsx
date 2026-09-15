import React, { useState } from 'react';
import { Bell, Mail, Clock, Check, X, AlertTriangle } from 'lucide-react';

interface EmailAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  daysBefore: number;
  onSave: (email: string, daysBefore: number) => void;
}

export const EmailAlertModal: React.FC<EmailAlertModalProps> = ({
  isOpen,
  onClose,
  email: initialEmail = '',
  daysBefore: initialDaysBefore = 7,
  onSave,
}) => {
  const [email, setEmail] = useState<string>(initialEmail);
  const [daysBefore, setDaysBefore] = useState<number>(initialDaysBefore);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('กรุณากรอกอีเมลให้ถูกต้องค่ะ');
      return;
    }
    onSave(email, daysBefore);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-800/60 rounded-xl border border-blue-700/50">
              <Bell className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">ตั้งค่าการแจ้งเตือนกำหนดส่ง</h3>
              <p className="text-2xs text-blue-200">แจ้งเตือนอัตโนมัติก่อนถึงวันส่งมอบสิ่งของ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-200 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              ระบบจะทำการตรวจสอบรายการจัดซื้อที่ใกล้ครบกำหนดส่งมอบ และส่งสรุปรายการแจ้งเตือนไปยังอีเมลที่ระบุไว้
            </p>
          </div>

          {/* Email Address Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              อีเมลสำหรับรับการแจ้งเตือน
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@kku.ac.th"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Days Before Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              จำนวนวันแจ้งเตือนล่วงหน้า (วัน)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="1"
                max="30"
                required
                value={daysBefore}
                onChange={(e) => setDaysBefore(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
              />
            </div>
            <p className="text-3xs text-slate-400">
              ระบุเป็นจำนวนวัน (เช่น 7 วันล่วงหน้าก่อนถึงกำหนดส่งมอบ)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
