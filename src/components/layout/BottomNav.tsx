// src/components/layout/BottomNav.tsx
// Mobile bottom navigation bar (<768px) with tactile thumb-zone FAB adhering to PROTOTYPE_STYLE_GUIDE.md

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Plus, BarChart3, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { QuickTransactionSheet } from '../transactions/QuickTransactionSheet';

export const BottomNav: React.FC = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="เมนูนำทางหลักบนมือถือ"
        className="fixed bottom-0 left-0 right-0 z-40 flex h-[calc(4.2rem+env(safe-area-inset-bottom,0px))] pb-[max(0.4rem,env(safe-area-inset-bottom,0px))] items-center justify-around border-t border-slate-200/80 bg-white/95 px-3 backdrop-blur-xl dark:border-slate-800/90 dark:bg-[#0f1115]/95 shadow-lg md:hidden"
      >
        {/* Tab 1: แดชบอร์ด */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'smooth-tap flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-h-[44px] min-w-[54px] select-none',
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 font-medium'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'flex items-center justify-center rounded-lg p-1 transition-all',
                  isActive && 'bg-emerald-50 dark:bg-emerald-950/70'
                )}
              >
                <LayoutDashboard
                  className={cn('h-5 w-5', isActive ? 'stroke-[2.25px]' : 'stroke-[1.75px]')}
                />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">ภาพรวม</span>
            </>
          )}
        </NavLink>

        {/* Tab 2: รายการบัญชี */}
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            cn(
              'smooth-tap flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-h-[44px] min-w-[54px] select-none',
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 font-medium'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'flex items-center justify-center rounded-lg p-1 transition-all',
                  isActive && 'bg-emerald-50 dark:bg-emerald-950/70'
                )}
              >
                <ReceiptText
                  className={cn('h-5 w-5', isActive ? 'stroke-[2.25px]' : 'stroke-[1.75px]')}
                />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">สมุดบัญชี</span>
            </>
          )}
        </NavLink>

        {/* Center Tactile FAB Plus Button (หมุน 45° เมื่อ Sheet เปิด) */}
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
          aria-label={isQuickAddOpen ? 'ปิดหน้าต่างบันทึกรายการ' : 'บันทึกรายการด่วน'}
          className="neo-btn smooth-tap -mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg glow-brand border border-white/25 cursor-pointer z-50 transition-transform duration-200 active:scale-95"
        >
          <Plus
            className={cn(
              'h-6 w-6 stroke-[3] transition-transform duration-200',
              isQuickAddOpen && 'rotate-45'
            )}
          />
        </button>

        {/* Tab 3: รายงาน */}
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            cn(
              'smooth-tap flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-h-[44px] min-w-[54px] select-none',
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 font-medium'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'flex items-center justify-center rounded-lg p-1 transition-all',
                  isActive && 'bg-emerald-50 dark:bg-emerald-950/70'
                )}
              >
                <BarChart3
                  className={cn('h-5 w-5', isActive ? 'stroke-[2.25px]' : 'stroke-[1.75px]')}
                />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">รายงาน</span>
            </>
          )}
        </NavLink>

        {/* Tab 4: ตั้งค่า */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'smooth-tap flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative min-h-[44px] min-w-[54px] select-none',
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 font-medium'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'flex items-center justify-center rounded-lg p-1 transition-all',
                  isActive && 'bg-emerald-50 dark:bg-emerald-950/70'
                )}
              >
                <Settings
                  className={cn('h-5 w-5', isActive ? 'stroke-[2.25px]' : 'stroke-[1.75px]')}
                />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">ตั้งค่า</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* Quick Transaction Bottom Sheet */}
      <QuickTransactionSheet isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </>
  );
};
