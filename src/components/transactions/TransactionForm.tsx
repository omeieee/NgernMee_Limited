import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Coins,
  ArrowDownCircle,
  ArrowUpCircle,
  Info,
  Calendar,
  Briefcase,
  AlertCircle,
  Gift,
  Coffee,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CategoryIcon } from '../ui/CategoryIcon';
import { CategoryPicker } from '../categories/CategoryPicker';
import { useAppStore } from '../../stores/useAppStore';
import { useCategories } from '../../hooks/useCategories';
import { useThaiChuayThai } from '../../hooks/useThaiChuayThai';
import { formatCurrency, cn } from '../../lib/utils';
import type { Transaction, TransactionType, IncomeType } from '../../lib/types';
import {
  calculateDraftAmounts,
  buildTransactionPayload,
  validateTransactionDraft,
  suggestTransactionMeta,
  extractDescriptionSuggestions,
  type DescriptionSuggestion,
} from '../../packages/transaction-draft';

interface TransactionFormProps {
  initialData?: Partial<Transaction> | null;
  onSubmit: (
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ) => Promise<void>;
  onCancel?: () => void;
  isModal?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isModal = false,
}) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState<string>(
    initialData?.amount ? String(initialData.amount) : ''
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState<string | null>(initialData?.category_id ?? null);
  const [transactionDate, setTransactionDate] = useState(
    initialData?.transaction_date || new Date().toISOString().slice(0, 10)
  );
  const [isThaiChuayThai, setIsThaiChuayThai] = useState(initialData?.is_thai_chuay_thai || false);
  const [incomeType, setIncomeType] = useState<IncomeType>(
    initialData?.income_type || (initialData?.is_salary ? 'salary' : 'allowance')
  );
  const [hasWht, setHasWht] = useState<boolean>(
    Boolean(initialData?.withholding_tax_amount && initialData.withholding_tax_amount > 0)
  );
  const [whtRate, setWhtRate] = useState<number>(initialData?.withholding_tax_rate || 3);
  const [customWhtAmount, setCustomWhtAmount] = useState<string>(
    initialData?.withholding_tax_amount ? String(initialData.withholding_tax_amount) : ''
  );
  const [errors, setErrors] = useState<{ amount?: string; description?: string; form?: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook for Thai Chuay Thai calculations and limits
  const { quota, calculateForExpense } = useThaiChuayThai(transactionDate);

  // Store and category context for history suggestions
  const { transactions } = useAppStore();
  const { categoriesMap } = useCategories();

  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const descContainerRef = useRef<HTMLDivElement>(null);

  // Close suggestion popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (descContainerRef.current && !descContainerRef.current.contains(e.target as Node)) {
        setIsSuggestOpen(false);
      }
    };
    if (isSuggestOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSuggestOpen]);

  // Derived description suggestions matching input
  const suggestions = useMemo(() => {
    return extractDescriptionSuggestions(transactions, {
      type,
      query: description,
      limit: 6,
    });
  }, [transactions, type, description]);

  // Top recent suggestions for instant 1-tap chips
  const topRecentSuggestions = useMemo(() => {
    return extractDescriptionSuggestions(transactions, {
      type,
      query: '',
      limit: 4,
    });
  }, [transactions, type]);

  const handleSelectSuggestion = (s: DescriptionSuggestion) => {
    setDescription(s.description);
    if (s.categoryId) {
      setCategoryId(s.categoryId);
    }
    setErrors((prev) => ({ ...prev, description: undefined }));
    setIsSuggestOpen(false);

    if (!initialData?.id) {
      const meta = suggestTransactionMeta(s.description, type);
      if (meta.suggestedType && meta.suggestedType !== type) {
        setType(meta.suggestedType);
      }
      if (meta.suggestedIncomeType) {
        setIncomeType(meta.suggestedIncomeType);
      }
      if (meta.suggestedHasWht !== undefined) {
        setHasWht(meta.suggestedHasWht);
      }
      if (meta.suggestedThaiChuayThai !== undefined) {
        setIsThaiChuayThai(meta.suggestedThaiChuayThai);
      }
    }
  };

  // Sync initial data if changed
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setDescription(initialData.description || '');
      setCategoryId(initialData.category_id ?? null);
      setTransactionDate(initialData.transaction_date || new Date().toISOString().slice(0, 10));
      setIsThaiChuayThai(Boolean(initialData.is_thai_chuay_thai));
      setIncomeType(initialData.income_type || (initialData.is_salary ? 'salary' : 'allowance'));
      setHasWht(
        Boolean(initialData.withholding_tax_amount && initialData.withholding_tax_amount > 0)
      );
      setWhtRate(initialData.withholding_tax_rate || 3);
      setCustomWhtAmount(
        initialData.withholding_tax_amount ? String(initialData.withholding_tax_amount) : ''
      );
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setCategoryId(null);
      setTransactionDate(new Date().toISOString().slice(0, 10));
      setIsThaiChuayThai(false);
      setIncomeType('allowance');
      setHasWht(false);
      setWhtRate(3);
      setCustomWhtAmount('');
    }
    setErrors({});
  }, [initialData]);

  const numAmount = parseFloat(amount) || 0;
  const thaiChuayThaiCalc = calculateForExpense(numAmount);

  // Live calculation delegated to transaction-draft deep module
  const draftAmounts = calculateDraftAmounts({
    type,
    amount: numAmount,
    isThaiChuayThai,
    thaiChuayThaiDiscount: thaiChuayThaiCalc.effectiveDiscount,
    incomeType,
    hasWht,
    whtRate,
    customWhtAmount: customWhtAmount ? parseFloat(customWhtAmount) || null : null,
  });

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDescription(val);
    setErrors((prev) => ({ ...prev, description: undefined }));

    // Heuristic smart suggestions on new transaction entry
    if (!initialData?.id) {
      const meta = suggestTransactionMeta(val, type);
      if (meta.suggestedType && meta.suggestedType !== type) {
        setType(meta.suggestedType);
      }
      if (meta.suggestedIncomeType) {
        setIncomeType(meta.suggestedIncomeType);
      }
      if (meta.suggestedHasWht !== undefined) {
        setHasWht(meta.suggestedHasWht);
      }
      if (meta.suggestedThaiChuayThai !== undefined) {
        setIsThaiChuayThai(meta.suggestedThaiChuayThai);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTransactionDraft({
      type,
      amount: numAmount,
      description,
      category_id: categoryId,
      transaction_date: transactionDate,
      is_thai_chuay_thai: isThaiChuayThai,
      income_type: incomeType,
      has_wht: hasWht,
      wht_rate: whtRate,
      custom_wht_amount: customWhtAmount ? parseFloat(customWhtAmount) || null : null,
    });

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const payload = buildTransactionPayload(
        {
          type,
          amount: numAmount,
          description: validation.data.description,
          category_id: categoryId,
          transaction_date: transactionDate,
          is_thai_chuay_thai: isThaiChuayThai,
          income_type: incomeType,
          has_wht: hasWht,
          wht_rate: whtRate,
          custom_wht_amount: customWhtAmount ? parseFloat(customWhtAmount) || null : null,
        },
        { effectiveDiscount: thaiChuayThaiCalc.effectiveDiscount }
      );

      await onSubmit(payload);

      // Clear form if not in edit mode
      if (!initialData?.id) {
        setAmount('');
        setDescription('');
        setCategoryId(null);
        setIsThaiChuayThai(false);
        setHasWht(false);
        setCustomWhtAmount('');
        setErrors({});
      }
    } catch (err) {
      console.error('Submit transaction failed:', err);
      setErrors((prev) => ({
        ...prev,
        form:
          err instanceof Error
            ? err.message
            : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert Banner */}
      {errors.form && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center justify-between">
          <span>{errors.form}</span>
          <button
            type="button"
            onClick={() => setErrors((prev) => ({ ...prev, form: undefined }))}
            className="text-rose-500 hover:text-rose-700 ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Type Toggle: Expense / Income */}
      <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
        <button
          type="button"
          onClick={() => {
            setType('expense');
          }}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all min-h-[44px] touch-manipulation active:scale-[0.98]',
            type === 'expense'
              ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <ArrowDownCircle
            className={cn(
              'h-4 w-4',
              type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
            )}
          />
          <span>รายจ่าย (Expense)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setType('income');
            setIsThaiChuayThai(false);
          }}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all min-h-[44px] touch-manipulation active:scale-[0.98]',
            type === 'income'
              ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <ArrowUpCircle
            className={cn(
              'h-4 w-4',
              type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
            )}
          />
          <span>รายรับ (Income)</span>
        </button>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          จำนวนเงิน (บาท)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-3 text-sm font-semibold text-slate-400">฿</span>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            className={cn(
              'h-12 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 text-base sm:text-lg font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 shadow-2xs transition-all touch-manipulation',
              errors.amount && 'border-rose-500 focus-visible:ring-rose-500/20'
            )}
            autoFocus={!initialData}
          />
        </div>
        {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
      </div>

      {/* Description with autocomplete & category memory */}
      <div className="relative w-full" ref={descContainerRef}>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            รายละเอียดรายการ{' '}
            <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
              (ไม่บังคับ - เริ่มต้น "อื่นๆ")
            </span>
          </label>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="เช่น ค่าข้าวมันไก่, เงินเดือน, กาแฟ (ถ้าไม่ระบุจะเป็น อื่นๆ)"
            value={description}
            onFocus={() => setIsSuggestOpen(true)}
            onChange={handleDescriptionChange}
            onBlur={() => {
              if (!categoryId && description.trim()) {
                const exact = suggestions.find(
                  (s) => s.description.toLowerCase() === description.trim().toLowerCase()
                );
                if (exact?.categoryId) {
                  setCategoryId(exact.categoryId);
                }
              }
            }}
            className={cn(
              'flex h-11 sm:h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-base sm:text-sm shadow-2xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:placeholder:text-slate-500 dark:text-slate-100 transition-all touch-manipulation',
              errors.description && 'border-rose-500'
            )}
          />
        </div>
        {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}

        {/* Suggestion Dropdown Popover */}
        {isSuggestOpen && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-1 mb-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>รายการที่เคยบันทึกไว้ (คลิกเพื่อเลือกพร้อมหมวดหมู่):</span>
            </div>
            <div className="space-y-0.5">
              {suggestions.map((s, idx) => {
                const cat = s.categoryId ? categoriesMap.get(s.categoryId) : null;
                return (
                  <button
                    key={`${s.description}-${idx}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(s);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-left touch-manipulation cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {s.description}
                      </span>
                      {s.count > 1 && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-full shrink-0">
                          {s.count} ครั้ง
                        </span>
                      )}
                    </div>

                    {cat ? (
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <div
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs text-white shadow-2xs"
                          style={{ backgroundColor: cat.color || '#10b981' }}
                        >
                          <CategoryIcon name={cat.icon} className="h-2.5 w-2.5" />
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                          {cat.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">อื่นๆ</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips below input for instant 1-tap when input is not focused or empty */}
        {topRecentSuggestions.length > 0 && !isSuggestOpen && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>ใช้บ่อย:</span>
            </span>
            {topRecentSuggestions.map((s, idx) => {
              const cat = s.categoryId ? categoriesMap.get(s.categoryId) : null;
              return (
                <button
                  key={`chip-${idx}`}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 transition-colors touch-manipulation active:scale-95"
                  title={`เลือก "${s.description}" ${cat ? `(หมวด: ${cat.name})` : ''}`}
                >
                  {cat && (
                    <div
                      className="flex h-3.5 w-3.5 items-center justify-center rounded-xs text-white"
                      style={{ backgroundColor: cat.color || '#10b981' }}
                    >
                      <CategoryIcon name={cat.icon} className="h-2 w-2" />
                    </div>
                  )}
                  <span>{s.description}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Picker */}
      <CategoryPicker value={categoryId} onChange={(id) => setCategoryId(id)} type={type} />

      {/* Date Picker */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          วันที่ทำรายการ
        </label>
        <div className="relative">
          <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="flex h-11 sm:h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-base sm:text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 shadow-2xs touch-manipulation"
          />
        </div>
      </div>

      {/* Expense-only: Optional Thai Chuay Thai 60/40 Co-pay */}
      {type === 'expense' && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label
            htmlFor="thai-chuay-thai-toggle"
            className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              id="thai-chuay-thai-toggle"
              checked={isThaiChuayThai}
              onChange={(e) => setIsThaiChuayThai(e.target.checked)}
              className="h-4 w-4 rounded-sm border-slate-300 text-slate-900 dark:border-slate-700 dark:bg-slate-800 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              ใช้สิทธิ์คนละครึ่ง / ไทยช่วยไทย 60/40{' '}
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-normal">
                (ตัวเลือกเสริม)
              </span>
            </span>
          </label>

          {isThaiChuayThai && (
            <div className="mt-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60 space-y-2 text-xs">
              {/* Calculation Breakdown */}
              <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[11px]">ส่วนลดรัฐช่วยจ่าย (60%):</span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatCurrency(draftAmounts.discount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">คุณจ่ายสุทธิ (40%):</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrency(draftAmounts.net)}
                  </span>
                </div>
              </div>

              {/* Quota Cap Warning */}
              {thaiChuayThaiCalc.isCapped && (
                <div className="flex items-start gap-1.5 text-amber-700 dark:text-amber-300 text-[11px] bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/70 dark:border-amber-800/70">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>
                    {thaiChuayThaiCalc.capReason === 'daily' &&
                      'ยอดส่วนลดถูกจำกัดด้วยเพดานรายวัน (สูงสุด 200 บาท/วัน)'}
                    {thaiChuayThaiCalc.capReason === 'monthly' &&
                      'ยอดส่วนลดถูกจำกัดด้วยเพดานรายเดือน (สูงสุด 1,000 บาท/เดือน)'}
                    {thaiChuayThaiCalc.capReason === 'both' &&
                      'ยอดส่วนลดเต็มเพดานทั้งรายวันและรายเดือน'}
                  </span>
                </div>
              )}

              {/* Quota Status */}
              <div className="flex justify-between text-[11px] text-slate-400 px-1">
                <span>โควตาวันนี้คงเหลือ: {formatCurrency(quota.dailyRemaining)}</span>
                <span>โควตาเดือนนี้คงเหลือ: {formatCurrency(quota.monthlyRemaining)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Income-only: Source & Tax Classification */}
      {type === 'income' && (
        <div className="space-y-3 pt-1">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            แหล่งที่มาของรายรับ (Income Source)
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Option 1: Family Allowance */}
            <button
              type="button"
              onClick={() => {
                setIncomeType('allowance');
                setHasWht(false);
              }}
              className={cn(
                'flex flex-col items-start p-2.5 rounded-xl border text-left transition-all touch-manipulation',
                incomeType === 'allowance'
                  ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 ring-1 ring-amber-500'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-700 dark:text-amber-400">
                <Gift className="h-3.5 w-3.5" />
                <span>เงินจากครอบครัว / ค่าขนม</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                พ่อแม่โอนให้ (ยกเว้นภาษี 100%)
              </span>
            </button>

            {/* Option 2: Part-time / Freelance */}
            <button
              type="button"
              onClick={() => setIncomeType('freelance_part_time')}
              className={cn(
                'flex flex-col items-start p-2.5 rounded-xl border text-left transition-all touch-manipulation',
                incomeType === 'freelance_part_time'
                  ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-blue-700 dark:text-blue-400">
                <Coffee className="h-3.5 w-3.5" />
                <span>พาร์ทไทม์ / ฟรีแลนซ์</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                มาตรา 40(2) (มีหักภาษี ณ ที่จ่าย)
              </span>
            </button>

            {/* Option 3: Salary */}
            <button
              type="button"
              onClick={() => {
                setIncomeType('salary');
                setHasWht(false);
              }}
              className={cn(
                'flex flex-col items-start p-2.5 rounded-xl border text-left transition-all touch-manipulation',
                incomeType === 'salary'
                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-700 dark:text-emerald-400">
                <Briefcase className="h-3.5 w-3.5" />
                <span>เงินเดือนประจำ</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                มาตรา 40(1) งานประจำ
              </span>
            </button>

            {/* Option 4: Scholarship */}
            <button
              type="button"
              onClick={() => {
                setIncomeType('scholarship');
                setHasWht(false);
              }}
              className={cn(
                'flex flex-col items-start p-2.5 rounded-xl border text-left transition-all touch-manipulation',
                incomeType === 'scholarship'
                  ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-500'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-indigo-700 dark:text-indigo-400">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>ทุนการศึกษา</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                เงินสนับสนุน (ยกเว้นภาษี)
              </span>
            </button>

            {/* Option 5: Investment / Other */}
            <button
              type="button"
              onClick={() => setIncomeType('other')}
              className={cn(
                'col-span-2 sm:col-span-2 flex flex-col items-start p-2.5 rounded-xl border text-left transition-all touch-manipulation',
                incomeType === 'other' || incomeType === 'investment'
                  ? 'border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-slate-400'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              )}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-700 dark:text-slate-300">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>รายรับอื่นๆ / ลงทุน</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                ขายของมือสอง เงินปันผล เบ็ดเตล็ด
              </span>
            </button>
          </div>

          {/* Context Notice for Family Allowance */}
          {incomeType === 'allowance' && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 p-2.5 border border-amber-200/70 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-200">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                เงินค่าขนมหรือเงินช่วยเหลือจากผู้ปกครอง ได้รับยกเว้นภาษีตามกฎหมายไทย
                ไม่นำไปคิดภาษีเงินได้
              </span>
            </div>
          )}

          {/* Withholding Tax (WHT) Section for Part-time / Freelance / Other */}
          {(incomeType === 'freelance_part_time' || incomeType === 'other') && (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="wht-toggle"
                  className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    id="wht-toggle"
                    checked={hasWht}
                    onChange={(e) => setHasWht(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>ถูกหักภาษี ณ ที่จ่าย (Withholding Tax / 50 ทวิ)</span>
                </label>
                {hasWht && (
                  <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                    สะสมไว้ขอคืนภาษีได้!
                  </span>
                )}
              </div>

              {hasWht && (
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-slate-500 text-[11px]">อัตราที่หัก:</span>
                    {[
                      { rate: 3, label: '3% (บริการ/จ้างทำของ)' },
                      { rate: 1, label: '1% (ขนส่ง)' },
                      { rate: 5, label: '5% (รางวัล)' },
                    ].map((item) => (
                      <button
                        key={item.rate}
                        type="button"
                        onClick={() => {
                          setWhtRate(item.rate);
                          setCustomWhtAmount('');
                        }}
                        className={cn(
                          'px-2 py-1 rounded-md text-[11px] font-medium transition-all touch-manipulation',
                          whtRate === item.rate && !customWhtAmount
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Calculated WHT breakdown */}
                  {numAmount > 0 && (
                    <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">ยอดเงินจ้างรวม:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                          {formatCurrency(draftAmounts.gross)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          ถูกหักภาษี {whtRate}%:
                        </span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                          -{formatCurrency(draftAmounts.whtAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          เงินเข้ากระเป๋าจริง:
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {formatCurrency(draftAmounts.net)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-h-[44px] px-4 touch-manipulation"
          >
            ยกเลิก
          </Button>
        )}
        <Button
          type="submit"
          variant={type === 'expense' ? 'danger' : 'default'}
          isLoading={isSubmitting}
          className="min-h-[44px] px-5 touch-manipulation font-semibold flex-1 sm:flex-initial"
        >
          {initialData?.id
            ? 'บันทึกการแก้ไข'
            : type === 'expense'
              ? 'บันทึกรายจ่าย'
              : 'บันทึกรายรับ'}
        </Button>
      </div>
    </form>
  );
};
