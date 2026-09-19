// src/components/transactions/TransactionList.tsx
// Transactions list grouped by date with filtering, search, badges, and inline actions

import React from 'react';
import {
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
          <Search className="absolute left-3.5 top-3.5 sm:top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อรายการ หรือจำนวนเงิน..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 sm:h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-base sm:text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 shadow-2xs transition-all touch-manipulation"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Type Filter Buttons */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onTypeFilterChange(t)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                )}
              >
                {t === 'all' && 'ทั้งหมด'}
                {t === 'expense' && 'รายจ่าย'}
                {t === 'income' && 'รายรับ'}
              </button>
            ))}
          </div>

          {/* Subtle separator */}
          <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Thai Chuay Thai Filter Toggle (Subtle optional filter) */}
          <button
            onClick={onOnlyThaiChuayThaiToggle}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs transition-all shadow-2xs',
              onlyThaiChuayThai
                ? 'bg-slate-100 border-slate-300 text-slate-800 font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            )}
            title="กรองเฉพาะรายการที่ใช้สิทธิ์คนละครึ่ง 60/40"
          >
            <span className="text-[10px] text-slate-400 dark:text-slate-500">สิทธิเสริม:</span>
            <span>ใช้สิทธิ์ 60/40</span>
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
                <div className="flex items-center gap-3 tabular-nums font-semibold">
                  {dailyIncome > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(dailyIncome)}
                    </span>
                  )}
                  {dailyExpense > 0 && (
                    <span className="text-slate-700 dark:text-slate-300">
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
                      onClick={() => onEdit(tx)}
                      className="group flex items-center justify-between p-3.5 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/50 cursor-pointer active:bg-slate-100/70 dark:active:bg-slate-800/80"
                    >
                      {/* Left info: Icon, Description, Category, Badges */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                          style={{
                            backgroundColor:
                              category?.color || (isExpense ? '#f43f5e' : '#10b981'),
                          }}
                        >
                          <CategoryIcon name={category?.icon} className="h-4.5 w-4.5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                              {tx.description}
                            </span>
                            {tx.is_thai_chuay_thai && (
                              <Badge variant="outline" className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                                สิทธิเสริม 60/40
                              </Badge>
                            )}
                            {tx.is_salary && (
                              <Badge variant="success" className="text-[10px]">
                                <Briefcase className="h-2.5 w-2.5 mr-0.5" />
                                เงินเดือน
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {category ? category.name : 'อื่นๆ'}
                            {tx.is_thai_chuay_thai && (
                              <span className="text-slate-500 dark:text-slate-400 ml-1.5 text-[11px]">
                                (ลด {formatCurrency(tx.thai_chuay_thai_discount)})
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
                              'font-semibold text-xs sm:text-sm tabular-nums flex items-center justify-end',
                              isExpense
                                ? 'text-slate-900 dark:text-slate-100'
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

                        {/* Edit & Delete Buttons: Always visible on iPad/touch devices, revealed on hover on desktop with mouse */}
                        <div className="flex items-center gap-1 group-hover-actions">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(tx);
                            }}
                            title="แก้ไข"
                            aria-label={`แก้ไขรายการ ${tx.description}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors touch-manipulation active:scale-90"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(tx.id, tx.description);
                            }}
                            title="ลบ"
                            aria-label={`ลบรายการ ${tx.description}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors touch-manipulation active:scale-90"
                          >
                            <Trash2 className="h-4 w-4" />
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
