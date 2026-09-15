import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
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

// 1. สร้าง Supabase Client จาก Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      } else if (password !== null) {
        alert("รหัสผ่านไม่ถูกต้อง!");
      }
    }
  };

  // State ข้อมูลหลัก
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  // 2. ดึงข้อมูลจาก Supabase เมื่อเปิดเว็บ
  const fetchRecordsFromSupabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pr_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching Supabase data:', error);
      } else if (data && data.length > 0) {
        // แปลงฟิลด์ snake_case จาก DB กลับเป็น camelCase สำหรับ React
        const mappedData = data.map((item: any) => ({
          ...item,
          prNumber: item.pr_number || item.prNumber,
          prDate: item.pr_date || item.prDate,
          deliveryDueDate: item.delivery_due_date || item.deliveryDueDate,
          title: item.title,
          fiscalYear: item.fiscal_year || item.fiscalYear,
          category: item.category,
          subType: item.sub_type || item.subType,
          requesterName: item.requester_name || item.requesterName,
          department: item.department,
          ewNo: item.ew_no || item.ewNo,
          ewDate: item.ew_date || item.ewDate,
          inspectDocNo: item.inspect_doc_no || item.inspectDocNo,
          purNo: item.pur_no || item.purNo,
          rfqNo: item.rfq_no || item.rfqNo,
          vendorCode: item.vendor_code || item.vendorCode,
          vendorName: item.vendor_name || item.vendorName,
          torMaker: item.tor_maker || item.torMaker,
          committeeChair: item.committee_chair || item.committeeChair,
          committeeMember: item.committee_member || item.committeeMember,
          items: item.items || [],
          vatType: item.vat_type || item.vatType || 'include',
          subtotalAmount: item.subtotal_amount || item.subtotalAmount || 0,
          vatAmount: item.vat_amount || item.vatAmount || 0,
          amount: item.amount || 0,
          attachments: item.attachments || [],
          status: item.status,
          notes: item.notes,
        }));
        setRecords(mappedData);
      } else {
        // ถ้า DB ยังว่างอยู่ ใช้ Mock Data เริ่มต้น
        setRecords(INITIAL_PURCHASE_RECORDS);
      }
    } catch (err) {
      console.error('Supabase connection error:', err);
      setRecords(INITIAL_PURCHASE_RECORDS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordsFromSupabase();
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const sampleRecordsCount = useMemo(() => {
    return records.filter((r) => DEFAULT_SAMPLE_IDS.has(r.id)).length;
  }, [records]);

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

  // 3. บันทึก / แก้ไขข้อมูลลง Supabase (ปรับเป็นแบบละเอียดยืนยันทุกฟิลด์)
  const handleSaveRecord = async (updatedRecord: any) => {
    try {
      // แมปแปลงฟิลด์ให้ตรงกับคอลัมน์ใน Supabase
      const dbPayload = {
        id: updatedRecord.id || `rec-${Date.now()}`,
        pr_number: updatedRecord.prNumber || '',
        pr_date: updatedRecord.prDate || null,
        delivery_due_date: updatedRecord.deliveryDueDate || null,
        title: updatedRecord.title || '',
        fiscal_year: Number(updatedRecord.fiscalYear) || currentFiscalYear,
        category: updatedRecord.category || '',
        sub_type: updatedRecord.subType || '',
        requester_name: updatedRecord.requesterName || '',
        department: updatedRecord.department || '',
        ew_no: updatedRecord.ewNo || null,
        ew_date: updatedRecord.ewDate || null,
        inspect_doc_no: updatedRecord.inspectDocNo || null,
        pur_no: updatedRecord.purNo || null,
        rfq_no: updatedRecord.rfqNo || null,
        vendor_code: updatedRecord.vendorCode || '',
        vendor_name: updatedRecord.vendorName || '',
        tor_maker: updatedRecord.torMaker || '',
        committee_chair: updatedRecord.committeeChair || '',
        committee_member: updatedRecord.committeeMember || '',
        items: updatedRecord.items || [],
        vat_type: updatedRecord.vatType || 'include',
        subtotal_amount: Number(updatedRecord.subtotalAmount) || 0,
        vat_amount: Number(updatedRecord.vatAmount) || 0,
        amount: Number(updatedRecord.amount) || 0,
        attachments: updatedRecord.attachments || [],
        status: updatedRecord.status || '',
        notes: updatedRecord.notes || '',
      };

      const { error } = await supabase
        .from('pr_records')
        .upsert(dbPayload);

      if (error) {
        console.error('Error saving to Supabase:', error);
        alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message}`);
      } else {
        setToastMessage(editingRecord ? "อัปเดตข้อมูลสำเร็จแล้วค่ะ" : "บันทึกและสร้างใบ PR ใหม่สำเร็จแล้วค่ะ");
        fetchRecordsFromSupabase(); // รีโหลดข้อมูลล่าสุดจาก DB
        setIsRecordModalOpen(false);
        setEditingRecord(null);
      }
    } catch (err: any) {
      console.error('Error in handleSaveRecord:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  // 4. ลบข้อมูลใน Supabase
  const handleDeleteRecord = async (rec: any) => {
    if (!isAdmin) {
      alert("❌ ปฏิเสธการเข้าถึง: เฉพาะแอดมินเท่านั้นที่ลบข้อมูลได้ค่ะ");
      return;
    }
    if (window.confirm(`⚠️ คุณแน่ใจใช่ไหมว่าต้องการลบใบ PR เลขที่: ${rec.prNumber}?`)) {
      const { error } = await supabase
        .from('pr_records')
        .delete()
        .eq('id', rec.id);

      if (error) {
        console.error('Error deleting from Supabase:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      } else {
        setToastMessage("ลบรายการจัดซื้อเรียบร้อยแล้วค่ะ");
        fetchRecordsFromSupabase();
      }
    }
  };

  // 5. ล้างข้อมูลทั้งหมดใน Supabase
  const handleResetAllDataToZero = async () => {
    if (!isAdmin) return;
    if (window.confirm("⚠️ ยืนยันคำสั่งแอดมิน: ต้องการลบใบ PR ทุกรายการเพื่อรีเซ็ตระบบเป็น 0 ใช่ไหมคะ?")) {
      const { error } = await supabase
        .from('pr_records')
        .delete()
        .neq('id', '0'); // ลบทุกรายการ

      if (error) {
        console.error('Error resetting Supabase:', error);
      } else {
        setRecords([]);
        setToastMessage("ล้างข้อมูลสำเร็จ เริ่มต้นระบบเป็น 0 แล้วค่ะ");
      }
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
                ผู้ใช้งานทุกคนสามารถกดปุ่ม <span className="font-medium text-amber-900">"+ เพิ่มบันทึก PR ใหม่"</span> ด้านบนเพื่อเพิ่มข้อมูลลงระบบได้ตามปกติค่ะ สำหรับสิทธิ์จัดการระบบ สามารถเข้าผ่านปุ่มกุญแจแอดมินมุมขวาบนได้ค่ะ
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

        {loading ? (
          <div className="text-center py-12 text-slate-500">
            ⏳ กำลังโหลดข้อมูลจากฐานข้อมูล Supabase...
          </div>
        ) : (
          <PurchaseRecordList
            records={filteredRecords}
            isAdmin={isAdmin}
            onViewDetail={(rec: any) => setSelectedRecord(rec)}
            onEdit={(rec: any) => {
              setEditingRecord(rec);
              setIsRecordModalOpen(true);
            }}
            onDelete={handleDeleteRecord}
            onQuickInspect={(rec: any) => setInspectingRecord(rec)}
          />
        )}
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
          onSave={handleSaveRecord}
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
          onSave={handleSaveRecord}
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
