import type {
  IncomeType,
  ThaiChuayThaiQuota,
  Transaction,
  TransactionType,
} from '../../../lib/types';
import { calculateDiscount, getDailyUsage, getMonthlyUsage, getRemainingQuota } from './copay';
import { validateTransactionDraft } from './schema';
import type {
  DraftAmountsCalculation,
  TransactionDraftInput,
  TransactionPayload,
  DescriptionSuggestion,
} from './types';

export interface BuildPayloadOptions {
  effectiveDiscount?: number;
  ledger?: Transaction[];
}

export interface IntakeTransactionResult {
  success: boolean;
  payload?: TransactionPayload;
  errors?: Record<string, string>;
  copayStatus?: ThaiChuayThaiQuota;
}

export interface DraftCalculationOptions {
  type: TransactionType;
  amount: number;
  isThaiChuayThai?: boolean;
  thaiChuayThaiDiscount?: number;
  incomeType?: IncomeType;
  hasWht?: boolean;
  whtRate?: number;
  customWhtAmount?: number | null;
}

/**
 * Calculates net, gross, discount, and withholding tax amounts for transactions
 */
export function calculateDraftAmounts(opts: DraftCalculationOptions): DraftAmountsCalculation {
  const {
    type,
    amount,
    isThaiChuayThai = false,
    thaiChuayThaiDiscount = 0,
    incomeType,
    hasWht = false,
    whtRate = 3,
    customWhtAmount = null,
  } = opts;

  const validAmount = Math.max(0, amount);

  if (type === 'expense') {
    const discount = isThaiChuayThai ? Math.max(0, thaiChuayThaiDiscount) : 0;
    const net = Math.max(0, Math.round((validAmount - discount) * 100) / 100);
    return {
      gross: validAmount,
      net,
      discount,
      whtAmount: 0,
      whtRate: 0,
    };
  }

  // Income transactions
  let calculatedWht = 0;
  let effectiveWhtRate = 0;

  if (
    hasWht &&
    (incomeType === 'freelance_part_time' || incomeType === 'salary' || incomeType === 'other')
  ) {
    effectiveWhtRate = Math.max(0, whtRate);
    if (customWhtAmount !== null && customWhtAmount !== undefined && customWhtAmount > 0) {
      calculatedWht = customWhtAmount;
    } else {
      calculatedWht = Math.round(validAmount * (effectiveWhtRate / 100) * 100) / 100;
    }
  }

  const net = Math.max(0, Math.round((validAmount - calculatedWht) * 100) / 100);

  return {
    gross: validAmount,
    net,
    discount: 0,
    whtAmount: calculatedWht,
    whtRate: effectiveWhtRate,
  };
}

/**
 * Transforms form draft input into a complete TransactionPayload ready for storage.
 * If options.effectiveDiscount is omitted, automatically computes it from options.ledger.
 */
export function buildTransactionPayload(
  draft: TransactionDraftInput,
  options?: BuildPayloadOptions
): TransactionPayload {
  const numAmount = typeof draft.amount === 'number' ? draft.amount : parseFloat(draft.amount) || 0;
  const customWht = draft.custom_wht_amount
    ? typeof draft.custom_wht_amount === 'number'
      ? draft.custom_wht_amount
      : parseFloat(draft.custom_wht_amount) || null
    : null;

  let effectiveDiscount = options?.effectiveDiscount;
  if (
    effectiveDiscount === undefined &&
    draft.type === 'expense' &&
    draft.is_thai_chuay_thai &&
    options?.ledger
  ) {
    const targetDate = draft.transaction_date || new Date().toISOString().slice(0, 10);
    const dailyUsed = getDailyUsage(options.ledger, targetDate);
    const monthlyUsed = getMonthlyUsage(options.ledger, targetDate);
    effectiveDiscount = calculateDiscount(numAmount, dailyUsed, monthlyUsed).effectiveDiscount;
  }

  const amounts = calculateDraftAmounts({
    type: draft.type,
    amount: numAmount,
    isThaiChuayThai: draft.is_thai_chuay_thai,
    thaiChuayThaiDiscount: effectiveDiscount ?? 0,
    incomeType: draft.income_type,
    hasWht: draft.has_wht,
    whtRate: draft.wht_rate ?? 3,
    customWhtAmount: customWht,
  });

  const rawDesc = typeof draft.description === 'string' ? draft.description.trim() : '';
  const finalDescription = rawDesc.length > 0 ? rawDesc : 'อื่นๆ';

  return {
    type: draft.type,
    amount: numAmount,
    gross_amount: amounts.gross,
    net_amount: amounts.net,
    description: finalDescription,
    category_id: draft.category_id || null,
    transaction_date: draft.transaction_date,
    is_salary: draft.type === 'income' ? draft.income_type === 'salary' : false,
    income_type: draft.type === 'income' ? draft.income_type : undefined,
    withholding_tax_rate: draft.type === 'income' ? amounts.whtRate : 0,
    withholding_tax_amount: draft.type === 'income' ? amounts.whtAmount : 0,
    is_thai_chuay_thai: draft.type === 'expense' ? Boolean(draft.is_thai_chuay_thai) : false,
    thai_chuay_thai_discount: amounts.discount,
  };
}

/**
 * Deep module entry point: Validates draft, computes Co-Pay quota and Section 40 tax,
 * and produces ready-to-persist TransactionPayload in a single call.
 */
export function intakeTransaction(
  draft: TransactionDraftInput,
  options?: { ledger?: Transaction[] }
): IntakeTransactionResult {
  const validation = validateTransactionDraft(draft);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  const numAmount = typeof draft.amount === 'number' ? draft.amount : parseFloat(draft.amount) || 0;
  const ledger = options?.ledger || [];
  let copayStatus: ThaiChuayThaiQuota | undefined;
  let effectiveDiscount: number | undefined;

  if (draft.type === 'expense' && draft.is_thai_chuay_thai) {
    const targetDate = draft.transaction_date || new Date().toISOString().slice(0, 10);
    const dailyUsed = getDailyUsage(ledger, targetDate);
    const monthlyUsed = getMonthlyUsage(ledger, targetDate);
    effectiveDiscount = calculateDiscount(numAmount, dailyUsed, monthlyUsed).effectiveDiscount;
    copayStatus = getRemainingQuota(dailyUsed, monthlyUsed, numAmount);
  }

  const payload = buildTransactionPayload(
    {
      ...draft,
      description: validation.data.description,
    },
    { effectiveDiscount, ledger }
  );

  return {
    success: true,
    payload,
    copayStatus,
  };
}

/**
 * Provides heuristic smart suggestions based on user transaction description
 */
export function suggestTransactionMeta(
  description: string,
  currentType: TransactionType
): {
  suggestedType?: TransactionType;
  suggestedIncomeType?: IncomeType;
  suggestedHasWht?: boolean;
  suggestedThaiChuayThai?: boolean;
} {
  const text = description.toLowerCase().trim();
  if (!text) return {};

  if (text.includes('เงินเดือน') || text.includes('salary')) {
    return {
      suggestedType: 'income',
      suggestedIncomeType: 'salary',
      suggestedHasWht: false,
    };
  }

  if (
    text.includes('พาร์ทไทม์') ||
    text.includes('ฟรีแลนซ์') ||
    text.includes('รับจ้าง') ||
    text.includes('สอนพิเศษ')
  ) {
    return {
      suggestedType: 'income',
      suggestedIncomeType: 'freelance_part_time',
      suggestedHasWht: true,
    };
  }

  if (text.includes('แม่') || text.includes('พ่อ') || text.includes('ค่าขนม')) {
    return {
      suggestedType: 'income',
      suggestedIncomeType: 'allowance',
      suggestedHasWht: false,
    };
  }

  if (text.includes('ทุน') || text.includes('รางวัล')) {
    return {
      suggestedType: 'income',
      suggestedIncomeType: 'scholarship',
      suggestedHasWht: false,
    };
  }

  if (
    currentType === 'expense' &&
    (text.includes('คนละครึ่ง') || text.includes('รัฐช่วย') || text.includes('ตลาด'))
  ) {
    return {
      suggestedType: 'expense',
      suggestedThaiChuayThai: true,
    };
  }

  return {};
}

export interface DescriptionSuggestionOptions {
  type?: TransactionType;
  query?: string;
  limit?: number;
}

/**
 * Extracts and ranks historical description suggestions with their associated category
 */
export function extractDescriptionSuggestions(
  transactions: {
    type: TransactionType;
    description: string;
    category_id?: string | null;
    transaction_date?: string;
    created_at?: string;
  }[],
  options?: DescriptionSuggestionOptions
): DescriptionSuggestion[] {
  const { type, query = '', limit = 8 } = options || {};
  const cleanQuery = query.trim().toLowerCase();

  const map = new Map<
    string,
    {
      description: string;
      categoryCounts: Map<string, number>;
      nullCategoryCount: number;
      lastCategory: string | null;
      lastUsed: string;
      totalCount: number;
    }
  >();

  for (const tx of transactions) {
    if (type && tx.type !== type) continue;
    const desc = (tx.description || '').trim();
    if (!desc || desc === 'อื่นๆ') continue;

    const lowerDesc = desc.toLowerCase();
    const dateStr = tx.transaction_date || tx.created_at || '';

    let entry = map.get(lowerDesc);
    if (!entry) {
      entry = {
        description: desc,
        categoryCounts: new Map(),
        nullCategoryCount: 0,
        lastCategory: tx.category_id || null,
        lastUsed: dateStr,
        totalCount: 0,
      };
      map.set(lowerDesc, entry);
    }

    entry.totalCount += 1;
    if (dateStr && (!entry.lastUsed || dateStr >= entry.lastUsed)) {
      entry.lastUsed = dateStr;
      entry.lastCategory = tx.category_id || null;
    }

    if (tx.category_id) {
      entry.categoryCounts.set(tx.category_id, (entry.categoryCounts.get(tx.category_id) || 0) + 1);
    } else {
      entry.nullCategoryCount += 1;
    }
  }

  const results: DescriptionSuggestion[] = [];

  for (const entry of map.values()) {
    const lower = entry.description.toLowerCase();
    if (cleanQuery && !lower.includes(cleanQuery)) {
      continue;
    }

    let bestCatId: string | null = entry.lastCategory;
    let maxCount = 0;
    for (const [catId, cCount] of entry.categoryCounts.entries()) {
      if (cCount > maxCount) {
        maxCount = cCount;
        bestCatId = catId;
      }
    }

    results.push({
      description: entry.description,
      categoryId: bestCatId,
      count: entry.totalCount,
      lastUsed: entry.lastUsed,
    });
  }

  results.sort((a, b) => {
    if (cleanQuery) {
      const aStarts = a.description.toLowerCase().startsWith(cleanQuery);
      const bStarts = b.description.toLowerCase().startsWith(cleanQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
    }
    if (b.lastUsed !== a.lastUsed) {
      return b.lastUsed.localeCompare(a.lastUsed);
    }
    return b.count - a.count;
  });

  return results.slice(0, limit);
}
