// src/components/transactions/QuickTransactionSheet.tsx
// Mobile-first Quick Transaction Bottom Sheet adhering 100% to prototype_mobile_first.html (#quick-add-sheet) and Screenshot 2026-09-22 200228.png

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Sparkles,
  Check,
  ChevronDown,
  Layers,
  Search,
  MoreHorizontal,
  ChevronRight,
  BadgePercent,
  Calculator,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useCategories } from '../../hooks/useCategories';
import { intakeTransaction, extractDescriptionSuggestions } from '../../packages/transaction-draft';
import { CategoryIcon } from '../ui/CategoryIcon';
import { formatCurrency, formatThaiDate, cn } from '../../lib/utils';
import type { IncomeType, TransactionType, Transaction, Category } from '../../lib/types';

export interface QuickTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  onSuccess?: () => void;
}

const AMOUNT_PRESETS = [50, 100, 150, 300, 500];

export const QuickTransactionSheet: React.FC<QuickTransactionSheetProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  editingTransaction = null,
  onSuccess,
}) => {
  const { transactions, addTransaction, updateTransaction, getThaiChuayThaiStatus } = useAppStore();
  const { categories, categoriesMap } = useCategories();

  const isEditing = Boolean(editingTransaction);

  const [type, setType] = useState<TransactionType>(
    editingTransaction ? editingTransaction.type : initialType
  );
  const [amount, setAmount] = useState<string>(
    editingTransaction ? String(editingTransaction.amount) : '60'
  );
  const [description, setDescription] = useState<string>(
    editingTransaction ? editingTransaction.description : ''
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    editingTransaction ? editingTransaction.category_id : null
  );
  const [transactionDate, setTransactionDate] = useState<string>(
    editingTransaction ? editingTransaction.transaction_date : new Date().toISOString().slice(0, 10)
  );
  const [isCopay, setIsCopay] = useState<boolean>(
    editingTransaction ? Boolean(editingTransaction.is_thai_chuay_thai) : false
  );
  const [hasWht, setHasWht] = useState<boolean>(
    editingTransaction
      ? Boolean(
          editingTransaction.withholding_tax_amount && editingTransaction.withholding_tax_amount > 0
        )
      : false
  );
  const [whtRate, setWhtRate] = useState<number>(3);
  const [incomeType, setIncomeType] = useState<IncomeType>(
    editingTransaction?.income_type || 'salary'
  );

  const [isHierarchyOpen, setIsHierarchyOpen] = useState<boolean>(false);
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync state on open or editingTransaction change
  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(String(editingTransaction.amount));
        setDescription(editingTransaction.description);
        setCategoryId(editingTransaction.category_id);
        setTransactionDate(editingTransaction.transaction_date);
        setIsCopay(Boolean(editingTransaction.is_thai_chuay_thai));
        const hasTax = Boolean(
          editingTransaction.withholding_tax_amount && editingTransaction.withholding_tax_amount > 0
        );
        setHasWht(hasTax);
        if (hasTax && editingTransaction.amount > 0) {
          const impliedRate = Math.round(
            ((editingTransaction.withholding_tax_amount || 0) / editingTransaction.amount) * 100
          );
          setWhtRate(impliedRate || 3);
        }
        setIncomeType(editingTransaction.income_type || 'salary');
      } else {
        setType(initialType);
        setAmount('60');
        setDescription('');
        setTransactionDate(new Date().toISOString().slice(0, 10));
        setIsCopay(false);
        setHasWht(false);
        setWhtRate(3);
        setIncomeType('salary');

        // Pick default category for type
        const defaultCat = categories.find((c) => c.type === initialType && !c.parent_id);
        setCategoryId(defaultCat?.id || null);
      }
      setIsHierarchyOpen(false);
      setCategorySearch('');
      setErrors({});
    }
  }, [isOpen, editingTransaction, initialType, categories]);

  // Root categories for fast chips
  const rootCategories = useMemo(() => {
    return categories.filter((c) => c.type === type && !c.parent_id);
  }, [categories, type]);

  // Hierarchical categories filtered
  const filteredCategories = useMemo(() => {
    const q = categorySearch.toLowerCase().trim();
    if (!q) return categories.filter((c) => c.type === type);
    return categories.filter((c) => c.type === type && c.name.toLowerCase().includes(q));
  }, [categories, type, categorySearch]);

  // Description suggestions
  const suggestions = useMemo(() => {
    return extractDescriptionSuggestions(transactions, { type, limit: 6 });
  }, [transactions, type]);

  // Selected category object
  const selectedCategory = useMemo(() => {
    return categoryId ? categoriesMap.get(categoryId) : null;
  }, [categoryId, categoriesMap]);

  // Quota simulation
  const numAmount = parseFloat(amount) || 0;
  const quota = useMemo(() => {
    return getThaiChuayThaiStatus(transactionDate, numAmount);
  }, [getThaiChuayThaiStatus, transactionDate, numAmount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activeLedger = editingTransaction
      ? transactions.filter((t) => t.id !== editingTransaction.id)
      : transactions;

    const result = intakeTransaction(
      {
        type,
        amount: numAmount,
        description: description.trim() || 'อื่นๆ',
        category_id: categoryId,
        transaction_date: transactionDate,
        is_thai_chuay_thai: type === 'expense' ? isCopay : false,
        income_type: type === 'income' ? incomeType : undefined,
        has_wht: type === 'income' ? hasWht : false,
        wht_rate: whtRate,
      },
      { ledger: activeLedger }
    );

    if (!result.success || !result.payload) {
      setErrors(result.errors || {});
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (isEditing && editingTransaction) {
        await updateTransaction(editingTransaction.id, result.payload);
      } else {
        await addTransaction(result.payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save transaction:', err);
      setErrors({ form: 'เกิดข้อผิดพลาดในการบันทึกรายการ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Card */}
      <div className="relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-[#16181f] border-t border-slate-200/80 dark:border-white/10 p-5 shadow-2xl z-10 space-y-3.5 touch-scroll pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
        {/* Pull Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-2" />

        {/* Header matching Screenshot 2026-09-22 200228.png */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] theme-accent-glow" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isEditing
                ? 'แก้ไขรายการ (Edit Transaction)'
                : type === 'expense'
                  ? 'บันทึกรายจ่าย (Expense)'
                  : 'บันทึกรายรับ (Income)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Tab: Expense vs Income */}
        <div className="tab-slider-track bg-slate-100 dark:bg-black/50 rounded-2xl p-1 text-xs font-semibold border border-slate-200/80 dark:border-white/[0.06] grid grid-cols-2 gap-1 relative">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              const def = categories.find((c) => c.type === 'expense' && !c.parent_id);
              setCategoryId(def?.id || null);
            }}
            className={cn(
              'smooth-tap py-2.5 rounded-xl z-10 flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer',
              type === 'expense'
                ? 'bg-white dark:bg-white/10 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/60 dark:border-white/10'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )}
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
            <span>รายจ่าย (Expense)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              const def = categories.find((c) => c.type === 'income' && !c.parent_id);
              setCategoryId(def?.id || null);
            }}
            className={cn(
              'smooth-tap py-2.5 rounded-xl z-10 flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer',
              type === 'income'
                ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-white/10'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            )}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>รายรับ (Income)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* 1. Amount Input Card (Hero Section with fast Presets) */}
          <div className="theme-surface rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-3.5 neo-card space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-slate-500 dark:text-slate-400 font-medium text-xs">
                จำนวนเงิน <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 font-mono font-bold">
                THB (฿)
              </span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-2xl font-black text-slate-400 pointer-events-none">
                ฿
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-3xl font-black text-slate-900 dark:text-white num-tabular focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
              />
            </div>
            {errors.amount && <p className="text-[11px] text-rose-500">{errors.amount}</p>}

            {/* Quick Preset Chips for Thumb Tapping */}
            <div className="flex items-center gap-1.5 overflow-x-auto smooth-scroll pt-0.5 no-scrollbar">
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className="smooth-tap neo-btn px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 text-xs font-bold num-tabular border border-slate-200/70 dark:border-white/[0.08] active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  ฿{preset}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Description (Smart Suggestion & Autocomplete) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-slate-500 dark:text-slate-400 font-medium text-xs">
                ชื่อรายการ{' '}
                <span className="text-[10px] text-slate-400 font-normal">
                  (เว้นว่างจะเป็น "อื่นๆ")
                </span>
              </label>
              <span className="text-[10px] text-amber-500 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" /> แนะนำอัจฉริยะ
              </span>
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'expense' ? 'เช่น ข้าวมันไก่ตอนพิเศษ, กาแฟ' : 'เช่น เงินเดือน, ค่าออกแบบ'
              }
              className="w-full px-3.5 py-2.5 bg-slate-100/80 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
            />

            {/* Suggestions Chips below input */}
            {suggestions.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" /> ใช้บ่อย:
                </span>
                {suggestions.map((s, idx) => (
                  <button
                    key={`${s.description}-${idx}`}
                    type="button"
                    onClick={() => {
                      setDescription(s.description);
                      if (s.categoryId) setCategoryId(s.categoryId);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-white/[0.06] cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{s.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Category Selector (Neomorphic Card + 1-Thumb Quick Chips + Clean Collapsible Picker) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-slate-500 dark:text-slate-400 font-medium text-xs">
                หมวดหมู่{' '}
                <span className="text-[10px] text-slate-400 font-normal">
                  (โครงสร้างหมวดหมู่{type === 'expense' ? 'รายจ่าย' : 'รายรับ'})
                </span>
              </label>
              <button
                type="button"
                onClick={() => setIsHierarchyOpen(!isHierarchyOpen)}
                className="text-[11px] theme-accent-text hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3 h-3" />
                <span>{isHierarchyOpen ? 'ซ่อนโครงสร้าง' : 'เปิดดูโครงสร้างหมวดหมู่ทั้งหมด'}</span>
              </button>
            </div>

            {/* Selected Category Neomorphic Card */}
            <div
              onClick={() => setIsHierarchyOpen(!isHierarchyOpen)}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] theme-surface neo-card cursor-pointer smooth-tap transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                  style={{
                    backgroundColor: `${selectedCategory?.color || '#10b981'}1a`,
                    border: `1px solid ${selectedCategory?.color || '#10b981'}33`,
                    color: selectedCategory?.color || '#10b981',
                  }}
                >
                  <CategoryIcon
                    name={selectedCategory?.icon || (type === 'expense' ? 'utensils' : 'wallet')}
                    className="w-4 h-4"
                  />
                </div>
                <div className="text-left truncate">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                    {selectedCategory ? selectedCategory.name : 'เลือกหมวดหมู่'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    หมวดหมู่{type === 'expense' ? 'รายจ่าย' : 'รายรับ'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 font-semibold border border-slate-200/60 dark:border-white/[0.08]">
                  เลือก
                </span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 transition-transform duration-200',
                    isHierarchyOpen && 'rotate-180'
                  )}
                />
              </div>
            </div>

            {/* Quick Horizontal Chips for 1-Thumb Fast Tap */}
            <div className="flex gap-1.5 overflow-x-auto smooth-scroll py-1 no-scrollbar">
              {rootCategories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(c.id);
                      setIsHierarchyOpen(false);
                    }}
                    className={cn(
                      'smooth-tap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition-all cursor-pointer',
                      isSelected
                        ? 'theme-accent-bg text-slate-950 font-bold shadow-xs'
                        : 'theme-surface border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300'
                    )}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: c.color || '#10b981' }}
                    />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Hierarchical Category Picker Dropdown / Container */}
            {isHierarchyOpen && (
              <div className="p-3 bg-slate-50/80 dark:bg-black/40 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-2.5 animate-in fade-in-50">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-white/[0.06]">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    โครงสร้างหมวดหมู่{type === 'expense' ? 'รายจ่าย' : 'รายรับ'}
                  </span>
                  <span className="text-[10px] text-slate-400">เลือกหมวดหมู่</span>
                </div>

                {/* Search Box within category tree */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="ค้นหาหมวดหมู่..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.1] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Category List */}
                <div className="max-h-48 overflow-y-auto smooth-scroll space-y-1 pr-1">
                  {filteredCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(c.id);
                        setIsHierarchyOpen(false);
                      }}
                      className={cn(
                        'w-full p-2 rounded-xl flex items-center justify-between transition-colors text-left cursor-pointer',
                        categoryId === c.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${c.color || '#10b981'}1a`,
                            color: c.color || '#10b981',
                          }}
                        >
                          <CategoryIcon name={c.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate">
                          {c.name}
                        </span>
                      </div>
                      {categoryId === c.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. วันที่ทำรายการ (Transaction Date) */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] theme-surface neo-card">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-500/20">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  วันที่ทำรายการ
                </span>
                <span className="text-[10px] text-slate-400">วันที่บันทึก</span>
              </div>
            </div>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.08] text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* 5. Co-Pay 60/40 (Expense) or WHT (Income) */}
          {type === 'expense' ? (
            <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] theme-surface neo-card space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <BadgePercent className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      สิทธิคนละครึ่ง / ไทยช่วยไทย (60/40)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      รัฐช่วย 60% สูงสุด ฿200/วัน (เหลือโควตาวันนี้ ฿
                      {quota.dailyRemaining.toFixed(0)} / ฿{quota.monthlyRemaining.toFixed(0)})
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isCopay}
                  onChange={(e) => setIsCopay(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              {isCopay && numAmount > 0 && quota.effectiveDiscount > 0 && (
                <div className="mt-2 p-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] flex justify-between items-center text-blue-800 dark:text-blue-300 font-medium">
                  <span>รัฐช่วย ฿{quota.effectiveDiscount.toFixed(2)}</span>
                  <span className="font-bold theme-accent-text">
                    จ่ายจริง ฿{quota.effectiveNet.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] theme-surface neo-card space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  ประเภทเงินได้
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setIncomeType('salary')}
                    className={cn(
                      'px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer',
                      incomeType === 'salary'
                        ? 'theme-accent-bg text-slate-950 shadow-xs'
                        : 'theme-surface text-slate-500 border-slate-200 dark:border-white/10'
                    )}
                  >
                    40(1) เงินเดือน
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncomeType('freelance_part_time')}
                    className={cn(
                      'px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer',
                      incomeType === 'freelance_part_time'
                        ? 'theme-accent-bg text-slate-950 shadow-xs'
                        : 'theme-surface text-slate-500 border-slate-200 dark:border-white/10'
                    )}
                  >
                    40(2) ฟรีแลนซ์
                  </button>
                </div>
              </div>

              <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-900 dark:text-white block">
                      หักภาษี ณ ที่จ่าย (WHT)
                    </span>
                    <span className="text-[10px] text-slate-400">หักภาษีสะสม ภ.ง.ด.91</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={hasWht}
                  onChange={(e) => setHasWht(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              {hasWht && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {[1, 3, 5].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setWhtRate(rate)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-all',
                          whtRate === rate
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
                        )}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                  {numAmount > 0 && (
                    <span className="text-[11px] text-indigo-500 font-mono font-bold">
                      หัก ฿{(numAmount * (whtRate / 100)).toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit Button matching Screenshot 2026-09-22 200228.png */}
          <button
            type="submit"
            disabled={isSubmitting || numAmount <= 0}
            className="w-full py-3.5 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white font-bold text-sm shadow-md glow-brand flex items-center justify-center gap-2 transition-all active:scale-98 touch-manipulation cursor-pointer border border-white/20"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              {isSubmitting
                ? 'กำลังบันทึก...'
                : isEditing
                  ? 'บันทึกการแก้ไข'
                  : type === 'expense'
                    ? 'บันทึกรายจ่าย'
                    : 'บันทึกรายรับ'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
