// src/pages/TransactionsPage.tsx
// Transactions management page with quick selection chips, Thai Chuay Thai quota tracker, and list

import React, { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { QuickSelectPanel } from '../components/transactions/QuickSelectPanel';
import { TransactionList } from '../components/transactions/TransactionList';
import { useTransactions, type TransactionFilter } from '../hooks/useTransactions';
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

  return (
    <div className="space-y-6">
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
