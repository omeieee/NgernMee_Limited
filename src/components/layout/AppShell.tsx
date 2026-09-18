// src/components/layout/AppShell.tsx
// Responsive App layout shell with desktop sidebar and mobile bottom nav

import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Settings, ShieldCheck, Sun, Moon, Coins } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME } from '../../lib/constants';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'แดชบอร์ดภาพรวม', subtitle: 'สรุปการเงิน รายรับ-รายจ่าย และสิทธิประโยชน์' },
  '/transactions': { title: 'รายการบันทึก', subtitle: 'จัดการรายรับ รายจ่าย และระบบคนละครึ่ง/ไทยช่วยไทย' },
  '/categories': { title: 'จัดการหมวดหมู่', subtitle: 'จัดระเบียบหมวดหมู่แบบลำดับขั้นไม่จำกัด' },
  '/reports': { title: 'รายงานและวิเคราะห์', subtitle: 'สรุปข้อมูล แนวโน้ม และพฤติกรรมการใช้จ่าย' },
  '/tax': { title: 'คำนวณและวางแผนภาษี', subtitle: 'ภาษีเงินได้บุคคลธรรมดา ปี 2568 - 2569' },
  '/settings': { title: 'ตั้งค่าระบบ', subtitle: 'จัดการข้อมูลผู้ใช้ ค่าเริ่มต้น และส่งออกข้อมูล' },
};

export const AppShell: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentInfo = PAGE_TITLES[currentPath] || { title: APP_NAME, subtitle: 'ระบบการเงินส่วนบุคคล' };
  const { theme, toggleTheme } = useAppStore();
  const { isDemoMode } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 md:px-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {currentInfo.title}
              </h1>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDemoMode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2.5 py-1 text-xs font-medium border border-amber-200 dark:border-amber-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">โหมดทดลองใช้งาน</span>
                <span className="sm:hidden">Demo</span>
              </span>
            )}

            {/* Mobile dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title="สลับโหมดสี"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4 text-amber-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            </button>

            {/* Settings shortcut */}
            <Link
              to="/settings"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              title="ตั้งค่า"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-12 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
