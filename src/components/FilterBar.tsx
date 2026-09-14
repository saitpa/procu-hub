import React from 'react';
import { Search, X, Filter, FileSpreadsheet } from 'lucide-react';
import { RecordCategory } from '../types';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  totalResultsCount: number;
  onOpenExportExcel?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  totalResultsCount,
  onOpenExportExcel,
}) => {
  const statusTabs = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'pending_inspection', label: 'รอตรวจรับ', dot: 'bg-amber-500' },
    { id: 'partial_inspected', label: 'รับแล้วบางส่วน (รอบๆ)', dot: 'bg-purple-600' },
    { id: 'inspected', label: 'นับของแล้ว', dot: 'bg-emerald-500' },
    { id: 'ordering', label: 'กำลังรอส่งของ', dot: 'bg-blue-500' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-blue-900 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-pr-input"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาเลขที่ PR, ชื่องาน, รหัสร้านค้า, ผู้ขอซื้อ, ผู้ตรวจรับ..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center overflow-x-auto pb-1 lg:pb-0 gap-1.5 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusFilterChange(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-950'
                }`}
              >
                {tab.dot && (
                  <span
                    className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : tab.dot}`}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category filter & Export Action */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="category-filter-select"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            aria-label="กรองตามหมวดหมู่"
            className="bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">หมวดหมู่ทั้งหมด</option>
            <option value="material">เฉพาะวัสดุสิ้นเปลือง</option>
            <option value="asset">เฉพาะครุภัณฑ์</option>
            <option value="service">เฉพาะจ้างเหมาบริการ</option>
          </select>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            {totalResultsCount} รายการ
          </span>

          {onOpenExportExcel && (
            <button
              type="button"
              onClick={onOpenExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="ส่งออกรายงาน Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>ดาวน์โหลด Excel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
