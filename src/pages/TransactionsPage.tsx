// src/pages/TransactionsPage.tsx
// Transactions management page with quick selection chips, Thai Chuay Thai quota tracker, and list

import React, { useState } from 'react';
import { Plus, AlertTriangle, Search, X, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { QuickSelectPanel } from '../components/transactions/QuickSelectPanel';
import { TransactionList } from '../components/transactions/TransactionList';
import { useTransactions, type TransactionFilter } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { formatCurrency, formatThaiDate, cn } from '../lib/utils';
import type { Transaction, TransactionType } from '../lib/types';

export const TransactionsPage: React.FC = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; description: string } | null>(
    null
  );
  const [quickFillData, setQuickFillData] = useState<Partial<Transaction> | null>(null);

  const {
    groupedTransactions,
    quickSelectItems,
    filter,
    setFilter,
    totalCount,
    displayedCount,
    hasMore,
    loadMore,
    showAll,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setQuickFillData(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setQuickFillData(null);
    setIsFormModalOpen(true);
  };

  const handleQuickSelect = (item: Transaction) => {
    setEditingTransaction(null);
    setQuickFillData({
      type: item.type,
      amount: item.amount,
      description: item.description,
      category_id: item.category_id,
      is_thai_chuay_thai: item.is_thai_chuay_thai,
      is_salary: item.is_salary,
      transaction_date: new Date().toISOString().slice(0, 10),
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await addTransaction(data);
    }
    setIsFormModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteTransaction(deleteTarget.id);
    setDeleteTarget(null);
  };

  const { categoriesMap } = useCategories();
  const dateKeys = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));
  const currentMonthLabel = formatThaiDate(new Date().toISOString(), 'long').replace(/^\d+\s+/, '');

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* MOBILE VIEW (< 768px): Dedicated Mobile Ledger (#view-ledger) */}
      {/* ======================================================== */}
      <div className="block md:hidden space-y-3.5">
        {/* Header with search & counter */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>สมุดบัญชี</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                {totalCount} รายการ
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              บันทึกรายรับ-รายจ่าย ประจำเดือน{currentMonthLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="smooth-tap neo-btn px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>เพิ่ม</span>
          </button>
        </div>

        {/* Search Input with Clear Button */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหาชื่อรายการ, หมวดหมู่, หรือยอดเงิน..."
            value={filter.search || ''}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-100 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {filter.search && (
            <button
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type Filter Tabs (ทั้งหมด, รายจ่าย, รายรับ, คนละครึ่ง 60/40) */}
        <div className="flex items-center gap-1.5 overflow-x-auto smooth-scroll py-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() =>
              setFilter((prev) => ({ ...prev, type: 'all', onlyThaiChuayThai: false }))
            }
            className={cn(
              'smooth-tap neo-btn px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer',
              (filter.type === 'all' || !filter.type) && !filter.onlyThaiChuayThai
                ? 'theme-accent-bg text-slate-950 shadow-xs'
                : 'theme-surface border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300'
            )}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            onClick={() =>
              setFilter((prev) => ({ ...prev, type: 'expense', onlyThaiChuayThai: false }))
            }
            className={cn(
              'smooth-tap neo-btn px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer',
              filter.type === 'expense' && !filter.onlyThaiChuayThai
                ? 'theme-accent-bg text-slate-950 font-bold shadow-xs'
                : 'theme-surface border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300'
            )}
          >
            รายจ่าย
          </button>
          <button
            type="button"
            onClick={() =>
              setFilter((prev) => ({ ...prev, type: 'income', onlyThaiChuayThai: false }))
            }
            className={cn(
              'smooth-tap neo-btn px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer',
              filter.type === 'income' && !filter.onlyThaiChuayThai
                ? 'theme-accent-bg text-slate-950 font-bold shadow-xs'
                : 'theme-surface border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300'
            )}
          >
            รายรับ
          </button>
          <button
            type="button"
            onClick={() =>
              setFilter((prev) => ({
                ...prev,
                onlyThaiChuayThai: !prev.onlyThaiChuayThai,
              }))
            }
            className={cn(
              'smooth-tap neo-btn px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer',
              filter.onlyThaiChuayThai
                ? 'theme-accent-bg text-slate-950 font-bold shadow-xs'
                : 'theme-surface border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300'
            )}
          >
            สิทธิ 60/40
          </button>
        </div>

        {/* Grouped Transaction Container */}
        {dateKeys.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200/80 dark:border-white/[0.08] rounded-2xl">
            <p className="font-medium">ไม่พบรายการบันทึกที่ตรงตามเงื่อนไข</p>
            <p className="text-[10px] text-slate-400 mt-1">
              ลองปรับเปลี่ยนคำค้นหา หรือแตะ "+" เพื่อบันทึกรายการ
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dateKeys.map((dateStr) => {
              const items = groupedTransactions[dateStr];
              const dayExp = items
                .filter((t) => t.type === 'expense')
                .reduce((sum, t) => sum + t.net_amount, 0);
              const dayInc = items
                .filter((t) => t.type === 'income')
                .reduce((sum, t) => sum + t.net_amount, 0);

              return (
                <div key={dateStr} className="space-y-1.5">
                  {/* Date Header with Day Totals */}
                  <div className="flex items-center justify-between px-2 pt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span>{formatThaiDate(dateStr, 'medium')}</span>
                    <div className="flex items-center gap-2 num-tabular">
                      {dayInc > 0 && (
                        <span className="theme-accent-text">+{formatCurrency(dayInc)}</span>
                      )}
                      {dayExp > 0 && (
                        <span className="text-slate-600 dark:text-slate-300">
                          -{formatCurrency(dayExp)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transactions in this Date */}
                  <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] theme-surface divide-y divide-slate-100 dark:divide-white/[0.04] overflow-hidden neo-card">
                    {items.map((tx) => {
                      const cat = tx.category_id ? categoriesMap.get(tx.category_id) : null;
                      const isExpense = tx.type === 'expense';
                      const note = (tx.metadata?.note as string) || '';

                      return (
                        <div
                          key={tx.id}
                          onClick={() => handleOpenEdit(tx)}
                          className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer touch-manipulation active:scale-[0.99]"
                        >
                          {/* Left Info */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: `${cat?.color || (isExpense ? '#f43f5e' : '#10b981')}1a`,
                                border: `1px solid ${cat?.color || (isExpense ? '#f43f5e' : '#10b981')}33`,
                                color: cat?.color || (isExpense ? '#f43f5e' : '#10b981'),
                              }}
                            >
                              <CategoryIcon
                                name={cat?.icon || (isExpense ? 'receipt' : 'arrow-up-right')}
                                className="w-5 h-5"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                  {tx.description}
                                </span>
                                {tx.is_thai_chuay_thai && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/30">
                                    60/40
                                  </span>
                                )}
                                {tx.income_type === 'salary' && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                                    40(1)
                                  </span>
                                )}
                                {tx.income_type === 'freelance_part_time' && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                                    40(2)
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {cat?.name || 'ทั่วไป'} {note ? `• ${note}` : ''}
                              </p>
                            </div>
                          </div>

                          {/* Right Info: Amount & Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span
                                className={cn(
                                  'text-xs font-bold num-tabular block',
                                  isExpense ? 'text-slate-900 dark:text-white' : 'theme-accent-text'
                                )}
                              >
                                {isExpense ? '-' : '+'}
                                {formatCurrency(tx.net_amount)}
                              </span>
                              {tx.is_thai_chuay_thai && tx.amount !== tx.net_amount && (
                                <span className="text-[9px] text-slate-400 line-through num-tabular block">
                                  {formatCurrency(tx.amount)}
                                </span>
                              )}
                              {tx.withholding_tax_amount && tx.withholding_tax_amount > 0 && (
                                <span className="text-[9px] text-indigo-500 num-tabular block">
                                  หัก {formatCurrency(tx.withholding_tax_amount)}
                                </span>
                              )}
                            </div>

                            {/* Touch action buttons */}
                            <div className="flex items-center gap-0.5 pl-1 border-l border-slate-100 dark:border-white/[0.06]">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(tx);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                                title="แก้ไขรายการ"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget({ id: tx.id, description: tx.description });
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="ลบรายการ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  โหลดรายการเพิ่มเติม ({displayedCount}/{totalCount})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DESKTOP VIEW (>= 768px): Full Management View with Table  */}
      {/* ======================================================== */}
      <div className="hidden md:block space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              รายการบันทึก
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              บันทึกและจัดการรายรับ-รายจ่ายทั้งหมดของคุณ
            </p>
          </div>

          <Button onClick={handleOpenAdd} className="gap-1.5 self-start sm:self-auto shadow-xs">
            <Plus className="h-4 w-4" />
            <span>บันทึกรายการใหม่</span>
          </Button>
        </div>

        {/* Quick Select Chips */}
        <QuickSelectPanel items={quickSelectItems} onSelect={handleQuickSelect} />

        {/* Main Transactions List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>ประวัติรายการบันทึก</CardTitle>
            <CardDescription>รายการรายรับและรายจ่ายทั้งหมด แยกตามวันที่</CardDescription>
          </CardHeader>

          <CardContent>
            <TransactionList
              groupedTransactions={groupedTransactions}
              totalCount={totalCount}
              displayedCount={displayedCount}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onShowAll={showAll}
              onEdit={handleOpenEdit}
              onDelete={(id: string, description: string) => setDeleteTarget({ id, description })}
              searchQuery={filter.search || ''}
              onSearchChange={(val: string) =>
                setFilter((prev: TransactionFilter) => ({ ...prev, search: val }))
              }
              typeFilter={filter.type || 'all'}
              onTypeFilterChange={(t: 'all' | TransactionType) =>
                setFilter((prev: TransactionFilter) => ({ ...prev, type: t }))
              }
              onlyThaiChuayThai={Boolean(filter.onlyThaiChuayThai)}
              onOnlyThaiChuayThaiToggle={() =>
                setFilter((prev: TransactionFilter) => ({
                  ...prev,
                  onlyThaiChuayThai: !prev.onlyThaiChuayThai,
                }))
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
        maxWidth="md"
      >
        <TransactionForm
          initialData={editingTransaction || quickFillData}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
          isModal
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="ยืนยันการลบรายการ"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-semibold">
                คุณแน่ใจหรือไม่ว่าต้องการลบรายการ "{deleteTarget?.description}"?
              </p>
              <p className="mt-1 text-[11px]">
                การลบรายการนี้จะไม่สามารถกู้คืนได้ และอาจส่งผลต่อการคำนวณโควตาและรายงาน
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              ยกเลิก
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              ยืนยันการลบ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
