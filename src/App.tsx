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
  Lock,
  Unlock,
  Settings2
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
  // === [ระบบล็อกอินแอดมินด้วยกุญแจ] ===
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // ฟังก์ชันคลิกรูปกุญแจเพื่อใส่รหัสผ่าน
  const handleAdminLoginToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      alert("ออกจากระบบแอดมินเรียบร้อยแล้ว");
    } else {
      const password = prompt("กรุณากรอกรหัสผ่านแอดมิน เพื่อจัดการระบบ:");
      if (password === "1234") { // ตั้งรหัสผ่านเริ่มต้นไว้ที่ 1234
        setIsAdmin(true);
        alert("ยินดีต้อนรับแอดมิน! คุณได้รับสิทธิ์จัดการฐานข้อมูลและลบข้อมูลแล้ว");
      } else {
        alert("รหัสผ่านไม่ถูกต้อง!");
      }
    }
  };

  // ฟังก์ชันล้างข้อมูลทั้งหมดให้เริ่มเป็น 0 สำหรับแอดมิน
  const handleResetAllDataToZero = () => {
    if (!isAdmin) {
      alert("สิทธิ์ไม่ถูกต้อง: เฉพาะแอดมินเท่านั้นที่สามารถล้างข้อมูลได้");
      return;
    }
    const confirmReset = window.confirm("⚠️ เตือน: คุณต้องการลบข้อมูลทั้งหมด เพื่อตั้งค่าเริ่มต้นใหม่เป็น 0 ใช่หรือไม่? (ไม่สามารถกู้คืนได้)");
    if (confirmReset) {
      setRecords([]);
      localStorage.setItem('pr_tracker_records', JSON.stringify([]));
      setToastMessage("ล้างข้อมูลทั้งหมดสำเร็จ เริ่มต้นระบบเป็น 0 เรียบร้อย");
    }
  };

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

  // Master Data: Material Sub-categories
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

  // Current selected fiscal year
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
        if (rec.fiscalYear !== currentFiscalYear) return false;

        const matchSearch =
          searchTerm === '' ||
          rec.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.vendorName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = statusFilter === 'all' || rec.status === statusFilter;

        const matchCategory = categoryFilter === 'all' || rec.category === categoryFilter;

        return matchSearch && matchStatus && matchCategory;
      })
      .sort((a, b) => b.prNumber.localeCompare(a.prNumber));
  }, [records, currentFiscalYear, searchTerm, statusFilter, categoryFilter]);

  // ฟังก์ชันลบ Record รายการเดี่ยว
  const handleDeleteRecord = (id: string) => {
    if (!isAdmin) {
      alert("❌ สิทธิ์ไม่ถูกต้อง: เฉพาะผู้ดูแลระบบ (แอดมิน) เท่านั้นที่มีสิทธิ์ลบรายการ PR ได้");
      return;
    }
    setRecords(prev => prev.filter(r => r.id !== id));
    setToastMessage("ลบรายการจัดซื้อเรียบร้อยแล้ว");
  };

  // ฟังก์ชันซ่อนแบนเนอร์ข้อมูลตัวอย่าง
  const handleHideSampleBanner = () => {
    setShowSampleBanner(false);
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* ส่วนหัวของระบบ (Header) */}
      <Header
        isAdmin={isAdmin}
        onAdminToggle={handleAdminLoginToggle}
        notificationEmail={notificationEmail}
        dueAlertCount={dueAlertCount}
        onOpenEmailModal={() => setIsEmailAlertOpen(true)}
        onOpenAdminConfig={() => setIsAdminConfigOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* แบนเนอร์ข้อมูลตัวอย่าง */}
        {showSampleBanner && sampleRecordsCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between shadow-sm">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm">โหมดทดลองใช้งาน</h4>
                <p className="text-xs text-amber-700 mt-1">
                  ระบบได้โหลดข้อมูลตัวอย่าง ({sampleRecordsCount} รายการ) คนทั่วไปสามารถเพิ่มใบ PR ได้ปกติ แต่หากต้องการสิทธิ์ลบหรือแก้ไขรายชื่อกรรมการ ให้พิมพ์รหัส <span className="font-mono bg-amber-200 px-1.5 py-0.5 rounded text-amber-900 font-bold">1234</span> ที่รูปกุญแจมุมขวาบน
                </p>
              </div>
            </div>
            <button onClick={handleHideSampleBanner} className="text-amber-500 hover:text-amber-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* 🛠️ กล่องจัดการระบบสำหรับแอดมิน */}
        {isAdmin && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md animate-fade-in">
            <div className="flex items-center gap-3 text-red-800">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-sm font-bold">เปิดสิทธิ์ผู้ดูแลระบบ (Admin Mode)</span>
                <span className="block text-xs text-red-600">คุณสามารถจัดการรายชื่อผู้ค้า กรรมการตรวจรับ และลบข้อมูลออกจากระบบได้</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAdminConfigOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-slate-800 hover:bg-slate-900 transition-all shadow-sm"
              >
                <Settings2 className="h-4 w-4" />
                จัดการรายชื่อร้านค้า / กรรมการ
              </button>

              <button
                onClick={handleResetAllDataToZero}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-red-700 bg-red-100 hover:bg-red-200 border border-red-200 transition-all shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                ล้างข้อมูลใบ PR ทั้งหมดเป็น 0
              </button>
            </div>
          </div>
        )}

        {/* การ์ดสรุปภาพรวมรายปี */}
        <YearSummaryCards
          summary={yearSummary}
          availableYears={availableYears}
          currentYear={currentFiscalYear}
          onYearChange={setCurrentFiscalYear}
        />

        {/* แถบค้นหาและตัวกรองข้อมูล */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onOpenRecordModal={() => {
            setEditingRecord(null);
            setIsRecordModalOpen(true);
          }}
          onOpenExportModal={() => setIsExportExcelOpen(true)}
        />

        {/* ตารางแสดงผลใบ PR (ส่งค่า isAdmin เพื่อเปิดปุ่มลบในตาราง และเช็กสิทธิ์ซ้ำตอนกดลบ) */}
        <PurchaseRecordList
          records={filteredRecords}
          isAdmin={isAdmin}
          onViewDetail={(rec) => setSelectedRecord(rec)}
          onEdit={(rec) => {
            setEditingRecord(rec);
            setIsRecordModalOpen(true);
          }}
          onDelete={(rec) => {
            if (!isAdmin) {
              alert("❌ ปฏิเสธการทำงาน: สิทธิ์ไม่ถูกต้อง เฉพาะแอดมินเท่านั้นที่สามารถลบรายการได้");
              return;
            }
            if (window.confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบรายการ PR เลขที่: ${rec.prNumber}?`)) {
              handleDeleteRecord(rec.id);
            }
          }}
          onQuickInspect={(rec) => setInspectingRecord(rec)}
        />
      </main>

      {/* === [ โซนหน้าต่างป็อปอัป Modals ต่างๆ ] === */}
      {isRecordModalOpen && (
        <PurchaseRecordModal
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            setEditingRecord(null);
          }}
          editingRecord={editingRecord}
          vendors={vendors}
          staffMembers={staffMembers}
          materialSubtypes={materialSubtypes}
          currentFiscalYear={currentFiscalYear}
          onSave={(updatedRecord) => {
            if (editingRecord) {
              setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
              setToastMessage("อัปเดตข้อมูลสำเร็จ");
            } else {
              setRecords(prev => [updatedRecord, ...prev]);
              setToastMessage("เพิ่มบันทึกจัดซื้อจัดจ้างสำเร็จ");
            }
            setIsRecordModalOpen(false);
            setEditingRecord(null);
          }}
        />
      )}

      {selectedRecord && (
        <PurchaseRecordDetailModal
          isOpen={!!selectedRecord}
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onViewAttachment={(file) => setViewingAttachment(file)}
        />
      )}

      {inspectingRecord && (
        <QuickInspectModal
          isOpen={!!inspectingRecord}
          record={inspectingRecord}
          onClose={() => setInspectingRecord(null)}
          onSave={(updatedRecord) => {
            setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
            setToastMessage("บันทึกข้อมูลการตรวจรับเรียบร้อย");
            setInspectingRecord(null);
          }}
        />
      )}

      {viewingAttachment && (
        <AttachmentViewerModal
          isOpen={!!viewingAttachment}
          file={viewingAttachment}
          onClose={() => setViewingAttachment(null)}
        />
      )}

      {isEmailAlertOpen && (
        <EmailAlertModal
          isOpen={isEmailAlertOpen}
          onClose={() => setIsEmailAlertOpen(false)}
          email={notificationEmail}
          daysBefore={alertDaysBefore}
          onSave={(email, days) => {
            setNotificationEmail(email);
            setAlertDaysBefore(days);
            setToastMessage("บันทึกการตั้งค่าการแจ้งเตือนแล้ว");
            setIsEmailAlertOpen(false);
          }}
        />
      )}

      {isExportExcelOpen && (
        <ExportExcelModal
          isOpen={isExportExcelOpen}
          onClose={() => setIsExportExcelOpen(false)}
          records={filteredRecords}
          fiscalYear={currentFiscalYear}
        />
      )}

      {isAdminConfigOpen && (
        <AdminConfigModal
          isOpen={isAdminConfigOpen}
          onClose={() => setIsAdminConfigOpen(false)}
          vendors={vendors}
          setVendors={setVendors}
          staffMembers={staffMembers}
          setStaffMembers={setStaffMembers}
          materialSubtypes={materialSubtypes}
          setMaterialSubtypes={setMaterialSubtypes}
        />
      )}

      {/* แจ้งเตือนข้อความสำเร็จ (Toast) */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 z-50">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
