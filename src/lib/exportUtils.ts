// src/lib/exportUtils.ts
// CSV export utilities with UTF-8 BOM for Microsoft Excel Thai language compatibility

import type { Category, TaxCalculationResult, Transaction } from './types';
import { formatThaiDate } from './utils';

/**
 * Converts transactions into formatted CSV string with UTF-8 BOM
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  categoriesMap: Map<string, Category> = new Map()
): void {
  const headers = [
    'วันที่',
    'ประเภท',
    'หมวดหมู่',
    'รายละเอียด',
    'ยอดเงินเต็ม (บาท)',
    'คนละครึ่ง/ไทยช่วยไทย',
    'รัฐช่วยจ่าย (บาท)',
    'ยอดจ่ายสุทธิ (บาท)',
    'เงินเดือน (คำนวณภาษี)',
  ];

  const rows = transactions.map((tx) => {
    const categoryName = tx.category_id ? categoriesMap.get(tx.category_id)?.name || 'ทั่วไป' : 'อื่นๆ';
    const typeLabel = tx.type === 'income' ? 'รายรับ' : 'รายจ่าย';
    const isThaiChuayThai = tx.is_thai_chuay_thai ? 'ใช่ (60/40)' : 'ไม่ใช่';
    const isSalary = tx.is_salary ? 'ใช่' : 'ไม่ใช่';

    return [
      `"${tx.transaction_date}"`,
      `"${typeLabel}"`,
      `"${categoryName}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      tx.amount.toFixed(2),
      `"${isThaiChuayThai}"`,
      (tx.thai_chuay_thai_discount || 0).toFixed(2),
      tx.net_amount.toFixed(2),
      `"${isSalary}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  downloadCSV(csvContent, `ngernmee_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Converts tax calculation results into CSV report
 */
export function exportTaxReportToCSV(taxResult: TaxCalculationResult): void {
  const lines = [
    'รายงานการวางแผนและคำนวณภาษีเงินได้บุคคลธรรมดา — เงินมี จำกัด',
    `ปีภาษี,${taxResult.taxYear}`,
    `วันที่คำนวณ,"${formatThaiDate(new Date(), 'long')}"`,
    '',
    'รายการ,จำนวนเงิน (บาท)',
    `เงินได้พึงประเมินทั้งปี (รายได้รวม),${taxResult.grossIncome.toFixed(2)}`,
    `หักค่าใช้จ่ายและค่าลดหย่อนมาตรฐาน,${taxResult.standardDeductions.toFixed(2)}`,
    `หักค่าลดหย่อนเพิ่มเติมอื่นๆ,${taxResult.additionalDeductionsTotal.toFixed(2)}`,
    `รวมค่าลดหย่อนทั้งหมด,${taxResult.totalDeductions.toFixed(2)}`,
    `เงินได้สุทธิที่ต้องเสียภาษี,${taxResult.netTaxableIncome.toFixed(2)}`,
    `ภาษีที่ต้องชำระทั้งสิ้น,${taxResult.totalTax.toFixed(2)}`,
    `อัตราภาษีที่แท้จริง (Effective Rate),${taxResult.effectiveRate.toFixed(2)}%`,
    '',
    'รายละเอียดการคำนวณตามขั้นบันไดภาษี',
    'ขั้นเงินได้สุทธิ,อัตราภาษี,เงินได้ในขั้น,ภาษีในขั้น (บาท)',
    ...taxResult.brackets.map(
      (b) => `"${b.bracket}",${(b.rate * 100).toFixed(0)}%,${b.taxableInBracket.toFixed(2)},${b.taxAmount.toFixed(2)}`
    ),
  ];

  const csvContent = '\uFEFF' + lines.join('\r\n');
  downloadCSV(csvContent, `ngernmee_tax_report_${taxResult.taxYear}.csv`);
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
