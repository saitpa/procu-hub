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

const DEFAULT_SAMPLE_IDS = new Set([
  'rec-2568-001',
  'rec-2568-002',
  'rec-2568-003',
  'rec-2568-004',
  'rec-2568-005',
]);

export default function App() {
  // สิทธิ์ผู้ดูแลระบบ (Admin)
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // ฟังก์ชันล็อกอินแอดมินด้วยรูปกุญแจ
  const handleAdminLoginToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      alert("ออกจากระบบแอดมินเรียบร้อยแล้ว");
    } else {
      const password = prompt("กรุณากรอกรหัสผ่านแอดมิน เพื่อจัดการระบบ:");
      if (password === "1234") {
        setIsAdmin(true);
        alert("ยินดีต้อนรับแอดมิน! ปลดล็อกระบบจัดการและสิทธิ์ลบข้อมูลแล้วค่ะ");
      } else {
        alert("รหัสผ่านไม่ถูกต้อง!");
      }
    }
  };

  // โหลดข้อมูลใบ PR จาก LocalStorage
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

  // Master Data: รายชื่อร้านค้า กรรมการ และหมวดหมู่
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('pr_tracker_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('pr_tracker_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_MEMBERS;
  });

  const [materialSubtypes, setMaterialSubtypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('pr_tracker_material_subtypes');
    return saved ? JSON.parse(saved) : INITIAL_MATERIAL_SUBTYPES;
  });

  // ระบบแจ้งเตือนทางอีเมล
  const [notificationEmail, setNotificationEmail] = useState<string>(() => {
    return localStorage.getItem('pr_tracker_email') || 'saitpa@kku.ac.th';
  });
  const [alertDaysBefore, setAlertDaysBefore] = useState<number>(() => {
    const saved = localStorage.getItem('pr_tracker_alert_days');
    return saved ? Number(saved) : 7;
  });

  // ตัวกรอง (Filters) และปีงบประมาณ
  const [currentFiscalYear, setCurrentFiscalYear] = useState<number>(2568);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // สถานะการเปิด-ปิด หน้าต่าง Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<PurchaseRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PurchaseRecord | null>(null);
  const [inspectingRecord, setInspectingRecord] = useState<PurchaseRecord | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<AttachmentFile | null>(null);
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState<boolean>(false);
  const [isEmailAlertOpen, setIsEmailAlertOpen] = useState<boolean>(false);
  const [isExportExcelOpen, setIsExportExcelOpen] = useState<boolean>(false);
  const [showSampleBanner, setShowSampleBanner] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ข้อมูลแจ้งเตือนแบบ Pop-up สั้น (Toast)
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const sampleRecordsCount = useMemo(() => {
    return records.filter((r) => DEFAULT_SAMPLE_IDS.has(r.id)).length;
  }, [records]);

  // ซิงค์บันทึกข้อมูลลงฐานข้อมูลเบราว์เซอร์อัตโนมัติ
  useEffect(() => { localStorage.setItem('pr_tracker_records', JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem('pr_tracker_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('pr_tracker_staff', JSON.stringify(staffMembers)); }, [staffMembers]);
  useEffect(() => { localStorage.setItem('pr_tracker_material_subtypes', JSON.stringify(materialSubtypes)); }, [materialSubtypes]);
  useEffect(() => { localStorage.setItem('pr_tracker_email', notificationEmail); }, [notificationEmail]);
  useEffect(() => { localStorage.setItem('pr_tracker_alert_days', String(alertDaysBefore)); }, [alertDaysBefore]);

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(records.map((r) => r.fiscalYear))) as number[];
    if (!years.includes(2568)) years.push(2568);
    return years.sort((a, b) => Number(b) - Number(a));
  }, [records]);

  const yearSummary = useMemo(() => calculateYearSummary(records, currentFiscalYear), [records, currentFiscalYear]);

  const dueAlertCount = useMemo(() => {
    return records.filter((r) => getDueDateStatus(r.deliveryDueDate, r.status) !== null).length;
  }, [records]);

  // ประมวลผลลัพธ์การค้นหาพัสดุ
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

  // ฟังก์ชันล้างข้อมูลใบ PR ทั้งหมด
  const handleResetAllDataToZero = () => {
    if (!isAdmin) return;
    if (window.confirm("⚠️ ยืนยันคำสั่งแอดมิน: ต้องการลบใบ PR ทุกรายการเพื่อรีเซ็ตระบบเป็น 0 ใช่ไหมคะ?")) {
      setRecords([]);
      setToastMessage("ล้างข้อมูลสำเร็จ เริ่มต้นระบบเป็น 0 แล้วค่ะ");
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* แท็บเมนูด้านบนสุดของระบบ */}
      <Header
        isAdmin={isAdmin}
        onAdminToggle={handleAdminLoginToggle}
        notificationEmail={notificationEmail}
        dueAlertCount={dueAlertCount}
        onOpenEmailModal={() => setIsEmailAlertOpen(true)}
        onOpenAdminConfig={() => setIsAdminConfigOpen(true)} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* แบนเนอร์จำลองระบบและแนะนำการล็อกอิน */}
        {showSampleBanner && sampleRecordsCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between shadow-sm">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm">ระบบบริหารและติดตามใบจัดซื้อจัดจ้าง (PR Tracker)</h4>
                <p className="text-xs text-amber-700 mt-1">
                  ผู้ใช้งานทุกคนสามารถกดปุ่ม <span className="font-medium text-amber-900">"สร้างใบ PR ใหม่"</span> เพื่อเพิ่มข้อมูลลงระบบได้ตามปกติค่ะ ส่วนการลบรายการหรือแก้ไขฐานข้อมูลร้านค้า/กรรมการหลัก จะเปิดสิทธิ์ให้เฉพาะแอดมินที่ใส่รหัสกุญแจมุมขวาบน <span className="font-mono bg-amber-200 px-1.5 py-0.5 rounded text-amber-900 font-bold">1234</span> เท่านั้นค่ะ
                </p>
              </div>
            </div>
            <button onClick={() => setShowSampleBanner(false)} className="text-amber-500 hover:text-amber-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* 🛠️ [กล่องฟังก์ชันสำหรับแอดมิน] ปรากฏขึ้นทันทีเมื่อปลดล็อกกุญแจสำเร็จ */}
        {isAdmin && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3 text-red-800">
              <ShieldCheck className="h-6 w-6 text-red-600" />
              <div>
                <span className="block text-sm font-bold">โหมดผู้ดูแลระบบ (Admin Access Granted)</span>
                <span className="block text-xs text-red-600">คุณได้รับสิทธิ์เข้าเพิ่ม-ลบรายชื่อร้านค้า กรรมการตรวจรับพัสดุ และจัดระเบียบฐานข้อมูลหลักแล้วค่ะ</span>
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
                ล้างข้อมูลพัสดุทั้งหมดเป็น 0
              </button>
            </div>
          </div>
        )}

        {/* การ์ดรายงานสรุปยอดงบประมาณประจำปี */}
        <YearSummaryCards
          summary={yearSummary}
          availableYears={availableYears}
          currentYear={currentFiscalYear}
          onYearChange={setCurrentFiscalYear}
        />

        {/* แถบค้นหาและปุ่มสร้างใบ PR ใหม่ (ผูกคำสั่งเปิดหน้าต่างเพิ่มข้อมูลให้คนทั่วไปใช้ได้ทุกคน) */}
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

        {/* รายการแสดงผลใบ PR ทั้งหมดในระบบ */}
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
              alert("❌ ปฏิเสธการเข้าถึง: สิทธิ์ของคุณไม่ถูกต้อง เฉพาะแอดมินเท่านั้นที่จะสามารถทำการลบข้อมูลออกจากระบบได้ค่ะ");
              return;
            }
            if (window.confirm(`⚠️ คุณแน่ใจจริงๆ ใช่ไหมคะว่าต้องการลบใบ PR เลขที่: ${rec.prNumber}?`)) {
              setRecords(prev => prev.filter(r => r.id !== rec.id));
              setToastMessage("ลบรายการจัดซื้อเรียบร้อยแล้วค่ะ");
            }
          }}
          onQuickInspect={(rec) => setInspectingRecord(rec)}
        />
      </main>

      {/* === [ บล็อกระบบควบคุมหน้าต่างการทำงานป็อปอัป (Modals) ] === */}
      
      {/* 1. ฟอร์มกรอกบันทึกใบ PR ใหม่ หรือแก้ไขพัสดุ */}
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
            setRecords(prev => {
              const exists = prev.some(r => r.id === updatedRecord.id);
              if (exists) {
                return prev.map(r => r.id === updatedRecord.id ? updatedRecord : r);
              } else {
                return [updatedRecord, ...prev];
              }
            });
            setToastMessage(editingRecord ? "อัปเดตข้อมูลสำเร็จแล้วค่ะ" : "บันทึกและสร้างใบ PR ใหม่สำเร็จแล้วค่ะ");
            setIsRecordModalOpen(false);
            setEditingRecord(null);
          }}
        />
      )}

      {/* 2. หน้าต่างแสดงรายละเอียดเชิงลึกของแต่ละรายการ */}
      {selectedRecord && (
        <PurchaseRecordDetailModal
          isOpen={!!selectedRecord}
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onViewAttachment={(file) => setViewingAttachment(file)}
        />
      )}

      {/* 3. หน้าต่างบันทึกข้อมูลการตรวจรับพัสดุด่วน */}
      {inspectingRecord && (
        <QuickInspectModal
          isOpen={!!inspectingRecord}
          record={inspectingRecord}
          onClose={() => setInspectingRecord(null)}
          onSave={(updatedRecord) => {
            setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
            setToastMessage("อัปเดตสถานะการตรวจรับเรียบร้อยค่ะ");
            setInspectingRecord(null);
          }}
        />
      )}

      {/* 4. ตัวรับชมไฟล์เอกสารแนบ */}
      {viewingAttachment && (
        <AttachmentViewerModal
          isOpen={!!viewingAttachment}
          file={viewingAttachment}
          onClose={() => setViewingAttachment(null)}
        />
      )}

      {/* 5. ตั้งค่าที่อยู่อีเมลหลักและกำหนดเวลาแจ้งเตือนล่วงหน้า */}
      {isEmailAlertOpen && (
        <EmailAlertModal
          isOpen={isEmailAlertOpen}
          onClose={() => setIsEmailAlertOpen(false)}
          email={notificationEmail}
          daysBefore={alertDaysBefore}
          onSave={(email, days) => {
            setNotificationEmail(email);
            setAlertDaysBefore(days);
            setToastMessage("บันทึกการตั้งค่าแจ้งเตือนสำเร็จค่ะ");
            setIsEmailAlertOpen(false);
          }}
        />
      )}

      {/* 6. หน้าต่างส่งออกตารางเป็นสเปรดชีต Excel */}
      {isExportExcelOpen && (
        <ExportExcelModal
          isOpen={isExportExcelOpen}
          onClose={() => setIsExportExcelOpen(false)}
          records={filteredRecords}
          fiscalYear={currentFiscalYear}
        />
      )}

      {/* 7. [หน้าต่างของแอดมิน] เพิ่ม-ลบ รายชื่อร้านค้า/กรรมการ/ประเภทวัสดุพัสดุหลัก */}
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

      {/* กล่องข้อความแจ้งเตือน Toast ความสำเร็จที่ด้านมุมขวาล่าง */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 z-50 animate-slide-in-up">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
