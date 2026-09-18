// src/components/transactions/QuickSelectPanel.tsx
// Frequency-based quick transaction chips for 1-click form pre-filling

import React from 'react';
import { Sparkles, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { CategoryIcon } from '../ui/CategoryIcon';
import { useCategories } from '../../hooks/useCategories';
import { formatCurrency, cn } from '../../lib/utils';
import type { Transaction } from '../../lib/types';

interface QuickSelectPanelProps {
  items: (Transaction & { frequencyCount?: number })[];
  onSelect: (tx: Transaction) => void;
}

export const QuickSelectPanel: React.FC<QuickSelectPanelProps> = ({ items, onSelect }) => {
  const { categoriesMap } = useCategories();

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span>รายการที่บันทึกบ่อย (คลิกเพื่อเลือกทันที):</span>
      </div>

      <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto touch-scroll no-scrollbar pb-1.5 sm:pb-0 gap-2 -mx-1 px-1">
        {items.map((item, idx) => {
          const category = item.category_id ? categoriesMap.get(item.category_id) : null;
          const isExpense = item.type === 'expense';

          return (
            <button
              key={`${item.id}-${idx}`}
              type="button"
              onClick={() => onSelect(item)}
              className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 px-3.5 py-2 text-xs transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0 min-h-[40px] touch-manipulation"
            >
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white shadow-2xs"
                style={{ backgroundColor: category?.color || (isExpense ? '#f43f5e' : '#10b981') }}
              >
                <CategoryIcon name={category?.icon} className="h-3 w-3" />
              </div>

              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                {item.description}
              </span>

              <span
                className={cn(
                  'font-semibold tabular-nums',
                  isExpense ? 'text-slate-900 dark:text-slate-100' : 'text-emerald-600 dark:text-emerald-400'
                )}
              >
                {formatCurrency(item.amount)}
              </span>

              {item.is_thai_chuay_thai && (
                <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[9px] px-1.5 py-0.5 font-medium border border-blue-200/60 dark:border-blue-800/60">
                  60/40
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
