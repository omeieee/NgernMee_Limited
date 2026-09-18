// src/components/transactions/TransactionList.tsx
// Transactions list grouped by date with filtering, search, badges, and inline actions

import React from 'react';
import {
  Sparkles,
  Edit2,
  Trash2,
  Briefcase,
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Badge } from '../ui/Badge';
import { useCategories } from '../../hooks/useCategories';
import { formatCurrency, formatThaiDate, cn } from '../../lib/utils';
import type { Transaction, TransactionType } from '../../lib/types';

interface TransactionListProps {
  groupedTransactions: Record<string, Transaction[]>;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string, description: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  typeFilter: 'all' | TransactionType;
  onTypeFilterChange: (type: 'all' | TransactionType) => void;
  onlyThaiChuayThai: boolean;
  onOnlyThaiChuayThaiToggle: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  groupedTransactions,
  onEdit,
  onDelete,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onlyThaiChuayThai,
  onOnlyThaiChuayThaiToggle,
}) => {
  const { categoriesMap } = useCategories();
  const dateKeys = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อรายการ หรือจำนวนเงิน..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Type Filter Buttons */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onTypeFilterChange(t)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                )}
              >
                {t === 'all' && 'ทั้งหมด'}
                {t === 'expense' && 'รายจ่าย'}
                {t === 'income' && 'รายรับ'}
              </button>
            ))}
          </div>

          {/* Thai Chuay Thai Filter Toggle */}
          <button
            onClick={onOnlyThaiChuayThaiToggle}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all',
              onlyThaiChuayThai
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/60 dark:border-blue-700 dark:text-blue-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>ไทยช่วยไทย 60/40</span>
          </button>
        </div>
      </div>

      {/* Grouped Lists */}
      {dateKeys.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            ไม่พบรายการบันทึกที่ตรงตามเงื่อนไข
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือบันทึกรายการใหม่
          </p>
        </div>
      ) : (
        dateKeys.map((dateStr) => {
          const items = groupedTransactions[dateStr];
          const dailyExpense = items
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.net_amount, 0);
          const dailyIncome = items
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.net_amount, 0);

          return (
            <div key={dateStr} className="space-y-2">
              {/* Date Header with Daily Totals */}
              <div className="flex items-center justify-between px-2 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="text-slate-800 dark:text-slate-200 font-bold">
                  {formatThaiDate(dateStr, 'medium')}
                </span>
                <div className="flex items-center gap-3 tabular-nums">
                  {dailyIncome > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(dailyIncome)}
                    </span>
                  )}
                  {dailyExpense > 0 && (
                    <span className="text-rose-600 dark:text-rose-400">
                      -{formatCurrency(dailyExpense)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in Date Group */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 shadow-2xs">
                {items.map((tx) => {
                  const category = tx.category_id ? categoriesMap.get(tx.category_id) : null;
                  const isExpense = tx.type === 'expense';

                  return (
                    <div
                      key={tx.id}
                      className="group flex items-center justify-between p-3.5 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    >
                      {/* Left info: Icon, Description, Category, Badges */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
                          style={{
                            backgroundColor:
                              category?.color || (isExpense ? '#f43f5e' : '#10b981'),
                          }}
                        >
                          <CategoryIcon name={category?.icon} className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                              {tx.description}
                            </span>
                            {tx.is_thai_chuay_thai && (
                              <Badge variant="thaiChuayThai" className="text-[10px]">
                                <Sparkles className="h-2.5 w-2.5" />
                                60/40
                              </Badge>
                            )}
                            {tx.is_salary && (
                              <Badge variant="success" className="text-[10px]">
                                <Briefcase className="h-2.5 w-2.5 mr-0.5" />
                                เงินเดือน
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {category ? category.name : 'อื่นๆ (ไม่ระบุหมวด)'}
                            {tx.is_thai_chuay_thai && (
                              <span className="text-blue-600 dark:text-blue-400 ml-2">
                                (รัฐช่วยจ่าย ฿{tx.thai_chuay_thai_discount.toFixed(0)})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right info: Amount & Inline Action Buttons */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div
                            className={cn(
                              'font-bold text-sm tabular-nums flex items-center justify-end',
                              isExpense
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            )}
                          >
                            <span>{isExpense ? '-' : '+'}</span>
                            <span>{formatCurrency(tx.net_amount)}</span>
                          </div>

                          {/* Show original amount if subsidized */}
                          {tx.is_thai_chuay_thai && tx.amount !== tx.net_amount && (
                            <span className="text-[10px] text-slate-400 line-through tabular-nums block">
                              ฿{tx.amount.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Edit & Delete Buttons (hover visible on desktop) */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(tx)}
                            title="แก้ไข"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(tx.id, tx.description)}
                            title="ลบ"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
