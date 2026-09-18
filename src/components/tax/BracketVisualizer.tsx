// src/components/tax/BracketVisualizer.tsx
// Visual progression and bracket breakdown for Thai PIT 2025-2026

import React from 'react';
import type { TaxCalculationResult } from '../../lib/types';
import { formatCurrency, cn } from '../../lib/utils';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface BracketVisualizerProps {
  calculation: TaxCalculationResult;
}

export const BracketVisualizer: React.FC<BracketVisualizerProps> = ({ calculation }) => {
  const { netTaxableIncome, brackets } = calculation;

  return (
    <div className="space-y-4">
      {/* Visual Stepper / Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>ความก้าวหน้าขั้นบันไดภาษี (เงินได้สุทธิ {formatCurrency(netTaxableIncome)})</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            อัตราแท้จริง: {calculation.effectiveRate}%
          </span>
        </div>

        {/* Progress step blocks */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {brackets.map((b, idx) => {
            const isFilled = b.taxableInBracket > 0;
            const isCurrentTop =
              isFilled && (idx === brackets.length - 1 || brackets[idx + 1].taxableInBracket === 0);

            return (
              <div
                key={b.bracket}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all',
                  isCurrentTop
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-400/40'
                    : isFilled
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
                )}
              >
                <span className="text-[10px] font-medium leading-none">ขั้นที่ {idx + 1}</span>
                <span className="text-xs font-bold mt-1">{(b.rate * 100).toFixed(0)}%</span>
                {isCurrentTop && (
                  <span className="text-[9px] bg-white/20 rounded-full px-1.5 mt-0.5 font-medium">
                    สูงสุด
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Breakdown List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80">
        {brackets.map((b) => {
          const isActive = b.taxableInBracket > 0;

          return (
            <div
              key={b.bracket}
              className={cn(
                'flex items-center justify-between p-3 text-xs transition-colors',
                isActive ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : 'opacity-60'
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  )}
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    {b.bracket}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    อัตราภาษี {(b.rate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(b.taxAmount)}
                </div>
                <div className="text-[10px] text-slate-400 tabular-nums">
                  เงินได้ในขั้น: {formatCurrency(b.taxableInBracket)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
