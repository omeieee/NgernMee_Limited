// src/components/layout/AppShell.tsx
// Responsive App layout shell with desktop sidebar and mobile bottom nav

import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Settings, ShieldCheck, Sun, Moon, Coins, Menu, Calculator } from 'lucide-react';
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
        <header className="sticky top-0 z-30 flex h-[calc(4rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] items-center justify-between border-b border-slate-200/70 bg-white/90 px-3.5 sm:px-6 lg:px-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90 transition-colors">
          {/* Mobile Brand (screens < 768px adhering to PROTOTYPE_STYLE_GUIDE.md) */}
          <div className="flex items-center gap-2.5 min-w-0 md:hidden">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight truncate block">
                {APP_NAME}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {currentPath === '/' ? 'การเงินส่วนบุคคล & ภาษี' : currentInfo.title}
              </p>
            </div>
          </div>

          {/* Desktop/Tablet Breadcrumb & Title (screens >= 768px) */}
          <div className="hidden md:flex items-center gap-2.5 sm:gap-3.5 min-w-0">
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
              <Coins className="h-4 w-4" />
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

            {/* Mobile/iPad dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors touch-manipulation active:scale-95"
              title="สลับโหมดสี"
              aria-label="สลับโหมดสี"
            >
              {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-amber-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
            </button>

            {/* Mobile Tax Calculator shortcut */}
            <Link
              to="/tax"
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors touch-manipulation active:scale-95"
              title="คำนวณภาษี ภ.ง.ด.91"
              aria-label="คำนวณภาษี ภ.ง.ด.91"
            >
              <Calculator className="h-4 w-4" />
            </Link>

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
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8 lg:pb-12 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (screens < 768px) */}
      <BottomNav />
    </div>
  );
};
