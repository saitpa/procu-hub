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
  Unlock
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
        alert("ยินดีต้อนรับแอดมิน! คุณได้รับสิทธิ์ลบและล้างข้อมูลแล้ว");
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
        if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && rec.category !== categoryFilter) return false;

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

          return matchPr || matchTitle || matchRequester || matchVendor || matchVendorCode || matchSubType || matchTor || matchInspector || matchItems;
        }
        return true;
      });
  }, [records, currentFiscalYear, statusFilter, categoryFilter, searchTerm]);

  // ฟังก์ชันจัดการปุ่มลบเดี่ยว (เพิ่มตัวล็อกแอดมิน)
  const handleDeleteRecordClick = (record: PurchaseRecord) => {
    if (!isAdmin) {
      alert("❌ สิทธิ์ไม่ถูกต้อง: เฉพาะแอดมินเท่านั้นที่จะสามารถลบข้อมูลได้!");
      return;
    }
    setConfirmModalData({ type: 'single', record });
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800 pb-12">
      {/* ส่งฟังก์ชันและสถานะ แอดมิน ไปที่ Header */}
      <Header 
        notificationEmail={notificationEmail} 
        isAdmin={isAdmin}
        onAdminToggle={handleAdminLoginToggle}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-6 space-y-6">
        {/* แสดงแถบสีเหลืองและปุ่มล้างข้อมูลเมื่อเป็นแอดมิน */}
        {isAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-600 h-5 w-5" />
              <div>
                <p className="font-semibold text-amber-900">แผงควบคุมแอดมินเปิดใช้งานอยู่</p>
                <p className="text-xs text-amber-700">คุณสามารถลบรายการข้อมูล หรือกดล้างข้อมูลเก่าทั้งหมดเพื่อเริ่มต้นใหม่จาก 0 ได้</p>
              </div>
            </div>
            <button
              onClick={handleResetAllDataToZero}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              ล้างข้อมูลทั้งหมดให้เป็น 0
            </button>
          </div>
        )}
              <FilterBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          currentFiscalYear={currentFiscalYear}
          setCurrentFiscalYear={setCurrentFiscalYear}
          availableYears={availableYears}
          onAddNewClick={() => {
            setEditingRecord(null);
            setIsRecordModalOpen(true);
          }}
        />

        {/* 🌟 กล่องแดชบอร์ดสรุปยอดรวมกลับมาแล้วครับ */}
        <YearSummaryCards summary={yearSummary} />

        <PurchaseRecordList 
          records={filteredRecords}
          onInspectClick={(rec) => setInspectingRecord(rec)}
          onDetailClick={(rec) => setSelectedRecord(rec)}
          onEditClick={(rec) => {
            setEditingRecord(rec);
            setIsRecordModalOpen(true);
          }}
          onDeleteClick={handleDeleteRecordClick}
        />
      </div>

      {/* บรรทัดแจ้งเตือนสำเร็จ */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-950 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50 text-sm border border-slate-800">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
