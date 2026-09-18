// src/pages/TransactionsPage.tsx
// Transactions management page with quick selection chips, Thai Chuay Thai quota tracker, and list

import React, { useState } from 'react';
import { Plus, Sparkles, Filter, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { QuickSelectPanel } from '../components/transactions/QuickSelectPanel';
import { TransactionList } from '../components/transactions/TransactionList';
import { useTransactions, type TransactionFilter } from '../hooks/useTransactions';
import { useThaiChuayThai } from '../hooks/useThaiChuayThai';
import { formatCurrency } from '../lib/utils';
import type { Transaction, TransactionType } from '../lib/types';

export const TransactionsPage: React.FC = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; description: string } | null>(null);
  const [quickFillData, setQuickFillData] = useState<Partial<Transaction> | null>(null);

  const {
    groupedTransactions,
    quickSelectItems,
    filter,
    setFilter,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const { quota } = useThaiChuayThai();

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
      {/* Top Banner: Thai Chuay Thai Quota Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-5 text-white shadow-md shadow-indigo-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100">
                <Sparkles className="h-4 w-4" />
                <span>โครงการคนละครึ่ง / ไทยช่วยไทย (60/40)</span>
              </div>
              <h2 className="text-xl font-bold mt-1 tracking-tight">
                รัฐช่วยจ่าย 60% — คุณจ่ายเพียง 40%
              </h2>
              <p className="text-xs text-blue-100/90 mt-0.5">
                จำกัดส่วนลดสูงสุด 200 บาท/วัน และไม่เกิน 1,000 บาท/เดือน
              </p>
            </div>

            <Button
              onClick={handleOpenAdd}
              className="bg-white text-indigo-700 hover:bg-blue-50 shadow-sm shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              บันทึกรายการใหม่
            </Button>
          </div>

          {/* Quota Progress Numbers */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20 text-xs">
            <div>
              <span className="text-blue-200 block text-[11px]">โควตารายวันคงเหลือวันนี้</span>
              <div className="text-base font-bold tabular-nums">
                {formatCurrency(quota.dailyRemaining)}
                <span className="text-[11px] font-normal text-blue-200 ml-1">
                  / {formatCurrency(quota.dailyCap)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-blue-200 block text-[11px]">โควตารายเดือนคงเหลือ</span>
              <div className="text-base font-bold tabular-nums">
                {formatCurrency(quota.monthlyRemaining)}
                <span className="text-[11px] font-normal text-blue-200 ml-1">
                  / {formatCurrency(quota.monthlyCap)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">เพิ่มรายการด่วน</CardTitle>
            <CardDescription className="text-xs">
              บันทึกรายรับหรือรายจ่ายทันใจในไม่กี่วินาที
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button onClick={handleOpenAdd} className="w-full">
              <Plus className="h-4 w-4 mr-1.5" />
              เปิดแบบฟอร์มบันทึก
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Select Chips */}
      <QuickSelectPanel items={quickSelectItems} onSelect={handleQuickSelect} />

      {/* Main Transactions List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>ประวัติรายการบันทึก</CardTitle>
          <CardDescription>
            รายการรายรับและรายจ่ายทั้งหมด แยกตามวันที่
          </CardDescription>
        </CardHeader>

        <CardContent>
          <TransactionList
            groupedTransactions={groupedTransactions}
            onEdit={handleOpenEdit}
            onDelete={(id: string, description: string) => setDeleteTarget({ id, description })}
            searchQuery={filter.search || ''}
            onSearchChange={(val: string) => setFilter((prev: TransactionFilter) => ({ ...prev, search: val }))}
            typeFilter={filter.type || 'all'}
            onTypeFilterChange={(t: 'all' | TransactionType) => setFilter((prev: TransactionFilter) => ({ ...prev, type: t }))}
            onlyThaiChuayThai={Boolean(filter.onlyThaiChuayThai)}
            onOnlyThaiChuayThaiToggle={() =>
              setFilter((prev: TransactionFilter) => ({ ...prev, onlyThaiChuayThai: !prev.onlyThaiChuayThai }))
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
