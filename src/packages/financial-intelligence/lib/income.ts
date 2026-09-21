import type { IncomeType, Transaction } from '../../../lib/types';
import type { IncomeAnalysisResult, IncomeSourceSummary } from './types';

export const INCOME_TYPE_LABELS: Record<
  IncomeType,
  { label: string; isTaxable: boolean; desc: string }
> = {
  salary: {
    label: 'เงินเดือนประจำ (40(1))',
    isTaxable: true,
    desc: 'เงินเดือน โบนัส ค่าจ้างพนักงานประจำ',
  },
  freelance_part_time: {
    label: 'พาร์ทไทม์ / ฟรีแลนซ์ (40(2))',
    isTaxable: true,
    desc: 'งานพิเศษ รายชั่วโมง รับจ้างอิสระ ค่าสอนพิเศษ',
  },
  allowance: {
    label: 'เงินจากครอบครัว / ค่าขนม',
    isTaxable: false,
    desc: 'เงินที่ผู้ปกครอง/ครอบครัวให้ ได้รับยกเว้นภาษี 100%',
  },
  scholarship: {
    label: 'ทุนการศึกษา / เงินรางวัล',
    isTaxable: false,
    desc: 'ทุนการศึกษา เงินสนับสนุนจากสถาบัน ได้รับยกเว้นภาษี',
  },
  investment: {
    label: 'ผลตอบแทนการลงทุน',
    isTaxable: false,
    desc: 'เงินปันผล ดอกเบี้ย กำไรหุ้น',
  },
  other: {
    label: 'รายรับอื่นๆ',
    isTaxable: false,
    desc: 'เงินคืน ขายของมือสอง เบ็ดเตล็ด',
  },
};

export function analyzeIncomeStreams(
  transactions: Transaction[],
  yearFilter?: number
): IncomeAnalysisResult {
  const filtered = transactions.filter((tx) => {
    if (tx.type !== 'income') return false;
    if (yearFilter) {
      return tx.transaction_date.startsWith(String(yearFilter));
    }
    return true;
  });

  const streamMap = new Map<
    IncomeType,
    { net: number; gross: number; wht: number; count: number }
  >();

  let totalIncomeAll = 0;
  let taxableIncomeTotal = 0;
  let exemptIncomeTotal = 0;
  let withholdingTaxTotal = 0;
  let predictableIncomeTotal = 0;

  for (const tx of filtered) {
    let incType: IncomeType = tx.income_type || (tx.is_salary ? 'salary' : 'other');
    if (!tx.income_type && !tx.is_salary) {
      const desc = tx.description.toLowerCase();
      if (
        desc.includes('แม่') ||
        desc.includes('พ่อ') ||
        desc.includes('ค่าขนม') ||
        desc.includes('ครอบครัว') ||
        desc.includes('บ้าน')
      ) {
        incType = 'allowance';
      } else if (
        desc.includes('พาร์ทไทม์') ||
        desc.includes('part-time') ||
        desc.includes('ฟรีแลนซ์') ||
        desc.includes('สอนพิเศษ')
      ) {
        incType = 'freelance_part_time';
      }
    }

    const net = tx.net_amount;
    const gross = tx.gross_amount || net + (tx.withholding_tax_amount || 0);
    const wht = tx.withholding_tax_amount || 0;

    totalIncomeAll += net;
    withholdingTaxTotal += wht;

    const info = INCOME_TYPE_LABELS[incType];
    if (info && info.isTaxable) {
      taxableIncomeTotal += gross;
    } else {
      exemptIncomeTotal += net;
    }

    if (incType === 'salary' || incType === 'allowance') {
      predictableIncomeTotal += net;
    }

    const current = streamMap.get(incType) || { net: 0, gross: 0, wht: 0, count: 0 };
    streamMap.set(incType, {
      net: current.net + net,
      gross: current.gross + gross,
      wht: current.wht + wht,
      count: current.count + 1,
    });
  }

  const sources: IncomeSourceSummary[] = Array.from(streamMap.entries())
    .map(([type, val]) => {
      const labelInfo = INCOME_TYPE_LABELS[type] || { label: type, isTaxable: false };
      return {
        type,
        label: labelInfo.label,
        totalNet: val.net,
        totalGross: val.gross,
        withholdingTaxTotal: val.wht,
        count: val.count,
        percentage: totalIncomeAll > 0 ? Math.round((val.net / totalIncomeAll) * 1000) / 10 : 0,
        isTaxable: labelInfo.isTaxable,
      };
    })
    .sort((a, b) => b.totalNet - a.totalNet);

  const predictableRatio =
    totalIncomeAll > 0 ? Math.round((predictableIncomeTotal / totalIncomeAll) * 100) : 0;

  return {
    sources,
    totalIncomeAll,
    taxableIncomeTotal,
    exemptIncomeTotal,
    withholdingTaxTotal,
    predictableRatio,
  };
}
