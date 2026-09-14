import React from 'react';
import { PlusCircle, FileSpreadsheet, Search } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  onOpenRecordModal: () => void;
  onOpenExportModal: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onOpenRecordModal,
  onOpenExportModal,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* ช่องค้นหาและตัวกรอง */}
      <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ PR, ชื่อรายการ หรือชื่อร้านค้า..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="รอตรวจรับ">รอตรวจรับ</option>
          <option value="รับแล้วบางส่วน (รอบฯ)">รับแล้วบางส่วน (รอบฯ)</option>
          <option value="นับของแล้ว (ครบ)">นับของแล้ว (ครบ)</option>
          <option value="กำลังรอร้านส่งมอบ">กำลังรอร้านส่งมอบ</option>
          <option value="เดือนวันกำหนดส่ง">เดือนวันกำหนดส่ง</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">ทุกประเภทวัสดุ</option>
          <option value="วัสดุวิทยาศาสตร์">วัสดุวิทยาศาสตร์</option>
          <option value="วัสดุสำนักงาน">วัสดุสำนักงาน</option>
          <option value="ครุภัณฑ์">ครุภัณฑ์</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>
      </div>

      {/* ปุ่มกดส่งออก Excel และ ปุ่มเพิ่มบันทึก PR ใหม่ */}
      <div className="flex gap-2 w-full md:w-auto justify-end">
        <button
          onClick={onOpenExportModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <FileSpreadsheet className="h-4 w-4" />
          ส่งออก Excel
        </button>

        <button
          onClick={onOpenRecordModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          เพิ่มบันทึก PR ใหม่
        </button>
      </div>
    </div>
  );
};
