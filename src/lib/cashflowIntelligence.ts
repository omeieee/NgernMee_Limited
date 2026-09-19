// src/lib/cashflowIntelligence.ts
// Cashflow Runway & Multi-Stream Income Analytics for irregular earners, students, and freelancers

import type { Category, CashflowRunway, IncomeType, Transaction } from './types';

// Keywords that indicate essential baseline survival expenses
const ESSENTIAL_CATEGORY_KEYWORDS = [
  'อาหาร',
  'อาหารประจำวัน',
  'ที่อยู่อาศัย',
  'ค่าเช่าห้อง',
  'ผ่อนบ้าน',
  'สาธารณูปโภค',
  'ค่าไฟฟ้า',
  'ค่าน้ำประปา',
  'ค่าอินเทอร์เน็ต',
  'สุขภาพ',
  'ค่ายา',
  'การศึกษา',
  'เดินทาง',
  'รถไฟฟ้า',
];

/**
 * Determines whether a transaction belongs to essential baseline survival needs
 */
export function isEssentialExpense(tx: Transaction, categoriesMap: Map<string, Category>): boolean {
  if (tx.type !== 'expense') return false;

  if (tx.category_id) {
    const category = categoriesMap.get(tx.category_id);
    if (category) {
      const name = category.name.toLowerCase();
      if (ESSENTIAL_CATEGORY_KEYWORDS.some((kw) => name.includes(kw))) {
        return true;
      }
    }
  }

  // Check description
  const desc = tx.description.toLowerCase();
  return ESSENTIAL_CATEGORY_KEYWORDS.some((kw) => desc.includes(kw));
}

/**
 * Calculates Cashflow Runway (how long current money can sustain life without new income)
 */
export function calculateCashflowRunway(
  transactions: Transaction[],
  categoriesMap: Map<string, Category>,
  referenceDate: Date = new Date()
): CashflowRunway {
  // 1. Calculate current liquid balance across all transactions
  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.net_amount;
    } else {
      totalExpense += tx.net_amount;
    }
  }

  const currentLiquidBalance = Math.max(0, totalIncome - totalExpense);

  // 2. Identify essential expenses over the last 30-90 days to estimate monthly burn rate
  const now = referenceDate;
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

  const essentialCategoryMap = new Map<string, number>();
  let recentEssentialTotal = 0;
  let recentTotalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.transaction_date >= thirtyDaysAgoStr) {
      recentTotalExpense += tx.net_amount;
      if (isEssentialExpense(tx, categoriesMap)) {
        recentEssentialTotal += tx.net_amount;
        const cat = tx.category_id ? categoriesMap.get(tx.category_id) : null;
        const catName = cat?.name || 'ค่าใช้จ่ายจำเป็นอื่นๆ';
        essentialCategoryMap.set(catName, (essentialCategoryMap.get(catName) || 0) + tx.net_amount);
      }
    }
  }

  // If no 30-day data, fallback to all-time monthly average
  let monthlyEssential = recentEssentialTotal;
  if (monthlyEssential <= 0) {
    // Estimate from all-time data
    const allEssential = transactions
      .filter((t) => isEssentialExpense(t, categoriesMap))
      .reduce((sum, t) => sum + t.net_amount, 0);
    monthlyEssential = allEssential > 0 ? Math.round(allEssential / 3) : Math.max(5000, recentTotalExpense);
  }

  // Calculate remaining days in the current month
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = now.getDate();
  const remainingDays = Math.max(1, daysInMonth - currentDay + 1);

  // Runway calculation
  const safeBurnPerMonth = Math.max(1, monthlyEssential);
  const runwayMonths = Math.round((currentLiquidBalance / safeBurnPerMonth) * 10) / 10;
  const runwayDays = Math.round((currentLiquidBalance / (safeBurnPerMonth / 30)));
  const safeDailySpend = Math.max(0, Math.round((currentLiquidBalance / remainingDays) * 100) / 100);

  const essentialCategoriesSpending = Array.from(essentialCategoryMap.entries())
    .map(([categoryName, amount]) => ({ categoryName, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    currentLiquidBalance,
    monthlyEssentialExpenses: monthlyEssential,
    runwayMonths,
    runwayDays,
    safeDailySpend,
    isCriticalRunway: runwayMonths < 1.0 && currentLiquidBalance < monthlyEssential,
    essentialCategoriesSpending,
  };
}

export interface IncomeSourceSummary {
  type: IncomeType;
  label: string;
  totalNet: number;
  totalGross: number;
  withholdingTaxTotal: number;
  count: number;
  percentage: number;
  isTaxable: boolean;
}

export const INCOME_TYPE_LABELS: Record<IncomeType, { label: string; isTaxable: boolean; desc: string }> = {
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

/**
 * Analyzes and aggregates all income streams across transactions
 */
export function analyzeIncomeStreams(transactions: Transaction[], yearFilter?: number): {
  sources: IncomeSourceSummary[];
  totalIncomeAll: number;
  taxableIncomeTotal: number;
  exemptIncomeTotal: number;
  withholdingTaxTotal: number;
  predictableRatio: number; // Percentage of guaranteed income (salary + family allowance)
} {
  const filtered = transactions.filter((tx) => {
    if (tx.type !== 'income') return false;
    if (yearFilter) {
      return tx.transaction_date.startsWith(String(yearFilter));
    }
    return true;
  });

  const streamMap = new Map<IncomeType, { net: number; gross: number; wht: number; count: number }>();

  let totalIncomeAll = 0;
  let taxableIncomeTotal = 0;
  let exemptIncomeTotal = 0;
  let withholdingTaxTotal = 0;
  let predictableIncomeTotal = 0;

  for (const tx of filtered) {
    // Determine income type: fallback to 'salary' if is_salary is true, or 'allowance' if description mentions family/pocket money
    let incType: IncomeType = tx.income_type || (tx.is_salary ? 'salary' : 'other');
    if (!tx.income_type && !tx.is_salary) {
      const desc = tx.description.toLowerCase();
      if (desc.includes('แม่') || desc.includes('พ่อ') || desc.includes('ค่าขนม') || desc.includes('ครอบครัว') || desc.includes('บ้าน')) {
        incType = 'allowance';
      } else if (desc.includes('พาร์ทไทม์') || desc.includes('part-time') || desc.includes('ฟรีแลนซ์') || desc.includes('สอนพิเศษ')) {
        incType = 'freelance_part_time';
      }
    }

    const net = tx.net_amount;
    const gross = tx.gross_amount || (net + (tx.withholding_tax_amount || 0));
    const wht = tx.withholding_tax_amount || 0;

    totalIncomeAll += net;
    withholdingTaxTotal += wht;

    const info = INCOME_TYPE_LABELS[incType];
    if (info.isTaxable) {
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

  const sources: IncomeSourceSummary[] = Array.from(streamMap.entries()).map(([type, val]) => ({
    type,
    label: INCOME_TYPE_LABELS[type].label,
    totalNet: val.net,
    totalGross: val.gross,
    withholdingTaxTotal: val.wht,
    count: val.count,
    percentage: totalIncomeAll > 0 ? Math.round((val.net / totalIncomeAll) * 1000) / 10 : 0,
    isTaxable: INCOME_TYPE_LABELS[type].isTaxable,
  })).sort((a, b) => b.totalNet - a.totalNet);

  const predictableRatio = totalIncomeAll > 0 ? Math.round((predictableIncomeTotal / totalIncomeAll) * 100) : 0;

  return {
    sources,
    totalIncomeAll,
    taxableIncomeTotal,
    exemptIncomeTotal,
    withholdingTaxTotal,
    predictableRatio,
  };
}
