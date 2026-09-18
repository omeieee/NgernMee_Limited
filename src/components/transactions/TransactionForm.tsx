// src/components/transactions/TransactionForm.tsx
// Transaction creation and editing form with Thai Chuay Thai 60/40 calculator

import React, { useState, useEffect } from 'react';
import {
  Coins,
  ArrowDownCircle,
  ArrowUpCircle,
  Info,
  Calendar,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CategoryPicker } from '../categories/CategoryPicker';
import { useThaiChuayThai } from '../../hooks/useThaiChuayThai';
import { formatCurrency, cn } from '../../lib/utils';
import type { Transaction, TransactionType } from '../../lib/types';

interface TransactionFormProps {
  initialData?: Partial<Transaction> | null;
  onSubmit: (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
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
  const [amount, setAmount] = useState<string>(initialData?.amount ? String(initialData.amount) : '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [categoryId, setCategoryId] = useState<string | null>(initialData?.category_id ?? null);
  const [transactionDate, setTransactionDate] = useState(
    initialData?.transaction_date || new Date().toISOString().slice(0, 10)
  );
  const [isThaiChuayThai, setIsThaiChuayThai] = useState(initialData?.is_thai_chuay_thai || false);
  const [isSalary, setIsSalary] = useState(initialData?.is_salary || false);
  const [errors, setErrors] = useState<{ amount?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook for Thai Chuay Thai calculations and limits
  const { quota, calculateForExpense } = useThaiChuayThai(transactionDate);

  // Sync initial data if changed
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setDescription(initialData.description || '');
      setCategoryId(initialData.category_id ?? null);
      setTransactionDate(initialData.transaction_date || new Date().toISOString().slice(0, 10));
      setIsThaiChuayThai(initialData.is_thai_chuay_thai || false);
      setIsSalary(initialData.is_salary || false);
    }
  }, [initialData]);

  const numAmount = parseFloat(amount) || 0;
  const thaiChuayThaiCalc = calculateForExpense(numAmount);

  const validate = () => {
    const errs: { amount?: string; description?: string } = {};
    if (!numAmount || numAmount <= 0) {
      errs.amount = 'กรุณาระบุจำนวนเงินที่มากกว่า 0';
    }
    if (!description.trim()) {
      errs.description = 'กรุณาระบุรายละเอียดรายการ';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const discount = isThaiChuayThai && type === 'expense' ? thaiChuayThaiCalc.effectiveDiscount : 0;
      const net = isThaiChuayThai && type === 'expense' ? thaiChuayThaiCalc.netAmount : numAmount;

      await onSubmit({
        type,
        amount: numAmount,
        description: description.trim(),
        category_id: categoryId,
        transaction_date: transactionDate,
        is_salary: type === 'income' ? isSalary : false,
        is_thai_chuay_thai: type === 'expense' ? isThaiChuayThai : false,
        thai_chuay_thai_discount: discount,
        net_amount: net,
      });

      // Clear form if not in edit mode
      if (!initialData?.id) {
        setAmount('');
        setDescription('');
        setIsThaiChuayThai(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Toggle: Expense / Income */}
      <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
        <button
          type="button"
          onClick={() => {
            setType('expense');
            setIsSalary(false);
          }}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all min-h-[44px] touch-manipulation active:scale-[0.98]',
            type === 'expense'
              ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <ArrowDownCircle className={cn('h-4 w-4', type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400')} />
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
          <ArrowUpCircle className={cn('h-4 w-4', type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400')} />
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

      {/* Description */}
      <Input
        label="รายละเอียดรายการ"
        placeholder="เช่น ค่าข้าวมันไก่, เงินเดือน, กาแฟ"
        value={description}
        error={errors.description}
        onChange={(e) => {
          setDescription(e.target.value);
          setErrors((prev) => ({ ...prev, description: undefined }));
        }}
      />

      {/* Category Picker */}
      <CategoryPicker
        value={categoryId}
        onChange={(id) => setCategoryId(id)}
        type={type}
      />

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
                  <span className="text-slate-400 block text-[11px]">
                    ส่วนลดรัฐช่วยจ่าย (60%):
                  </span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatCurrency(thaiChuayThaiCalc.effectiveDiscount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">
                    คุณจ่ายสุทธิ (40%):
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrency(thaiChuayThaiCalc.netAmount)}
                  </span>
                </div>
              </div>

              {/* Quota Cap Warning */}
              {thaiChuayThaiCalc.isCapped && (
                <div className="flex items-start gap-1.5 text-amber-700 dark:text-amber-300 text-[11px] bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/70 dark:border-amber-800/70">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>
                    {thaiChuayThaiCalc.capReason === 'daily' && 'ยอดส่วนลดถูกจำกัดด้วยเพดานรายวัน (สูงสุด 200 บาท/วัน)'}
                    {thaiChuayThaiCalc.capReason === 'monthly' && 'ยอดส่วนลดถูกจำกัดด้วยเพดานรายเดือน (สูงสุด 1,000 บาท/เดือน)'}
                    {thaiChuayThaiCalc.capReason === 'both' && 'ยอดส่วนลดเต็มเพดานทั้งรายวันและรายเดือน'}
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

      {/* Income-only: Salary Taxable Flag */}
      {type === 'income' && (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <label
              htmlFor="salary-toggle"
              className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>เป็นเงินเดือนประจำ (ดึงไปคำนวณภาษีอัตโนมัติ)</span>
            </label>
            <input
              type="checkbox"
              id="salary-toggle"
              checked={isSalary}
              onChange={(e) => setIsSalary(e.target.checked)}
              className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
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
          {initialData?.id ? 'บันทึกการแก้ไข' : type === 'expense' ? 'บันทึกรายจ่าย' : 'บันทึกรายรับ'}
        </Button>
      </div>
    </form>
  );
};
