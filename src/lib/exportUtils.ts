// src/lib/exportUtils.ts
// CSV export utilities with UTF-8 BOM for Microsoft Excel Thai language compatibility

import type { Category, TaxCalculationResult, Transaction } from './types';
import { formatThaiDate } from './utils';

/**
 * Escapes CSV special characters and neutralizes CSV formula injection
 */
export function sanitizeCsvField(val: string | null | undefined): string {
  let text = (val || '').replace(/"/g, '""');
  // If field starts with formula trigger characters (=, +, -, @, tab, newline), prefix with single quote
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text}"`;
}

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
    'ประเภทรายได้ (Income Type)',
    'ยอดเงินเต็ม (บาท)',
    'คนละครึ่ง/ไทยช่วยไทย',
    'รัฐช่วยจ่าย (บาท)',
    'ภาษีหัก ณ ที่จ่าย WHT (บาท)',
    'ยอดสุทธิเข้า/ออก (บาท)',
  ];

  const rows = transactions.map((tx) => {
    const categoryName = tx.category_id ? categoriesMap.get(tx.category_id)?.name || 'ทั่วไป' : 'อื่นๆ';
    const typeLabel = tx.type === 'income' ? 'รายรับ' : 'รายจ่าย';
    const isThaiChuayThai = tx.is_thai_chuay_thai ? 'ใช่ (60/40)' : 'ไม่ใช่';
    
    let incomeTypeLabel = '-';
    if (tx.type === 'income') {
      if (tx.income_type === 'allowance') incomeTypeLabel = 'เงินจากครอบครัว/ค่าขนม (ยกเว้นภาษี)';
      else if (tx.income_type === 'freelance_part_time') incomeTypeLabel = 'พาร์ทไทม์/ฟรีแลนซ์ (40(2))';
      else if (tx.income_type === 'salary' || tx.is_salary) incomeTypeLabel = 'เงินเดือน (40(1))';
      else if (tx.income_type === 'scholarship') incomeTypeLabel = 'ทุนการศึกษา (ยกเว้นภาษี)';
      else incomeTypeLabel = 'รายรับอื่นๆ';
    }

    return [
      `"${tx.transaction_date}"`,
      `"${typeLabel}"`,
      sanitizeCsvField(categoryName),
      sanitizeCsvField(tx.description),
      `"${incomeTypeLabel}"`,
      tx.amount.toFixed(2),
      `"${isThaiChuayThai}"`,
      (tx.thai_chuay_thai_discount || 0).toFixed(2),
      (tx.withholding_tax_amount || 0).toFixed(2),
      tx.net_amount.toFixed(2),
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
    `เงินได้พึงประเมินทั้งปี (40(1) และ 40(2)),${taxResult.grossIncome.toFixed(2)}`,
    `เงินได้ยกเว้นภาษี (ค่าขนมจากครอบครัว/ทุน),${taxResult.exemptIncome.toFixed(2)}`,
    `หักค่าใช้จ่ายและค่าลดหย่อนมาตรฐาน,${taxResult.standardDeductions.toFixed(2)}`,
    `หักค่าลดหย่อนเพิ่มเติมอื่นๆ,${taxResult.additionalDeductionsTotal.toFixed(2)}`,
    `รวมค่าลดหย่อนทั้งหมด,${taxResult.totalDeductions.toFixed(2)}`,
    `เงินได้สุทธิที่ต้องเสียภาษี,${taxResult.netTaxableIncome.toFixed(2)}`,
    `ภาษีคำนวณได้ทั้งสิ้น,${taxResult.totalTax.toFixed(2)}`,
    `ภาษีหัก ณ ที่จ่ายสะสม (50 ทวิ),${taxResult.totalWithholdingTax.toFixed(2)}`,
    taxResult.isEligibleForRefund
      ? `ยอดเงินที่ขอคืนภาษีได้ (Tax Refund),+${taxResult.taxRefund.toFixed(2)}`
      : `ภาษีที่ต้องชำระสุทธิ (Net Tax Payable),${taxResult.netTaxPayable.toFixed(2)}`,
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
