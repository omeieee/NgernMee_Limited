import type { Category, CashflowRunway, Transaction } from '../../../lib/types';

const ESSENTIAL_KEYWORDS = [
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

export function isEssentialExpense(tx: Transaction, categoriesMap: Map<string, Category>): boolean {
  if (tx.type !== 'expense') return false;
  if (tx.category_id) {
    const category = categoriesMap.get(tx.category_id);
    if (category && ESSENTIAL_KEYWORDS.some((kw) => category.name.toLowerCase().includes(kw))) {
      return true;
    }
  }
  const desc = tx.description.toLowerCase();
  return ESSENTIAL_KEYWORDS.some((kw) => desc.includes(kw));
}

export function calculateCashflowRunway(
  transactions: Transaction[],
  categoriesMap: Map<string, Category>,
  referenceDate: Date = new Date()
): CashflowRunway {
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

  let monthlyEssential = recentEssentialTotal;
  if (monthlyEssential <= 0) {
    const allEssential = transactions
      .filter((t) => isEssentialExpense(t, categoriesMap))
      .reduce((sum, t) => sum + t.net_amount, 0);
    monthlyEssential =
      allEssential > 0 ? Math.round(allEssential / 3) : Math.max(5000, recentTotalExpense);
  }

  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const daysRemainingInMonth = Math.max(1, lastDayOfMonth - now.getDate());

  const daysInMonth = lastDayOfMonth;
  const remainingDays = daysRemainingInMonth;

  const safeBurnPerMonth = Math.max(1, monthlyEssential);
  const runwayMonths = Math.round((currentLiquidBalance / safeBurnPerMonth) * 10) / 10;
  const runwayDays = Math.round(currentLiquidBalance / (safeBurnPerMonth / 30));
  const safeDailySpend = Math.max(
    0,
    Math.round((currentLiquidBalance / remainingDays) * 100) / 100
  );

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
