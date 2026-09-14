import * as XLSX from 'xlsx';
import { PurchaseRecord } from '../types';
import {
  formatThaiDate,
  calculateVatBreakdown,
  getItemReceivedStats,
  getOverallReceivingProgress,
  getDueDateStatus,
  CATEGORY_CONFIG,
  STATUS_CONFIG,
} from '../utils';

export interface ExcelExportOptions {
  fiscalYear?: number | 'all';
  records: PurchaseRecord[];
  allRecords: PurchaseRecord[];
  notificationEmail?: string;
}

/**
 * Generates and downloads a comprehensive Excel file with multiple detailed worksheets:
 * 1. สรุปภาพรวมผู้บริหาร (Executive & Financial Summary)
 * 2. รายการจัดซื้อจัดจ้างทั้งหมด (Full PR Records Registry)
 * 3. รายละเอียดสิ่งของพัสดุ (Items Breakdown)
 * 4. ประวัติการตรวจรับเป็นรอบ (Receiving Rounds History)
 */
export function exportPurchaseRecordsToExcel({
  fiscalYear = 2568,
  records,
  allRecords,
  notificationEmail = 'saitpa@kku.ac.th',
}: ExcelExportOptions) {
  // Filter target records based on fiscalYear
  const targetRecords =
    fiscalYear === 'all'
      ? records
      : records.filter((r) => r.fiscalYear === fiscalYear);

  if (targetRecords.length === 0) {
    throw new Error(
      fiscalYear === 'all'
        ? 'ไม่พบข้อมูลรายการจัดซื้อในระบบ'
        : `ไม่พบข้อมูลรายการจัดซื้อของปีงบประมาณ พ.ศ. ${fiscalYear}`
    );
  }

  // Create new Workbook
  const workbook = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // SHEET 1: สรุปภาพรวมผู้บริหาร (Executive Summary)
  // -------------------------------------------------------------
  const summaryAoa: any[][] = [];

  const todayStr = formatThaiDate(new Date().toISOString().split('T')[0]);
  const yearTitle =
    fiscalYear === 'all'
      ? 'ทุกปีงบประมาณ (ภาพรวมทั้งหมด)'
      : `ปีงบประมาณ พ.ศ. ${fiscalYear}`;

  summaryAoa.push(['รายงานสรุปการจัดซื้อจัดจ้างพัสดุและครุภัณฑ์']);
  summaryAoa.push(['สาขาวิชาจุลชีววิทยา คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น']);
  summaryAoa.push([`รอบข้อมูล: ${yearTitle}`, '', `วันที่ส่งออกรายงาน: ${todayStr}`]);
  summaryAoa.push([`ผู้จัดพิมพ์/ผู้ดูแลระบบ: ${notificationEmail}`]);
  summaryAoa.push([]); // blank line

  // Financial Totals
  const totalAmount = targetRecords.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalSubtotal = targetRecords.reduce(
    (sum, r) => sum + (r.subtotalBeforeVat || 0),
    0
  );
  const totalVat = targetRecords.reduce((sum, r) => sum + (r.vatAmount || 0), 0);
  const totalCount = targetRecords.length;

  summaryAoa.push(['1. สรุปยอดรวมทางการเงินและการคิดภาษีมูลค่าเพิ่ม (VAT 7%)']);
  summaryAoa.push(['หัวข้อ', 'จำนวนรายการ', 'ยอดเงิน (บาท)', 'หมายเหตุ']);
  summaryAoa.push(['ยอดรวมสั่งซื้อสุทธิ (รวม VAT)', totalCount, totalAmount, 'ยอดรวมตามใบ PR / สัญญา']);
  summaryAoa.push(['ยอดรวมราคาก่อนภาษี (ก่อน VAT)', totalCount, totalSubtotal, 'ต้นทุนสินค้าก่อนคิดภาษี']);
  summaryAoa.push(['ยอดรวมภาษีมูลค่าเพิ่ม (VAT 7%)', totalCount, totalVat, 'ภาษีมูลค่าเพิ่ม']);
  summaryAoa.push([]);

  // Status Breakdown
  const inspectedRecords = targetRecords.filter((r) => r.status === 'inspected');
  const partialRecords = targetRecords.filter((r) => r.status === 'partial_inspected');
  const pendingRecords = targetRecords.filter((r) => r.status === 'pending_inspection');
  const orderingRecords = targetRecords.filter((r) => r.status === 'ordering');

  const inspectedSum = inspectedRecords.reduce((s, r) => s + r.totalAmount, 0);
  const partialSum = partialRecords.reduce((s, r) => s + r.totalAmount, 0);
  const pendingSum = pendingRecords.reduce((s, r) => s + r.totalAmount, 0);
  const orderingSum = orderingRecords.reduce((s, r) => s + r.totalAmount, 0);

  // Due alerts
  let overdueCount = 0;
  let nearDueCount = 0;
  targetRecords.forEach((r) => {
    const due = getDueDateStatus(r.deliveryDueDate, r.status);
    if (due?.isOverdue) overdueCount++;
    if (due?.isNearDue) nearDueCount++;
  });

  summaryAoa.push(['2. สรุปสถานะการส่งมอบและการตรวจรับ']);
  summaryAoa.push(['สถานะ', 'จำนวนรายการ', 'ยอดเงินรวม (บาท)', 'สัดส่วนจำนวน (%)', 'สัดส่วนมูลค่า (%)']);
  summaryAoa.push([
    'นับของแล้ว (ตรวจรับครบถ้วน 100%)',
    inspectedRecords.length,
    inspectedSum,
    totalCount > 0 ? Number(((inspectedRecords.length / totalCount) * 100).toFixed(1)) : 0,
    totalAmount > 0 ? Number(((inspectedSum / totalAmount) * 100).toFixed(1)) : 0,
  ]);
  summaryAoa.push([
    'รับแล้วบางส่วน (ทยอยรับเป็นรอบๆ)',
    partialRecords.length,
    partialSum,
    totalCount > 0 ? Number(((partialRecords.length / totalCount) * 100).toFixed(1)) : 0,
    totalAmount > 0 ? Number(((partialSum / totalAmount) * 100).toFixed(1)) : 0,
  ]);
  summaryAoa.push([
    'รอตรวจรับ (ของถึงแล้วรอตรวจนับ)',
    pendingRecords.length,
    pendingSum,
    totalCount > 0 ? Number(((pendingRecords.length / totalCount) * 100).toFixed(1)) : 0,
    totalAmount > 0 ? Number(((pendingSum / totalAmount) * 100).toFixed(1)) : 0,
  ]);
  summaryAoa.push([
    'กำลังรอร้านส่งมอบ',
    orderingRecords.length,
    orderingSum,
    totalCount > 0 ? Number(((orderingRecords.length / totalCount) * 100).toFixed(1)) : 0,
    totalAmount > 0 ? Number(((orderingSum / totalAmount) * 100).toFixed(1)) : 0,
  ]);
  summaryAoa.push([
    'รวมทั้งหมด',
    totalCount,
    totalAmount,
    100,
    100,
  ]);
  summaryAoa.push([]);

  // Category Breakdown
  summaryAoa.push(['3. สรุปตามประเภทหมวดหมู่หลัก']);
  summaryAoa.push(['หมวดหมู่หลัก', 'จำนวนรายการ', 'ยอดเงินรวม (บาท)', 'สัดส่วนมูลค่า (%)']);
  const categories = ['material', 'asset', 'service', 'other'] as const;
  categories.forEach((cat) => {
    const catRecords = targetRecords.filter((r) => r.category === cat);
    const catSum = catRecords.reduce((s, r) => s + r.totalAmount, 0);
    summaryAoa.push([
      CATEGORY_CONFIG[cat]?.label || cat,
      catRecords.length,
      catSum,
      totalAmount > 0 ? Number(((catSum / totalAmount) * 100).toFixed(1)) : 0,
    ]);
  });
  summaryAoa.push([]);

  // Material Sub-types breakdown
  const materialRecords = targetRecords.filter((r) => r.category === 'material');
  if (materialRecords.length > 0) {
    summaryAoa.push(['4. สรุปหมวดวัสดุสิ้นเปลืองย่อย']);
    summaryAoa.push(['หมวดวัสดุย่อย', 'จำนวนรายการ', 'ยอดเงินรวม (บาท)']);
    const subMap: Record<string, { count: number; sum: number }> = {};
    materialRecords.forEach((r) => {
      const sub = r.materialSubType || 'ไม่ระบุหมวดย่อย';
      if (!subMap[sub]) subMap[sub] = { count: 0, sum: 0 };
      subMap[sub].count += 1;
      subMap[sub].sum += r.totalAmount;
    });

    Object.entries(subMap)
      .sort((a, b) => b[1].sum - a[1].sum)
      .forEach(([subName, data]) => {
        summaryAoa.push([subName, data.count, data.sum]);
      });
    summaryAoa.push([]);
  }

  // Top Vendors
  summaryAoa.push(['5. สรุปยอดซื้อตามร้านค้า / ผู้ขาย (เรียงตามมูลค่า)']);
  summaryAoa.push(['รหัสร้านค้า', 'ชื่อร้านค้า/ผู้ขาย', 'จำนวนรายการ PR', 'ยอดเงินรวม (บาท)']);
  const vendorMap: Record<string, { code: string; name: string; count: number; sum: number }> = {};
  targetRecords.forEach((r) => {
    const key = r.vendorName || 'ไม่ระบุร้านค้า';
    if (!vendorMap[key]) {
      vendorMap[key] = {
        code: r.vendorCode || '-',
        name: key,
        count: 0,
        sum: 0,
      };
    }
    vendorMap[key].count += 1;
    vendorMap[key].sum += r.totalAmount;
  });

  Object.values(vendorMap)
    .sort((a, b) => b.sum - a.sum)
    .forEach((v) => {
      summaryAoa.push([v.code, v.name, v.count, v.sum]);
    });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);
  wsSummary['!cols'] = [
    { wch: 36 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'สรุปภาพรวมผู้บริหาร');

  // -------------------------------------------------------------
  // SHEET 2: ทะเบียนรายการจัดซื้อจัดจ้าง (Full PR Records Registry)
  // -------------------------------------------------------------
  const prHeaders = [
    'ลำดับ',
    'ปีงบประมาณ',
    'เลขที่ใบ PR',
    'วันที่ขอซื้อ',
    'วันกำหนดส่งของ',
    'สถานะกำหนดส่ง',
    'รายการจัดซื้อ / เรื่อง',
    'หมวดหมู่หลัก',
    'หมวดวัสดุย่อย',
    'รหัสร้านค้า',
    'ชื่อร้านค้า / บริษัทผู้ขาย',
    'ผู้ขอซื้อ',
    'สาขาวิชา/หน่วยงาน',
    'ผู้จัดทำ TOR',
    'ผู้ทำราคากลาง',
    'ผู้ตรวจรับพัสดุ',
    'แหล่งงบประมาณ',
    'ประเภท VAT',
    'ราคาก่อน VAT (บาท)',
    'ภาษีมูลค่าเพิ่ม VAT 7% (บาท)',
    'ยอดสุทธิรวม VAT (บาท)',
    'สถานะการตรวจรับ',
    'รูปแบบการส่งมอบ',
    'ความคืบหน้ารับของ (%)',
    'สั่งซื้อ (ชิ้น)',
    'รับแล้ว (ชิ้น)',
    'คงค้าง (ชิ้น)',
    'จำนวนรอบที่รับ',
    'วันที่ตรวจรับล่าสุด',
    'ผู้ตรวจรับล่าสุด',
    'เลขที่เอกสารตรวจรับ',
    'เลขที่ อว.',
    'วันที่ส่งหนังสือออก',
    'เลขที่ PUR-',
    'เลขที่ RFQ-',
    'จำนวนไฟล์แนบ',
    'ผลการตรวจนับ/สภาพของ',
    'หมายเหตุ',
  ];

  const prRows: any[][] = [];

  targetRecords.forEach((r, idx) => {
    const dueStatus = getDueDateStatus(r.deliveryDueDate, r.status);
    let dueText = 'ปกติ';
    if (dueStatus?.isOverdue) dueText = `เกินกำหนด ${dueStatus.daysDiff} วัน`;
    else if (dueStatus?.isNearDue) dueText = `ใกล้กำหนด (${dueStatus.daysDiff} วัน)`;

    const prog = getOverallReceivingProgress(r);
    const vatLabel =
      r.vatType === 'exempt'
        ? 'ยกเว้น VAT'
        : r.vatType === 'excluded'
        ? 'ไม่รวม VAT (+7%)'
        : 'รวม VAT 7% แล้ว';

    const statusLabel = STATUS_CONFIG[r.status]?.label || r.status;
    const catLabel = CATEGORY_CONFIG[r.category]?.label || r.category;
    const deliveryTypeLabel =
      r.deliveryType === 'batch' || (r.receivingRounds && r.receivingRounds.length > 0)
        ? 'ทยอยรับเป็นรอบ'
        : 'ส่งมอบครั้งเดียว';

    prRows.push([
      idx + 1,
      r.fiscalYear,
      r.prNumber,
      formatThaiDate(r.requestDate),
      r.deliveryDueDate ? formatThaiDate(r.deliveryDueDate) : '-',
      dueText,
      r.title,
      catLabel,
      r.materialSubType || '-',
      r.vendorCode || '-',
      r.vendorName || '-',
      r.requester,
      r.department || 'สาขาวิชาจุลชีววิทยา',
      r.torMaker || '-',
      r.priceEstimator || '-',
      r.inspectorName || '-',
      r.budgetSource,
      vatLabel,
      r.subtotalBeforeVat || 0,
      r.vatAmount || 0,
      r.totalAmount || 0,
      statusLabel,
      deliveryTypeLabel,
      `${prog.percentage}%`,
      prog.totalOrdered,
      prog.totalReceived,
      Math.max(0, prog.totalOrdered - prog.totalReceived),
      r.receivingRounds ? r.receivingRounds.length : (r.status === 'inspected' ? 1 : 0),
      r.inspectedDate ? formatThaiDate(r.inspectedDate) : '-',
      r.inspectedBy || '-',
      r.inspectionDocNumber || '-',
      r.mhesiNumber || '-',
      r.mhesiDate ? formatThaiDate(r.mhesiDate) : '-',
      r.purNumber || '-',
      r.rfqNumber || '-',
      r.attachments ? r.attachments.length : 0,
      r.inspectionNote || '-',
      r.notes || '-',
    ]);
  });

  const wsPr = XLSX.utils.aoa_to_sheet([prHeaders, ...prRows]);
  wsPr['!cols'] = [
    { wch: 6 },  // ลำดับ
    { wch: 10 }, // ปีงบ
    { wch: 14 }, // PR
    { wch: 14 }, // วันที่ขอซื้อ
    { wch: 14 }, // วันส่งของ
    { wch: 16 }, // สถานะกำหนดส่ง
    { wch: 32 }, // รายการจัดซื้อ
    { wch: 16 }, // หมวดหลัก
    { wch: 22 }, // หมวดย่อย
    { wch: 12 }, // รหัสร้านค้า
    { wch: 26 }, // ร้านค้า
    { wch: 18 }, // ผู้ขอซื้อ
    { wch: 20 }, // ภาควิชา
    { wch: 18 }, // TOR
    { wch: 18 }, // ราคากลาง
    { wch: 18 }, // ผู้ตรวจรับ
    { wch: 20 }, // แหล่งงบ
    { wch: 16 }, // ประเภท VAT
    { wch: 16 }, // ก่อน VAT
    { wch: 14 }, // VAT
    { wch: 16 }, // รวม VAT
    { wch: 20 }, // สถานะตรวจรับ
    { wch: 16 }, // รูปแบบส่งมอบ
    { wch: 12 }, // ความคืบหน้า
    { wch: 12 }, // สั่งซื้อ
    { wch: 12 }, // รับแล้ว
    { wch: 12 }, // คงค้าง
    { wch: 12 }, // จำนวนรอบ
    { wch: 14 }, // วันที่ตรวจรับ
    { wch: 18 }, // ผู้ตรวจรับ
    { wch: 16 }, // เลขที่เอกสารตรวจรับ
    { wch: 18 }, // เลขที่ อว.
    { wch: 14 }, // วันที่ส่งหนังสือ
    { wch: 14 }, // PUR-
    { wch: 14 }, // RFQ-
    { wch: 10 }, // ไฟล์แนบ
    { wch: 25 }, // ผลการตรวจนับ
    { wch: 25 }, // หมายเหตุ
  ];
  XLSX.utils.book_append_sheet(workbook, wsPr, 'รายการจัดซื้อจัดจ้าง');

  // -------------------------------------------------------------
  // SHEET 3: รายละเอียดสิ่งของพัสดุ (Items Breakdown)
  // -------------------------------------------------------------
  const itemHeaders = [
    'ลำดับ',
    'ปีงบประมาณ',
    'เลขที่ใบ PR',
    'รายการจัดซื้อ',
    'ร้านค้า / ผู้ขาย',
    'รหัสสินค้า/พัสดุ',
    'ชื่อรายการสิ่งของ',
    'จำนวนสั่งซื้อ',
    'หน่วยนับ',
    'จำนวนที่รับแล้ว',
    'จำนวนคงค้างส่ง',
    'ราคาต่อหน่วย (บาท)',
    'ราคารวม (บาท)',
    'สถานะรายการนี้',
  ];

  const itemRows: any[][] = [];
  let itemCounter = 1;

  targetRecords.forEach((r) => {
    r.items.forEach((it) => {
      const stats = getItemReceivedStats(r, it.id);
      let itemStatus = 'รอตรวจรับ';
      if (stats.received >= stats.ordered && stats.ordered > 0) {
        itemStatus = 'รับครบแล้ว 100%';
      } else if (stats.received > 0) {
        itemStatus = `รับแล้วบางส่วน (${stats.received}/${stats.ordered})`;
      } else if (r.status === 'ordering') {
        itemStatus = 'กำลังรอร้านส่งมอบ';
      }

      itemRows.push([
        itemCounter++,
        r.fiscalYear,
        r.prNumber,
        r.title,
        r.vendorName || '-',
        it.code || '-',
        it.name,
        it.quantity,
        it.unit,
        stats.received,
        stats.remaining,
        it.unitPrice,
        it.totalPrice,
        itemStatus,
      ]);
    });
  });

  const wsItems = XLSX.utils.aoa_to_sheet([itemHeaders, ...itemRows]);
  wsItems['!cols'] = [
    { wch: 6 },  // ลำดับ
    { wch: 10 }, // ปีงบ
    { wch: 14 }, // PR
    { wch: 28 }, // รายการจัดซื้อ
    { wch: 24 }, // ร้านค้า
    { wch: 14 }, // รหัสสินค้า
    { wch: 34 }, // รายการสิ่งของ
    { wch: 12 }, // จำนวนสั่งซื้อ
    { wch: 10 }, // หน่วย
    { wch: 14 }, // รับแล้ว
    { wch: 14 }, // คงค้าง
    { wch: 16 }, // ราคา/หน่วย
    { wch: 16 }, // รวมเงิน
    { wch: 22 }, // สถานะรายการ
  ];
  XLSX.utils.book_append_sheet(workbook, wsItems, 'รายละเอียดสิ่งของพัสดุ');

  // -------------------------------------------------------------
  // SHEET 4: ประวัติการตรวจรับเป็นรอบ (Receiving Rounds History)
  // -------------------------------------------------------------
  const roundHeaders = [
    'ลำดับ',
    'ปีงบประมาณ',
    'เลขที่ใบ PR',
    'รายการจัดซื้อ',
    'ร้านค้า/ผู้ขาย',
    'รอบที่',
    'วันที่ตรวจรับรอบนี้',
    'ผู้ตรวจรับรอบนี้',
    'เลขที่ใบส่งของ / ใบกำกับภาษี',
    'เลขที่เอกสารตรวจรับ',
    'รายการสิ่งของและจำนวนที่รับในรอบนี้',
    'ผลการตรวจนับ / บันทึกสภาพพัสดุ',
  ];

  const roundRows: any[][] = [];
  let roundCounter = 1;

  targetRecords.forEach((r) => {
    if (r.receivingRounds && r.receivingRounds.length > 0) {
      r.receivingRounds.forEach((rnd) => {
        const itemSummary = (rnd.items || [])
          .map((it) => `${it.itemName}: ${it.receivedQuantity} ${it.unit}`)
          .join('; ');

        roundRows.push([
          roundCounter++,
          r.fiscalYear,
          r.prNumber,
          r.title,
          r.vendorName || '-',
          `รอบที่ ${rnd.roundNumber}`,
          formatThaiDate(rnd.receivedDate),
          rnd.receivedBy,
          rnd.deliveryNoteNumber || '-',
          rnd.inspectionDocNumber || '-',
          itemSummary || '-',
          rnd.note || '-',
        ]);
      });
    }
  });

  if (roundRows.length > 0) {
    const wsRounds = XLSX.utils.aoa_to_sheet([roundHeaders, ...roundRows]);
    wsRounds['!cols'] = [
      { wch: 6 },  // ลำดับ
      { wch: 10 }, // ปีงบ
      { wch: 14 }, // PR
      { wch: 26 }, // รายการจัดซื้อ
      { wch: 22 }, // ร้านค้า
      { wch: 10 }, // รอบที่
      { wch: 16 }, // วันที่รับ
      { wch: 18 }, // ผู้ตรวจรับ
      { wch: 22 }, // เลขที่ใบส่งของ
      { wch: 20 }, // เลขที่ตรวจรับ
      { wch: 45 }, // รายการที่รับ
      { wch: 30 }, // บันทึกผล
    ];
    XLSX.utils.book_append_sheet(workbook, wsRounds, 'ประวัติการรับของเป็นรอบ');
  }

  // Generate filename
  const fileDate = new Date().toISOString().split('T')[0];
  const filename =
    fiscalYear === 'all'
      ? `รายงานสรุปจัดซื้อพัสดุ_ทุกปีงบประมาณ_${fileDate}.xlsx`
      : `รายงานสรุปจัดซื้อพัสดุ_ปีงบ${fiscalYear}_${fileDate}.xlsx`;

  // Trigger download
  XLSX.writeFile(workbook, filename);
  return filename;
}
