import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Receipt, Plus, BarChart3, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { QuickTransactionSheet } from '../transactions/QuickTransactionSheet';

export const BottomNav: React.FC = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="เมนูนำทางหลักบนมือถือ"
        className="fixed bottom-0 left-0 right-0 z-40 theme-canvas bg-opacity-95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.08] px-1 py-2 grid grid-cols-5 items-center shadow-modern-nav md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
      >
        {/* Tab 1: ภาพรวม */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'smooth-tap flex flex-col items-center justify-center py-1 transition-all w-full',
              isActive
                ? 'theme-accent-text font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white font-medium'
            )
          }
        >
          {({ isActive }) => (
            <>
              <LayoutGrid className={cn('w-5 h-5', isActive && 'stroke-[2.25px]')} />
              <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">ภาพรวม</span>
            </>
          )}
        </NavLink>

        {/* Tab 2: สมุดบัญชี */}
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            cn(
              'smooth-tap flex flex-col items-center justify-center py-1 transition-all w-full',
              isActive
                ? 'theme-accent-text font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white font-medium'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'flex items-center justify-center rounded-lg p-0.5 transition-all',
                  isActive && 'border border-emerald-500/40 rounded-lg'
                )}
              >
                <Receipt className={cn('w-5 h-5', isActive && 'stroke-[2.25px]')} />
              </div>
              <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">สมุดบัญชี</span>
            </>
          )}
        </NavLink>

        {/* Center Tactile FAB Plus Button (True 50% screen center) */}
        <div className="flex items-center justify-center w-full">
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            aria-label={isQuickAddOpen ? 'ปิดหน้าต่างบันทึกรายการ' : 'บันทึกรายการด่วน'}
            className="neo-btn smooth-tap -mt-5 w-12 h-12 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-black flex items-center justify-center glow-brand transition-all shadow-lg border border-white/20 cursor-pointer z-50 active:scale-90"
          >
            <Plus
              className={cn(
                'w-6 h-6 stroke-[3] transition-transform duration-250',
                isQuickAddOpen && 'rotate-45'
              )}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </button>
        </div>

        {/* Tab 3: รายงาน */}
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            cn(
              'smooth-tap flex flex-col items-center justify-center py-1 transition-all w-full',
              isActive
                ? 'theme-accent-text font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white font-medium'
            )
          }
        >
          {({ isActive }) => (
            <>
              <BarChart3 className={cn('w-5 h-5', isActive && 'stroke-[2.25px]')} />
              <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">รายงาน</span>
            </>
          )}
        </NavLink>

        {/* Tab 4: ตั้งค่า */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'smooth-tap flex flex-col items-center justify-center py-1 transition-all w-full',
              isActive
                ? 'theme-accent-text font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-white font-medium'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings className={cn('w-5 h-5', isActive && 'stroke-[2.25px]')} />
              <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">ตั้งค่า</span>
            </>
          )}
        </NavLink>
      </nav>

      {/* Quick Transaction Bottom Sheet */}
      <QuickTransactionSheet isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </>
  );
};
