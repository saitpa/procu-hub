import React, { useState, useEffect, useMemo } from 'react';
import {
  PurchaseRecord,
  AttachmentFile,
  RecordStatus,
  Vendor,
  StaffMember,
  ReceivingRound,
} from './types';
import {
  INITIAL_PURCHASE_RECORDS,
  INITIAL_VENDORS,
  INITIAL_STAFF_MEMBERS,
  INITIAL_MATERIAL_SUBTYPES,
} from './mockData';
import { calculateYearSummary, getDueDateStatus } from './utils';
import { Header } from './components/Header';
import { YearSummaryCards } from './components/YearSummaryCards';
import { FilterBar } from './components/FilterBar';
import { PurchaseRecordList } from './components/PurchaseRecordList';
import { PurchaseRecordModal } from './components/PurchaseRecordModal';
import { PurchaseRecordDetailModal } from './components/PurchaseRecordDetailModal';
import { QuickInspectModal } from './components/QuickInspectModal';
import { AttachmentViewerModal } from './components/AttachmentViewerModal';
import { AdminConfigModal } from './components/AdminConfigModal';
import { EmailAlertModal } from './components/EmailAlertModal';
import { ExportExcelModal } from './components/ExportExcelModal';
import { ConfirmDeleteModal, DeleteModalType } from './components/ConfirmDeleteModal';
import {
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  BellRing,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

// IDs of the initial sample records
const DEFAULT_SAMPLE_IDS = new Set([
  'rec-2568-001',
  'rec-2568-002',
  'rec-2568-003',
  'rec-2568-004',
  'rec-2568-005',
]);

export default function App() {
  // Load purchase records from localStorage
  const [records, setRecords] = useState<PurchaseRecord[]>(() => {
    const version = localStorage.getItem('pr_tracker_version');
    if (version !== 'med_microbiology') {
      localStorage.setItem('pr_tracker_version', 'med_microbiology');
      localStorage.setItem('pr_tracker_records', JSON.stringify(INITIAL_PURCHASE_RECORDS));
      localStorage.setItem('pr_tracker_vendors', JSON.stringify(INITIAL_VENDORS));
      localStorage.setItem('pr_tracker_staff', JSON.stringify(INITIAL_STAFF_MEMBERS));
      localStorage.setItem('pr_tracker_material_subtypes', JSON.stringify(INITIAL_MATERIAL_SUBTYPES));
      return INITIAL_PURCHASE_RECORDS;
    }
    const saved = localStorage.getItem('pr_tracker_records');
    return saved !== null ? JSON.parse(saved) : INITIAL_PURCHASE_RECORDS;
  });

  // Master Data: Vendors
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('pr_tracker_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  // Master Data: Staff Members (TOR, Middle Price, Inspector)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('pr_tracker_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_MEMBERS;
  });

  // Master Data: Material Sub-categories (e.g. วัสดุวิทยาศาสตร์และการแพทย์, วัสดุห้องปฏิบัติการ)
  const [materialSubtypes, setMaterialSubtypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('pr_tracker_material_subtypes');
    return saved ? JSON.parse(saved) : INITIAL_MATERIAL_SUBTYPES;
  });

  // Email Alert Settings
  const [notificationEmail, setNotificationEmail] = useState<string>(() => {
    return localStorage.getItem('pr_tracker_email') || 'saitpa@kku.ac.th';
  });
  const [alertDaysBefore, setAlertDaysBefore] = useState<number>(() => {
    const saved = localStorage.getItem('pr_tracker_alert_days');
    return saved ? Number(saved) : 7;
  });

  // Current selected fiscal year (e.g. 2568)
  const [currentFiscalYear, setCurrentFiscalYear] = useState<number>(2568);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<PurchaseRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PurchaseRecord | null>(null);
  const [inspectingRecord, setInspectingRecord] = useState<PurchaseRecord | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<AttachmentFile | null>(null);
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState<boolean>(false);
  const [isEmailAlertOpen, setIsEmailAlertOpen] = useState<boolean>(false);
  const [isExportExcelOpen, setIsExportExcelOpen] = useState<boolean>(false);
  const [confirmModalData, setConfirmModalData] = useState<DeleteModalType | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [showSampleBanner, setShowSampleBanner] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Count default sample records present in records state
  const sampleRecordsCount = useMemo(() => {
    return records.filter((r) => DEFAULT_SAMPLE_IDS.has(r.id)).length;
  }, [records]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pr_tracker_records', JSON.stringify(records));
    } catch (e) {
      console.warn('Storage quota exceeded for records', e);
    }
  }, [records]);

  useEffect(() => {
    localStorage.setItem('pr_tracker_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('pr_tracker_staff', JSON.stringify(staffMembers));
  }, [staffMembers]);

  useEffect(() => {
    localStorage.setItem(
      'pr_tracker_material_subtypes',
      JSON.stringify(materialSubtypes)
    );
  }, [materialSubtypes]);

  useEffect(() => {
    localStorage.setItem('pr_tracker_email', notificationEmail);
  }, [notificationEmail]);

  useEffect(() => {
    localStorage.setItem('pr_tracker_alert_days', String(alertDaysBefore));
  }, [alertDaysBefore]);

  // Available fiscal years from records
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(records.map((r) => r.fiscalYear))) as number[];
    if (!years.includes(2568)) years.push(2568);
    return years.sort((a, b) => Number(b) - Number(a));
  }, [records]);

  // Calculate year summary metrics
  const yearSummary = useMemo(() => {
    return calculateYearSummary(records, currentFiscalYear);
  }, [records, currentFiscalYear]);

  // Due alerts count
  const dueAlertCount = useMemo(() => {
    return records.filter((r) => {
      const status = getDueDateStatus(r.deliveryDueDate, r.status);
      return status !== null;
    }).length;
  }, [records]);

  // Filter records based on active year, search term, status, and category
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Filter by fiscal year
        if (rec.fiscalYear !== currentFiscalYear) return false;

        // Filter by status tab
        if (statusFilter !== 'all' && rec.status !== statusFilter) return false;

        // Filter by category
        if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;

        // Filter by search term
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const matchPr = rec.prNumber.toLowerCase().includes(q);
          const matchTitle = rec.title.toLowerCase().includes(q);
          const matchRequester = rec.requester.toLowerCase().includes(q);
          const matchVendor = (rec.vendorName || '').toLowerCase().includes(q);
          const matchVendorCode = (rec.vendorCode || '').toLowerCase().includes(q);
          const matchSubType = (rec.materialSubType || '').toLowerCase().includes(q);
          const matchTor = (rec.torMaker || '').toLowerCase().includes(q);
          const matchInspector = (rec.inspectorName || '').toLowerCase().includes(q);
          const matchItems = rec.items.some((it) => it.name.toLowerCase().includes(q));

          if (
            !matchPr &&
            !matchTitle &&
            !matchRequester &&
            !matchVendor &&
            !matchVendorCode &&
            !matchSubType &&
            !matchTor &&
            !matchInspector &&
            !matchItems
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [records, currentFiscalYear, statusFilter, categoryFilter, searchTerm]);

  // Save new or edit existing PR record
  const handleSaveRecord = (recordToSave: PurchaseRecord) => {
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === recordToSave.id);
      if (exists) {
        return prev.map((r) => (r.id === recordToSave.id ? recordToSave : r));
      }
      return [recordToSave, ...prev];
    });

    if (selectedRecord && selectedRecord.id === recordToSave.id) {
      setSelectedRecord(recordToSave);
    }
  };

  // Delete record directly
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord(null);
    }
    setToastMessage('ลบรายการสำเร็จ');
  };

  // Request delete a single record with custom dialog
  const handleRequestDeleteRecord = (record: PurchaseRecord) => {
    setConfirmModalData({ mode: 'single', record });
    setIsConfirmModalOpen(true);
  };

  // Request clear all sample records (5 items)
  const handleRequestClearSampleRecords = () => {
    setConfirmModalData({ mode: 'all_sample', sampleCount: sampleRecordsCount });
    setIsConfirmModalOpen(true);
  };

  // Request clear all records
  const handleRequestClearAllRecords = () => {
    setConfirmModalData({ mode: 'clear_all', totalCount: records.length });
    setIsConfirmModalOpen(true);
  };

  // Request reset default mock data
  const handleRequestResetDefault = () => {
    setConfirmModalData({ mode: 'reset_default' });
    setIsConfirmModalOpen(true);
  };

  // Execute confirmed deletion or reset action
  const handleExecuteConfirm = () => {
    if (!confirmModalData) return;

    if (confirmModalData.mode === 'single') {
      const id = confirmModalData.record.id;
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(null);
      }
      setToastMessage(`ลบรายการ ${confirmModalData.record.prNumber} เรียบร้อยแล้ว`);
    } else if (confirmModalData.mode === 'all_sample') {
      setRecords((prev) => prev.filter((r) => !DEFAULT_SAMPLE_IDS.has(r.id)));
      if (selectedRecord && DEFAULT_SAMPLE_IDS.has(selectedRecord.id)) {
        setSelectedRecord(null);
      }
      setToastMessage('ลบข้อมูลตัวอย่างเริ่มต้นทั้งหมดเรียบร้อยแล้ว');
    } else if (confirmModalData.mode === 'clear_all') {
      setRecords([]);
      setSelectedRecord(null);
      setToastMessage('ล้างข้อมูลจัดซื้อทั้งหมดเรียบร้อยแล้ว');
    } else if (confirmModalData.mode === 'reset_default') {
      localStorage.setItem('pr_tracker_records', JSON.stringify(INITIAL_PURCHASE_RECORDS));
      localStorage.setItem('pr_tracker_vendors', JSON.stringify(INITIAL_VENDORS));
      localStorage.setItem('pr_tracker_staff', JSON.stringify(INITIAL_STAFF_MEMBERS));
      localStorage.setItem('pr_tracker_material_subtypes', JSON.stringify(INITIAL_MATERIAL_SUBTYPES));
      setRecords(INITIAL_PURCHASE_RECORDS);
      setVendors(INITIAL_VENDORS);
      setStaffMembers(INITIAL_STAFF_MEMBERS);
      setMaterialSubtypes(INITIAL_MATERIAL_SUBTYPES);
      setCurrentFiscalYear(2568);
      setStatusFilter('all');
      setCategoryFilter('all');
      setSearchTerm('');
      setToastMessage('คืนค่าข้อมูลตัวอย่างเริ่มต้น 5 รายการเรียบร้อยแล้ว');
    }
  };

  // Add new vendor helper
  const handleAddNewVendor = (newVendor: Vendor) => {
    setVendors((prev) => [...prev, newVendor]);
  };

  // Quick / Round Inspection Confirm: update status, record inspector & date & notes, append photos and rounds
  const handleConfirmInspection = (
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
  ) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const updatedRounds = roundData?.receivingRound
          ? [...(r.receivingRounds || []), roundData.receivingRound]
          : r.receivingRounds;
        const newStatus = roundData ? roundData.newStatus : ('inspected' as RecordStatus);

        return {
          ...r,
          status: newStatus,
          deliveryType: roundData?.isBatchMode ? 'batch' : (r.deliveryType || 'single'),
          receivingRounds: updatedRounds,
          inspectedDate,
          inspectedBy,
          inspectionNote: notes,
          inspectionDocNumber: roundData?.inspectionDocNumber || r.inspectionDocNumber,
          attachments: [...r.attachments, ...newAttachments],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord((curr) => {
        if (!curr) return null;
        const updatedRounds = roundData?.receivingRound
          ? [...(curr.receivingRounds || []), roundData.receivingRound]
          : curr.receivingRounds;
        const newStatus = roundData ? roundData.newStatus : ('inspected' as RecordStatus);

        return {
          ...curr,
          status: newStatus,
          deliveryType: roundData?.isBatchMode ? 'batch' : (curr.deliveryType || 'single'),
          receivingRounds: updatedRounds,
          inspectedDate,
          inspectedBy,
          inspectionNote: notes,
          inspectionDocNumber: roundData?.inspectionDocNumber || curr.inspectionDocNumber,
          attachments: [...curr.attachments, ...newAttachments],
          updatedAt: new Date().toISOString(),
        };
      });
    }
  };

  // Add extra attachments to a record
  const handleAddAttachments = (recordId: string, newFiles: AttachmentFile[]) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          attachments: [...r.attachments, ...newFiles],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord((curr) => {
        if (!curr) return null;
        return {
          ...curr,
          attachments: [...curr.attachments, ...newFiles],
          updatedAt: new Date().toISOString(),
        };
      });
    }
  };

  // Export records to CSV
  const handleExportCSV = () => {
    const yearRecords = records.filter((r) => r.fiscalYear === currentFiscalYear);
    if (yearRecords.length === 0) {
      alert(`ไม่พบข้อมูลรายการจัดซื้อของปี ${currentFiscalYear}`);
      return;
    }

    const headers = [
      'เลขที่ PR',
      'วันที่ขอซื้อ',
      'วันกำหนดส่ง',
      'รายการจัดซื้อ',
      'หมวดหมู่หลัก',
      'หมวดวัสดุย่อย',
      'รหัสร้านค้า',
      'ชื่อร้านค้า/ผู้ขาย',
      'ผู้ขอซื้อ',
      'ผู้จัดทำ TOR',
      'ผู้ทำราคากลาง',
      'ผู้ตรวจรับ',
      'แหล่งงบประมาณ',
      'ราคาก่อน VAT (บาท)',
      'ภาษี VAT 7% (บาท)',
      'ยอดสุทธิรวม VAT (บาท)',
      'สถานะ',
      'วันที่นับของ',
      'ผู้นับของ',
      'ผลการตรวจนับ',
      'จำนวนไฟล์แนบ',
      'หมายเหตุ',
    ];

    const rows = yearRecords.map((r) => [
      `"${r.prNumber}"`,
      `"${r.requestDate}"`,
      `"${r.deliveryDueDate || '-'}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.category === 'material' ? 'วัสดุสิ้นเปลือง' : r.category === 'asset' ? 'ครุภัณฑ์' : 'จ้างเหมา'}"`,
      `"${r.materialSubType || '-'}"`,
      `"${r.vendorCode || '-'}"`,
      `"${(r.vendorName || '-').replace(/"/g, '""')}"`,
      `"${r.requester.replace(/"/g, '""')}"`,
      `"${(r.torMaker || '-').replace(/"/g, '""')}"`,
      `"${(r.priceEstimator || '-').replace(/"/g, '""')}"`,
      `"${(r.inspectorName || '-').replace(/"/g, '""')}"`,
      `"${r.budgetSource}"`,
      r.subtotalBeforeVat || 0,
      r.vatAmount || 0,
      r.totalAmount,
      `"${r.status === 'inspected' ? 'นับของแล้ว' : r.status === 'pending_inspection' ? 'รอตรวจรับ' : 'กำลังรอร้านส่งมอบ'}"`,
      `"${r.inspectedDate || '-'}"`,
      `"${(r.inspectedBy || '-').replace(/"/g, '""')}"`,
      `"${(r.inspectionNote || '-').replace(/"/g, '""')}"`,
      r.attachments.length,
      `"${(r.notes || '-').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `รายงานบันทึกจัดซื้อ_ปี${currentFiscalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset to default mock records
  const handleResetData = () => {
    handleRequestResetDefault();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Prompt',sans-serif] selection:bg-emerald-100 selection:text-emerald-900 text-slate-800">
      {/* Top Header - Emerald/Mint Green Theme matching IMG_1777.jpeg */}
      <Header
        currentFiscalYear={currentFiscalYear}
        availableYears={availableYears}
        onYearChange={(year) => setCurrentFiscalYear(year)}
        onOpenNewModal={() => {
          setEditingRecord(null);
          setIsRecordModalOpen(true);
        }}
        onOpenExportExcel={() => setIsExportExcelOpen(true)}
        onExportCSV={handleExportCSV}
        onOpenAdminConfig={() => setIsAdminConfigOpen(true)}
        onOpenEmailAlerts={() => setIsEmailAlertOpen(true)}
        dueAlertCount={dueAlertCount}
        userEmail={notificationEmail}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sample Data Notice & Quick Clear Banner */}
        {sampleRecordsCount > 0 && showSampleBanner && (
          <div className="mb-4 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span>ขณะนี้ระบบมีข้อมูลตัวอย่างเริ่มต้น ({sampleRecordsCount} รายการ)</span>
                  <span className="bg-amber-200/80 text-amber-900 text-2xs px-2 py-0.5 rounded-full font-bold">
                    โหมดทดลองระบบ
                  </span>
                </div>
                <p className="text-amber-800 text-xs mt-0.5">
                  เมื่อคุณพร้อมใช้งานจริง สามารถกดปุ่มเพื่อลบข้อมูลตัวอย่างทั้ง {sampleRecordsCount} รายการนี้ออกได้ทันที
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleRequestClearSampleRecords}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบข้อมูลตัวอย่างทั้งหมด ({sampleRecordsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSampleBanner(false)}
                className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-200/50 rounded-lg cursor-pointer transition-colors"
                title="ปิดการแจ้งเตือน"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Notice badge explaining simplicity & no workflow blockers */}
        <div className="mb-5 px-4 py-2.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0" />
            <span>
              <strong>บันทึกข้อมูลและติดตามผลการตรวจรับ:</strong> บันทึกเลขที่ใบ PR, วันกำหนดส่ง, รหัสร้านค้า, คำนวณ VAT 7%, ตรวจนับของ และสรุปยอดปี {currentFiscalYear}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportExcelOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-2xs cursor-pointer transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-200" />
              <span>ส่งออกรายงาน Excel</span>
            </button>

            <button
              onClick={() => setIsEmailAlertOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-950 font-bold rounded-lg border border-blue-300 text-2xs cursor-pointer transition-colors"
            >
              <BellRing className="w-3 h-3 text-blue-800" />
              <span>ตรวจสอบวันกำหนดส่ง</span>
            </button>
          </div>
        </div>

        {/* 1. Year Summary Totals - 8 Vibrant Cards matching IMG_1777.jpeg */}
        <YearSummaryCards
          summary={yearSummary}
          selectedStatusFilter={statusFilter}
          onSelectStatusFilter={(status) => setStatusFilter(status)}
          onOpenEmailAlerts={() => setIsEmailAlertOpen(true)}
        />

        {/* 2. Filter & Search Bar */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          totalResultsCount={filteredRecords.length}
          onOpenExportExcel={() => setIsExportExcelOpen(true)}
        />

        {/* 3. Records Table & Cards */}
        <PurchaseRecordList
          records={filteredRecords}
          onSelectRecord={(rec) => setSelectedRecord(rec)}
          onEditRecord={(rec) => {
            setEditingRecord(rec);
            setIsRecordModalOpen(true);
          }}
          onDeleteRecord={handleDeleteRecord}
          onRequestDeleteRecord={handleRequestDeleteRecord}
          onQuickInspect={(rec) => setInspectingRecord(rec)}
          onViewAttachment={(att) => setViewingAttachment(att)}
          onAddNewRecord={() => {
            setEditingRecord(null);
            setIsRecordModalOpen(true);
          }}
          onRestoreDefaultData={handleRequestResetDefault}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>
              ระบบบันทึกการจัดซื้อจัดจ้างวัสดุและครุภัณฑ์| สาขาวิชาจุลชีววิทยา คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {sampleRecordsCount > 0 && (
              <button
                type="button"
                onClick={handleRequestClearSampleRecords}
                className="text-rose-600 hover:text-rose-800 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                title="ลบข้อมูลตัวอย่างเริ่มต้นทั้ง 5 รายการ"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบข้อมูลตัวอย่างทั้งหมด ({sampleRecordsCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleRequestResetDefault}
              className="text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 cursor-pointer transition-colors"
              title="รีเซ็ตและโหลดข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ต / คืนค่าข้อมูลตัวอย่าง</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              พร้อมใช้งาน (บันทึกข้อมูลในเครื่องเรียบร้อย)
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Add / Edit Record Modal */}
      {isRecordModalOpen && (
        <PurchaseRecordModal
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            setEditingRecord(null);
          }}
          onSave={handleSaveRecord}
          editingRecord={editingRecord}
          defaultFiscalYear={currentFiscalYear}
          existingPrCount={records.filter((r) => r.fiscalYear === currentFiscalYear).length}
          vendors={vendors}
          onAddNewVendor={handleAddNewVendor}
          materialSubtypes={materialSubtypes}
          staffMembers={staffMembers}
          onDelete={handleDeleteRecord}
        />
      )}

      {/* 2. Record Detail & Extra Uploads Modal */}
      {selectedRecord && (
        <PurchaseRecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onEdit={(rec) => {
            setEditingRecord(rec);
            setIsRecordModalOpen(true);
          }}
          onDelete={handleDeleteRecord}
          onQuickInspect={(rec) => setInspectingRecord(rec)}
          onAddAttachments={handleAddAttachments}
          onViewAttachment={(att) => setViewingAttachment(att)}
        />
      )}

      {/* 3. Quick Inspection & Count Modal */}
      {inspectingRecord && (
        <QuickInspectModal
          record={inspectingRecord}
          onClose={() => setInspectingRecord(null)}
          onConfirmInspect={handleConfirmInspection}
        />
      )}

      {/* 4. Attachment & Image Viewer Lightbox */}
      {viewingAttachment && (
        <AttachmentViewerModal
          attachment={viewingAttachment}
          onClose={() => setViewingAttachment(null)}
        />
      )}

      {/* 5. Admin Configuration Modal (Manage Material Sub-categories, Staff, Vendors, Email, Data Management) */}
      {isAdminConfigOpen && (
        <AdminConfigModal
          isOpen={isAdminConfigOpen}
          onClose={() => setIsAdminConfigOpen(false)}
          materialSubtypes={materialSubtypes}
          onUpdateMaterialSubtypes={setMaterialSubtypes}
          staffMembers={staffMembers}
          onUpdateStaffMembers={setStaffMembers}
          vendors={vendors}
          onUpdateVendors={setVendors}
          notificationEmail={notificationEmail}
          onUpdateNotificationEmail={setNotificationEmail}
          alertDaysBefore={alertDaysBefore}
          onUpdateAlertDaysBefore={setAlertDaysBefore}
          onClearAllSampleRecords={handleRequestClearSampleRecords}
          onClearAllRecords={handleRequestClearAllRecords}
          onResetDefaultData={handleRequestResetDefault}
          sampleRecordsCount={sampleRecordsCount}
          totalRecordsCount={records.length}
        />
      )}

      {/* 6. Email Alert Modal (Due Date Notifications) */}
      {isEmailAlertOpen && (
        <EmailAlertModal
          isOpen={isEmailAlertOpen}
          onClose={() => setIsEmailAlertOpen(false)}
          records={records}
          notificationEmail={notificationEmail}
          onSelectRecord={(rec) => {
            setIsEmailAlertOpen(false);
            setSelectedRecord(rec);
          }}
        />
      )}

      {/* 7. Export Excel Modal (Comprehensive Multi-Sheet Reports) */}
      {isExportExcelOpen && (
        <ExportExcelModal
          isOpen={isExportExcelOpen}
          onClose={() => setIsExportExcelOpen(false)}
          currentFiscalYear={currentFiscalYear}
          availableYears={availableYears}
          records={filteredRecords}
          allRecords={records}
          notificationEmail={notificationEmail}
          onExportCSV={handleExportCSV}
        />
      )}

      {/* 8. Safe In-App Delete & Reset Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isConfirmModalOpen}
        modalData={confirmModalData}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setConfirmModalData(null);
        }}
        onConfirm={handleExecuteConfirm}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs cursor-pointer p-0.5"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
