import React from 'react';

interface PurchaseRecordListProps {
  records: any[];
  isAdmin: boolean;
  onViewDetail: (record: any) => void;
  onEdit: (record: any) => void;
  onDelete: (record: any) => void;
  onQuickInspect: (record: any) => void;
}

// 🎯 ฟังก์ชันแปลงสถานะเป็น Badge สีและข้อความที่ถูกต้อง
export const renderStatusBadge = (status: string) => {
  switch (status) {
    case 'inspected':
    case 'completed':
    case 'ตรวจรับแล้ว (อยู่ในขั้นตอนตั้งเบิก)':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          ตรวจรับแล้ว
        </span>
      );

    case 'partial':
    case 'ตรวจรับบางส่วน':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          ตรวจรับบางส่วน
        </span>
      );

    case 'cancelled':
    case 'ยกเลิกรายการ':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-300">
          <span className="w-2 h-2 rounded-full bg-slate-500"></span>
          ยกเลิกรายการ
        </span>
      );

    case 'ordering':
    case 'รอตรวจรับ':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          รอตรวจรับ
        </span>
      );
  }
};

export const PurchaseRecordList: React.FC<PurchaseRecordListProps> = ({
  records,
  isAdmin,
  onViewDetail,
  onEdit,
  onDelete,
  onQuickInspect,
}) => {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <p className="text-slate-500 font-medium text-base">ไม่พบข้อมูลรายการจัดซื้อจัดจ้าง</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
              <th className="py-4 px-4 text-center">เลขที่ PR / วันที่</th>
              <th className="py-4 px-4">รายการจัดซื้อ / ร้านค้า</th>
              <th className="py-4 px-4">กำหนดส่ง / ผู้จัดทำ</th>
              <th className="py-4 px-4 text-right">ยอดรวม (VAT)</th>
              <th className="py-4 px-4 text-center">ไฟล์/รูปแนบ</th>
              <th className="py-4 px-4 text-center">สถานะ / ตรวจรับ</th>
              <th className="py-4 px-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {records.map((rec) => {
              const formattedAmount = Number(rec.amount || rec.totalAmount || 0).toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              const vatAmount = Number(rec.vatAmount || 0).toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });

              return (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 text-center align-top">
                    <span className="font-bold text-emerald-700 block">{rec.prNumber || '-'}</span>
                    <span className="text-xs text-slate-400 block mt-1">{rec.prDate || '-'}</span>
                  </td>

                  <td className="py-4 px-4 align-top max-w-xs">
                    <p className="font-semibold text-slate-800 line-clamp-2 mb-2" title={rec.title}>
                      {rec.title}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                        {rec.category === 'material' ? 'วัสดุสิ้นเปลือง' : rec.category || 'วัสดุ'}
                      </span>
                      {rec.subType && (
                        <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-md border border-teal-200 font-medium">
                          🏷️ {rec.subType}
                        </span>
                      )}
                    </div>
                    {rec.vendorName && (
                      <div className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded inline-flex items-center gap-1 border border-slate-200">
                        🏠 <span className="font-medium">{rec.vendorName}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4 align-top">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800 font-medium inline-block">
                      📅 กำหนดส่ง: {rec.deliveryDueDate || 'ไม่ระบุ'}
                    </div>
                    {rec.requesterName && (
                      <div className="text-xs text-slate-500 mt-1.5">
                        👤 ผู้ขอซื้อ: {rec.requesterName}
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right align-top">
                    <span className="font-bold text-slate-900 block text-base">฿{formattedAmount}</span>
                    <span className="text-xs text-emerald-600 block mt-0.5">
                      (VAT 7%: ฿{vatAmount})
                    </span>
                  </td>

                  <td className="py-4 px-4 text-center align-top text-xs text-slate-400">
                    {rec.attachments && rec.attachments.length > 0 ? (
                      <span className="text-emerald-600 font-semibold">📎 {rec.attachments.length} ไฟล์</span>
                    ) : (
                      '- ไม่มีแนบ -'
                    )}
                  </td>

                  {/* 🎯 คอลัมน์สถานะ จะแสดงผลตามฟังก์ชัน renderStatusBadge ตัวใหม่ */}
                  <td className="py-4 px-4 text-center align-top">
                    {renderStatusBadge(rec.status)}
                  </td>

                  <td className="py-4 px-4 text-center align-top">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onViewDetail(rec)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="ดูรายละเอียด"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => onEdit(rec)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="แก้ไขข้อมูล"
                      >
                        ✏️
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => onDelete(rec)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบรายการ"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
