// src/components/transactions/TransactionDetailModal.tsx
// Mobile Transaction Detail Receipt Modal matching prototype_mobile_first.html (#tx-detail-modal)

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Receipt, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency, formatThaiDate, cn } from '../../lib/utils';
import type { Transaction, Category } from '../../lib/types';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  category,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTx, setActiveTx] = useState<Transaction | null>(transaction);

  useEffect(() => {
    if (transaction) {
      setActiveTx(transaction);
    }
  }, [transaction]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 240);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender || !activeTx) return null;

  const currentTransaction = activeTx;
  const isExpense = currentTransaction.type === 'expense';
  const time = (currentTransaction.metadata?.time as string) || '12:00 น.';
  const catName = category?.name || 'ทั่วไป';
  const catColor = category?.color || (isExpense ? '#f43f5e' : '#10b981');

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Smooth Fade */}
      <div
        className={cn(
          'fixed inset-0 bg-black/70 backdrop-blur-xs modal-backdrop',
          isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal Card with Spring Zoom Entrance & Exit */}
      <div
        className={cn(
          'theme-surface relative rounded-3xl border border-slate-200/80 dark:border-white/[0.1] p-5 max-w-sm w-full shadow-2xl neo-card z-10 space-y-3 modal-panel transform',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              ใบเสร็จ & รายละเอียดการบันทึก
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-2 text-xs space-y-3">
          {/* Main Hero Header */}
          <div className="text-center pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
            <span className="text-[11px] text-slate-400 block font-medium">
              {formatThaiDate(currentTransaction.transaction_date, 'medium')} • {time}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {currentTransaction.description}
            </h3>
            <span
              className={cn(
                'text-2xl font-black num-tabular block mt-1 whitespace-nowrap',
                isExpense ? 'text-slate-900 dark:text-white' : 'theme-accent-text'
              )}
            >
              {isExpense ? '- ' : '+ '}
              {formatCurrency(currentTransaction.net_amount, true)}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full mt-2 theme-badge border whitespace-nowrap">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: catColor }}
              />
              <span>{catName}</span>
            </span>
          </div>

          {/* Details breakdown */}
          <div className="space-y-2 py-1 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>ประเภท:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {isExpense ? 'รายจ่าย (Expense)' : 'รายรับ (Income)'}
              </span>
            </div>

            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>หมวดหมู่:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[200px] truncate">
                {catName}
              </span>
            </div>

            {currentTransaction.is_thai_chuay_thai && (
              <>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>ราคาสินค้า:</span>
                  <span className="font-medium num-tabular whitespace-nowrap">
                    {formatCurrency(currentTransaction.amount, true)}
                  </span>
                </div>
                <div className="flex justify-between text-blue-500">
                  <span>รัฐช่วยจ่าย (60%):</span>
                  <span className="font-bold num-tabular whitespace-nowrap">
                    -{formatCurrency(currentTransaction.thai_chuay_thai_discount, true)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-200/60 dark:border-white/[0.06]">
                  <span>คุณจ่ายจริง (40%):</span>
                  <span className="theme-accent-text num-tabular whitespace-nowrap">
                    {formatCurrency(currentTransaction.net_amount, true)}
                  </span>
                </div>
              </>
            )}

            {currentTransaction.withholding_tax_amount &&
            currentTransaction.withholding_tax_amount > 0 ? (
              <>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>ยอดเงินได้:</span>
                  <span className="font-medium num-tabular whitespace-nowrap">
                    {formatCurrency(currentTransaction.amount, true)}
                  </span>
                </div>
                <div className="flex justify-between text-indigo-500">
                  <span>ภาษีหัก ณ ที่จ่ายสะสม (ภ.ง.ด.91):</span>
                  <span className="font-bold num-tabular whitespace-nowrap">
                    -{formatCurrency(currentTransaction.withholding_tax_amount, true)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-200/60 dark:border-white/[0.06]">
                  <span>รับสุทธิ:</span>
                  <span className="theme-accent-text num-tabular whitespace-nowrap">
                    {formatCurrency(currentTransaction.net_amount, true)}
                  </span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Action Buttons: Edit, Delete, Close */}
        <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(currentTransaction);
              }}
              className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs neo-btn smooth-tap active:scale-95 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>แก้ไขรายการ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(currentTransaction);
              }}
              className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-500/30 neo-btn smooth-tap active:scale-95 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบรายการ</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs font-medium transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
