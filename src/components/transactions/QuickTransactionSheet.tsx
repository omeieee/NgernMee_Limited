// src/components/transactions/QuickTransactionSheet.tsx
// Mobile-first Quick Transaction Bottom Sheet adhering to PROTOTYPE_STYLE_GUIDE.md

import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useCategories } from '../../hooks/useCategories';
import { intakeTransaction, extractDescriptionSuggestions } from '../../packages/transaction-draft';
import { CategoryIcon } from '../ui/CategoryIcon';
import { formatCurrency, cn } from '../../lib/utils';
import type { IncomeType, TransactionType } from '../../lib/types';

interface QuickTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
}

export const QuickTransactionSheet: React.FC<QuickTransactionSheetProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
}) => {
  const { transactions, addTransaction, getThaiChuayThaiStatus } = useAppStore();
  const { categories, categoriesMap } = useCategories();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isCopay, setIsCopay] = useState(false);
  const [hasWht, setHasWht] = useState(false);
  const [whtRate, setWhtRate] = useState(3);
  const [incomeType, setIncomeType] = useState<IncomeType>('salary');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setErrors({});
    }
  }, [isOpen, initialType]);

  // Available categories for selected type
  const availableCategories = useMemo(() => {
    return categories.filter((c) => c.type === type && !c.parent_id);
  }, [categories, type]);

  // Description suggestions
  const suggestions = useMemo(() => {
    return extractDescriptionSuggestions(transactions, { type, limit: 6 });
  }, [transactions, type]);

  // Quota simulation
  const numAmount = parseFloat(amount) || 0;
  const quota = useMemo(() => {
    return getThaiChuayThaiStatus(undefined, numAmount);
  }, [getThaiChuayThaiStatus, numAmount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const todayStr = new Date().toISOString().slice(0, 10);
    const result = intakeTransaction(
      {
        type,
        amount: numAmount,
        description: description.trim() || undefined,
        category_id: categoryId,
        transaction_date: todayStr,
        is_thai_chuay_thai: type === 'expense' ? isCopay : false,
        income_type: type === 'income' ? incomeType : undefined,
        has_wht: type === 'income' ? hasWht : false,
        wht_rate: whtRate,
      },
      { ledger: transactions }
    );

    if (!result.success || !result.payload) {
      setErrors(result.errors || {});
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await addTransaction(result.payload);
      // Reset form
      setAmount('');
      setDescription('');
      setCategoryId(null);
      setIsCopay(false);
      setHasWht(false);
      onClose();
    } catch (err) {
      console.error('Failed to save quick transaction:', err);
      setErrors({ form: 'เกิดข้อผิดพลาดในการบันทึกรายการ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Card */}
      <div className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-[#16181f] border-t border-slate-200/80 dark:border-white/10 p-5 shadow-2xl z-10 space-y-4 touch-scroll pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        {/* Drag Handle */}
        <div className="mx-auto h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />

        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">บันทึกรายการด่วน</h2>
            <p className="text-[11px] text-slate-400">
              {type === 'expense' ? 'บันทึกรายจ่ายประจำวัน' : 'บันทึกรายรับหรือเงินได้'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sliding Pill Tab: Expense vs Income */}
          <div className="relative grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-black/50 border border-slate-200/80 dark:border-white/6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId(null);
              }}
              className={cn(
                'smooth-tap py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all z-10',
                type === 'expense'
                  ? 'bg-white dark:bg-white/10 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/60 dark:border-white/10'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-500" />
              <span>รายจ่าย (Expense)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId(null);
              }}
              className={cn(
                'smooth-tap py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all z-10',
                type === 'income'
                  ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-white/10'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              <span>รายรับ (Income)</span>
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              จำนวนเงิน (บาท)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-lg font-light text-slate-400">฿</span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className={cn(
                  'w-full pl-9 pr-4 py-3 text-2xl font-bold rounded-2xl border num-tabular bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 transition-all',
                  errors.amount
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-white/10 focus:ring-emerald-500/20 focus:border-emerald-500'
                )}
              />
            </div>
            {errors.amount && <p className="text-[11px] text-rose-500 mt-1">{errors.amount}</p>}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              รายละเอียดรายการ
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'expense' ? 'เช่น ข้าวมันไก่, กาแฟอเมซอน' : 'เช่น เงินเดือน, ค่าออกแบบ'
              }
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />

            {/* Suggestions Chips */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={`${s.description}-${idx}`}
                    type="button"
                    onClick={() => {
                      setDescription(s.description);
                      if (s.categoryId) setCategoryId(s.categoryId);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    <span>{s.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Category Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">หมวดหมู่</label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
              {availableCategories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={cn(
                      'smooth-tap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <CategoryIcon name={c.icon} className="w-3.5 h-3.5" />
                    <span>{c.name}</span>
                    {isSelected && (
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tucked-Away Co-Pay & WHT Options (PROTOTYPE_STYLE_GUIDE Recipe D) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-between w-full py-1.5 px-1 font-medium"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>ตัวเลือกเพิ่มเติม (สิทธิ์คนละครึ่ง / หักภาษี ณ ที่จ่าย)</span>
              </span>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 transition-transform duration-200',
                  isAdvancedOpen && 'rotate-180'
                )}
              />
            </button>

            {isAdvancedOpen && (
              <div className="mt-1.5 p-3 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/10 space-y-2.5 animate-in fade-in duration-150">
                {type === 'expense' ? (
                  <div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
                          ใช้สิทธิ์คนละครึ่ง / ไทยช่วยไทย (60/40)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          รัฐช่วย 60% สูงสุด ฿200/วัน (เหลือโควตาวันนี้ ฿
                          {quota.dailyRemaining.toFixed(0)} / เดือนนี้ ฿
                          {quota.monthlyRemaining.toFixed(0)})
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isCopay}
                        onChange={(e) => setIsCopay(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    {isCopay && numAmount > 0 && quota.effectiveDiscount > 0 && (
                      <div className="mt-2 p-2 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] flex justify-between items-center text-blue-800 dark:text-blue-300">
                        <div>
                          <span>รัฐช่วย ฿{quota.effectiveDiscount.toFixed(2)}</span>
                          {quota.isCapped && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-normal">
                              (จำกัดด้วยโควตา
                              {quota.capReason === 'daily'
                                ? 'รายวัน'
                                : quota.capReason === 'monthly'
                                  ? 'รายเดือน'
                                  : 'รายวันและรายเดือน'}
                              )
                            </span>
                          )}
                        </div>
                        <span className="font-bold">จ่ายจริง ฿{quota.effectiveNet.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
                          หักภาษี ณ ที่จ่าย (ภ.ง.ด.91)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          สำหรับเงินได้ฟรีแลนซ์/รับจ้าง ม.40(2)
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasWht}
                        onChange={(e) => setHasWht(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>

                    {hasWht && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-slate-400">อัตราหัก:</span>
                        <select
                          value={whtRate}
                          onChange={(e) => setWhtRate(Number(e.target.value))}
                          className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-900 dark:text-white"
                        >
                          <option value={3}>3% (บริการ/รับจ้าง)</option>
                          <option value={1}>1% (ขนส่ง/ประกัน)</option>
                          <option value={5}>5% (ค่าเช่า/รางวัล)</option>
                        </select>
                        {numAmount > 0 && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium ml-auto">
                            หัก ฿{(numAmount * (whtRate / 100)).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || numAmount <= 0}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md glow-brand flex items-center justify-center gap-2 transition-all active:scale-98 touch-manipulation cursor-pointer"
          >
            {isSubmitting ? (
              <span>กำลังบันทึก...</span>
            ) : (
              <>
                <span>บันทึกรายการ</span>
                {numAmount > 0 && (
                  <span className="num-tabular font-mono">(฿{formatCurrency(numAmount)})</span>
                )}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
