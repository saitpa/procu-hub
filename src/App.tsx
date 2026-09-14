import React, { useState, useEffect, useMemo } from 'react';
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

const DEFAULT_SAMPLE_IDS = new Set([
  'rec-2568-001',
  'rec-2568-002',
  'rec-2568-003',
  'rec-2568-004',
  'rec-2568-005',
]);

export default function App() {
  // สิทธิ์ผู้ดูแลระบบ (Admin)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('pr_tracker_is_admin') === 'true';
  });

  const handleAdminLoginToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      localStorage.setItem('pr_tracker_is_admin', 'false');
      alert("ออกจากระบบแอดมินเรียบร้อยแล้ว");
    } else {
      const password = prompt("กรุณากรอกรหัสผ่านแอดมิน เพื่อจัดการระบบ:");
      if (password === "micro3808") {
        setIsAdmin(true);
        localStorage.setItem('pr_tracker_is_admin', 'true');
        alert("ยินดีต้อนรับแอดมิน! ปลดล็อกระบบจัดการแล้วค่ะ");
      } else {
        alert("รหัสผ่านไม่ถูกต้อง!");
      }
    }
  };

  // โหลดข้อมูลใบ PR
  const [records, setRecords] = useState<any[]>(() => {
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

  const [vendors, setVendors] = useState<any[]>(() => {
    const saved = localStorage.getItem('pr_tracker_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [staffMembers, setStaffMembers] = useState<any[]>(() => {
    const saved = localStorage.getItem('pr_tracker_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF_MEMBERS;
  });

  const [materialSubtypes, setMaterialSubtypes] = useState<string[]>(() => {
    const saved = localStorage.getItem('pr_tracker_material_subtypes');
    return saved ? JSON.parse(saved) : INITIAL_MATERIAL_SUBTYPES;
  });

  const [notificationEmail, setNotificationEmail] = useState<string>(() => {
    return localStorage.getItem('pr_tracker_email') || 'saitpa@kku.ac.th';
  });
  const [alertDaysBefore, setAlertDaysBefore] = useState<number>(() => {
    const saved = localStorage.getItem('pr_tracker_alert_days');
    return saved ? Number(saved) : 7;
  });

  const [currentFiscalYear, setCurrentFiscalYear] = useState<number>(2568);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [inspectingRecord, setInspectingRecord] = useState<any | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<any | null>(null);
  const [isAdminConfigOpen, setIsAdminConfigOpen] = useState<boolean>(false);
  const [isEmailAlertOpen, setIsEmailAlertOpen] = useState<boolean>(false);
  const [isExportExcelOpen, setIsExportExcelOpen] = useState<boolean>(false);
  const [showSampleBanner, setShowSampleBanner] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const sampleRecordsCount = useMemo(() => {
    return records.filter((r) => DEFAULT_SAMPLE_IDS.has(r.id)).length;
  }, [records]);

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

  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        if (rec.fiscalYear !== currentFiscalYear) return false;
        const matchSearch =
          searchTerm === '' ||
          (rec.prNumber && rec.prNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (rec.title && rec.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (rec.vendorName && rec.vendorName.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchStatus = statusFilter === 'all' || rec.status === statusFilter;
        const matchCategory = categoryFilter === 'all' || rec.category === categoryFilter;
        return matchSearch && matchStatus && matchCategory;
      })
      .sort((a, b) => (b.prNumber || '').localeCompare(a.prNumber || ''));
  }, [records, currentFiscalYear, searchTerm, statusFilter, categoryFilter]);

  const handleResetAllDataToZero = () => {
    if (!isAdmin) return;
    if (window.confirm("⚠️ ยืนยันคำสั่งแอดมิน: ต้องการลบใบ PR ทุกรายการเพื่อรีเซ็ตระบบเป็น 0 ใช่ไหมคะ?")) {
      setRecords([]);
      setToastMessage("ล้างข้อมูลสำเร็จ เริ่มต้นระบบเป็น 0 แล้วค่ะ");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <Header
        isAdmin={isAdmin}
        onAdminToggle={handleAdminLoginToggle}
        notificationEmail={notificationEmail}
        dueAlertCount={dueAlertCount}
        onOpenEmailModal={() => setIsEmailAlertOpen(true)}
        onOpenAdminConfig={() => setIsAdminConfigOpen(true)}
        onOpenRecordModal={() => {
          setEditingRecord(null);
          setIsRecordModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportExcelOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {showSampleBanner && sampleRecordsCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between shadow-sm">
            <div>
              <h4 className="font-semibold text-amber-800 text-sm">⚠️ ระบบบริหารและติดตามใบจัดซื้อจัดจ้าง (PR Tracker)</h4>
              <p className="text-xs text-amber-700 mt-1">
                ผู้ใช้งานทุกคนสามารถกดปุ่ม <span className="font-medium text-amber-900">"+ เพิ่มบันทึก PR ใหม่"</span> ด้านบนเพื่อเพิ่มข้อมูลลงระบบได้ตามปกติค่ะ ส่วนสิทธิ์แอดมินใส่รหัสกุญแจมุมขวาบนคือ <span className="font-mono bg-amber-200 px-1.5 py-0.5 rounded text-amber-900 font-bold">1234</span>
              </p>
            </div>
            <button onClick={() => setShowSampleBanner(false)} className="text-amber-500 hover:text-amber-700 font-bold px-2">
              ✕
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            <div className="text-red-800">
              <span className="block text-sm font-bold">🛡️ โหมดผู้ดูแลระบบ (Admin Access Granted)</span>
              <span className="block text-xs text-red-600">คุณได้รับสิทธิ์เข้าเพิ่ม-ลบรายชื่อร้านค้า กรรมการ และจัดการระบบแล้วค่ะ</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAdminConfigOpen(true)}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-slate-800 hover:bg-slate-900 transition-all shadow-sm"
              >
                ⚙️ จัดการรายชื่อร้านค้า / กรรมการ
              </button>
              <button
                onClick={handleResetAllDataToZero}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-red-700 bg-red-100 hover:bg-red-200 border border-red-200 transition-all shadow-sm"
              >
                🗑️ ล้างข้อมูลพัสดุทั้งหมดเป็น 0
              </button>
            </div>
          </div>
        )}

        <YearSummaryCards
          summary={yearSummary}
          availableYears={availableYears}
          currentYear={currentFiscalYear}
          onYearChange={setCurrentFiscalYear}
        />

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
        />

        <PurchaseRecordList
          records={filteredRecords}
          isAdmin={isAdmin}
          onViewDetail={(rec: any) => setSelectedRecord(rec)}
          onEdit={(rec: any) => {
            setEditingRecord(rec);
            setIsRecordModalOpen(true);
          }}
          onDelete={(rec: any) => {
            if (!isAdmin) {
              alert("❌ ปฏิเสธการเข้าถึง: เฉพาะแอดมินเท่านั้นที่ลบข้อมูลได้ค่ะ");
              return;
            }
            if (window.confirm(`⚠️ คุณแน่ใจใช่ไหมว่าต้องการลบใบ PR เลขที่: ${rec.prNumber}?`)) {
              setRecords(prev => prev.filter(r => r.id !== rec.id));
              setToastMessage("ลบรายการจัดซื้อเรียบร้อยแล้วค่ะ");
            }
          }}
          onQuickInspect={(rec: any) => setInspectingRecord(rec)}
        />
      </main>

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
          onSave={(updatedRecord: any) => {
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

      {selectedRecord && (
        <PurchaseRecordDetailModal
          isOpen={!!selectedRecord}
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onViewAttachment={(file: any) => setViewingAttachment(file)}
        />
      )}

      {inspectingRecord && (
        <QuickInspectModal
          isOpen={!!inspectingRecord}
          record={inspectingRecord}
          onClose={() => setInspectingRecord(null)}
          onSave={(updatedRecord: any) => {
            setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
            setToastMessage("อัปเดตสถานะการตรวจรับเรียบร้อยค่ะ");
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
          onSave={(email: string, days: number) => {
            setNotificationEmail(email);
            setAlertDaysBefore(days);
            setToastMessage("บันทึกการตั้งค่าแจ้งเตือนสำเร็จค่ะ");
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

      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 z-50">
          <span>✅ {toastMessage}</span>
        </div>
      )}
    </div>
  );
}
