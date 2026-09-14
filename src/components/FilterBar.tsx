import React from 'react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
      {/* ช่องค้นหาและตัวกรอง */}
      <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔍 ค้นหาเลขที่ PR, ชื่อรายการ หรือชื่อร้านค้า..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">ทุกประเภทวัสดุ</option>
          <option value="วัสดุวิทยาศาสตร์">วัสดุวิทยาศาสตร์</option>
          <option value="วัสดุสำนักงาน">วัสดุสำนักงาน</option>
          <option value="ครุภัณฑ์">ครุภัณฑ์</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>
      </div>
    </div>
  );
};
