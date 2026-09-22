// src/components/layout/AppShell.tsx
// Responsive App layout shell with desktop sidebar and mobile bottom nav

import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Settings, ShieldCheck, Sun, Moon, Coins, Menu, Calculator, Wallet } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME } from '../../lib/constants';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'แดชบอร์ดภาพรวม', subtitle: 'สรุปการเงิน รายรับ-รายจ่าย และสิทธิประโยชน์' },
  '/transactions': {
    title: 'รายการบันทึก',
    subtitle: 'จัดการรายรับ รายจ่าย และระบบคนละครึ่ง/ไทยช่วยไทย',
  },
  '/categories': { title: 'จัดการหมวดหมู่', subtitle: 'จัดระเบียบหมวดหมู่แบบลำดับขั้นไม่จำกัด' },
  '/reports': { title: 'รายงานและวิเคราะห์', subtitle: 'สรุปข้อมูล แนวโน้ม และพฤติกรรมการใช้จ่าย' },
  '/tax': { title: 'คำนวณและวางแผนภาษี', subtitle: 'ภาษีเงินได้บุคคลธรรมดา ปี 2568 - 2569' },
  '/settings': { title: 'ตั้งค่าระบบ', subtitle: 'จัดการข้อมูลผู้ใช้ ค่าเริ่มต้น และส่งออกข้อมูล' },
};

export const AppShell: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentInfo = PAGE_TITLES[currentPath] || {
    title: APP_NAME,
    subtitle: 'ระบบการเงินส่วนบุคคล',
  };
  const { theme, toggleTheme } = useAppStore();
  const { isDemoMode } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f4ef] text-slate-900 dark:bg-[#0f1115] dark:text-slate-50 flex transition-colors">
      {/* Sidebar: Fixed on desktop/iPad Pro landscape (>=1024px), Slide-out Drawer on iPad portrait & mobile (<1024px) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-[calc(3.8rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0f1115]/95 transition-colors">
          {/* Mobile Header (< 768px): Exact replica of prototype_mobile_first.html lines 521-551 */}
          <div className="flex md:hidden items-center justify-between w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#16a34a] text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight truncate">
                    เงินมี จำกัด
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  การเงินส่วนบุคคล & ภาษี
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Micro-Interaction Sliding Pill Day/Night Toggle Switch */}
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-switch-track theme-surface border border-slate-200/80 dark:border-white/[0.1] shadow-inner cursor-pointer"
                title="สลับโหมดกลางวัน / โหมดกลางคืน"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500 z-0 pl-0.5 opacity-80" />
                <Moon className="w-3.5 h-3.5 text-emerald-400 z-0 pr-0.5 opacity-80" />
                <div className="theme-switch-thumb bg-white dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-white/20">
                  {theme === 'dark' ? (
                    <Moon className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500" />
                  )}
                </div>
              </button>

              {/* Tax Assistant Shortcut */}
              <Link
                to="/tax"
                className="touch-btn neo-btn p-2 rounded-xl theme-surface text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-white/[0.1]"
                title="ประเมินภาษี ภ.ง.ด.91"
              >
                <Calculator className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Desktop/Tablet Breadcrumb & Title (screens >= 768px) */}
          <div className="hidden md:flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              {/* Hamburger Menu Toggle on iPad */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors touch-manipulation active:scale-95 cursor-pointer"
                title="เปิดเมนูนำทาง"
                aria-label="เปิดเมนูนำทาง"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden sm:flex lg:hidden h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <Wallet className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-tight truncate">
                  {currentInfo.title}
                </h1>
                <p className="hidden sm:block text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {currentInfo.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {isDemoMode && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span className="hidden sm:inline">โหมดทดลองใช้งาน</span>
                  <span className="sm:hidden">Demo</span>
                </span>
              )}

              {/* Desktop/iPad dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors touch-manipulation active:scale-95 cursor-pointer"
                title="สลับโหมดสี"
                aria-label="สลับโหมดสี"
              >
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-amber-400" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500" />
                )}
              </button>

              {/* Settings shortcut */}
              <Link
                to="/settings"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors touch-manipulation active:scale-95"
                title="ตั้งค่า"
                aria-label="ตั้งค่า"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content with View Entrance Animation */}
        <main
          key={location.pathname}
          className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8 lg:pb-12 max-w-7xl w-full mx-auto animate-view"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (screens < 768px) */}
      <BottomNav />
    </div>
  );
};
