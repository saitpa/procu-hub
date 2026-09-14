  // Filter records based on active year, search term, status, and category
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // กรองตามปีงบประมาณ
        if (rec.fiscalYear !== currentFiscalYear) return false;

        // กรองตามคำค้นหา (ค้นจาก เลขที่ PR, รายการจัดซื้อ, หรือชื่อร้านค้า)
        const matchSearch =
          searchTerm === '' ||
          rec.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.vendorName.toLowerCase().includes(searchTerm.toLowerCase());

        // กรองตามสถานะ
        const matchStatus = statusFilter === 'all' || rec.status === statusFilter;

        // กรองตามประเภทครุภัณฑ์/วัสดุ
        const matchCategory = categoryFilter === 'all' || rec.category === categoryFilter;

        return matchSearch && matchStatus && matchCategory;
      })
      // เรียงลำดับตามวันที่สร้างล่าสุดหรือเลขที่ PR (ปรับเปลี่ยนได้ตามต้องการ)
      .sort((a, b) => b.prNumber.localeCompare(a.prNumber));
  }, [records, currentFiscalYear, searchTerm, statusFilter, categoryFilter]);

  // ฟังก์ชันลบ Record รายการเดี่ยว
  const handleDeleteRecord = (id: string) => {
    if (!isAdmin) {
      alert("เฉพาะผู้ดูแลระบบเท่านั้นที่มีสิทธิ์ลบรายการ");
      return;
    }
    setRecords(prev => prev.filter(r => r.id !== id));
    setToastMessage("ลบรายการจัดซื้อเรียบร้อยแล้ว");
  };

  // ฟังก์ชันสลับเพื่อซ่อนแบนเนอร์ข้อมูลตัวอย่าง
  const handleHideSampleBanner = () => {
    setShowSampleBanner(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
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
        {/* แบนเนอร์จำลองข้อมูลตัวอย่าง (เปิด-ปิดได้) */}
        {showSampleBanner && sampleRecordsCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between shadow-sm">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm md:text-base">โหมดทดลองใช้งาน</h4>
                <p className="text-xs md:text-sm text-amber-700 mt-1">
                  ระบบได้โหลดข้อมูลตัวอย่าง ({sampleRecordsCount} รายการ) เพื่อให้เห็นภาพการทำงาน คุณสามารถพิมพ์รหัส <span className="font-mono bg-amber-200 px-1.5 py-0.5 rounded text-amber-900 font-bold">1234</span> ที่รูปกุญแจมุมขวาบนเพื่อปลดล็อกสิทธิ์แอดมินในการล้างข้อมูลได้
                </p>
              </div>
            </div>
            <button onClick={handleHideSampleBanner} className="text-amber-500 hover:text-amber-700 transition">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ปุ่มควบคุมด่วนสำหรับผู้ดูแลระบบ */}
        {isAdmin && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2 text-red-700">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">สิทธิ์ผู้ดูแลระบบเปิดอยู่: คุณสามารถลบ แก้ไข หรือล้างฐานข้อมูลระบบทั้งหมดได้</span>
            </div>
            <button
              onClick={handleResetAllDataToZero}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4" />
              ล้างข้อมูลทั้งหมดเป็น 0
            </button>
          </div>
        )}

        {/* การ์ดสรุปภาพรวมรายปี (Summary Cards) */}
        <YearSummaryCards
          summary={yearSummary}
          availableYears={availableYears}
          currentYear={currentFiscalYear}
          onYearChange={setCurrentFiscalYear}
        />

        {/* แถบค้นหาและตัวกรองข้อมูล (Filter Bar) */}
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

        {/* ตาราง/รายการแสดงผลใบ PR (Purchase Record List) */}
        <PurchaseRecordList
          records={filteredRecords}
          isAdmin={isAdmin}
          onViewDetail={(rec) => setSelectedRecord(rec)}
          onEdit={(rec) => {
            setEditingRecord(rec);
            setIsRecordModalOpen(true);
          }}
          onDelete={(rec) => {
            if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการ PR เลขที่: ${rec.prNumber}?`)) {
              handleDeleteRecord(rec.id);
            }
          }}
          onQuickInspect={(rec) => setInspectingRecord(rec)}
        />
      </main>

      {/* === [ โซน Modals หน้าต่างป็อปอัปแจ้งเตือนและฟอร์มต่างๆ ] === */}
      
      {/* ฟอร์ม เพิ่ม/แก้ไข รายการ */}
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

      {/* รายละเอียดเชิงลึกเมื่อกดดูรายการ */}
      {selectedRecord && (
        <PurchaseRecordDetailModal
          isOpen={!!selectedRecord}
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onViewAttachment={(file) => setViewingAttachment(file)}
        />
      )}

      {/* หน้าต่างตรวจรับพัสดุด่วน (Quick Inspect) */}
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

      {/* หน้าต่างเปิดดูไฟล์แนบ */}
      {viewingAttachment && (
        <AttachmentViewerModal
          isOpen={!!viewingAttachment}
          file={viewingAttachment}
          onClose={() => setViewingAttachment(null)}
        />
      )}

      {/* ตั้งค่าอีเมลแจ้งเตือน */}
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

      {/* หน้าต่างส่งออกไฟล์ Excel */}
      {isExportExcelOpen && (
        <ExportExcelModal
          isOpen={isExportExcelOpen}
          onClose={() => setIsExportExcelOpen(false)}
          records={filteredRecords}
          fiscalYear={currentFiscalYear}
        />
      )}

      {/* หน้าต่างตั้งค่า Master Data ของแอดมิน */}
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

      {/* กล่องแจ้งเตือน Toast ด้านมุมล่างขวา */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-sm md:text-base px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-slide-in-up z-50">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
