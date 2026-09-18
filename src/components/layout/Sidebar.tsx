// src/components/layout/Sidebar.tsx
// Desktop sidebar navigation (240px)

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  FolderTree,
  BarChart3,
  Calculator,
  Settings,
  LogOut,
  Moon,
  Sun,
  Coins,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../lib/utils';
import { APP_NAME } from '../../lib/constants';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'แดชบอร์ด', path: '/', icon: LayoutDashboard },
  { name: 'รายการบันทึก', path: '/transactions', icon: ReceiptText },
  { name: 'จัดการหมวดหมู่', path: '/categories', icon: FolderTree },
  { name: 'รายงานและวิเคราะห์', path: '/reports', icon: BarChart3 },
  { name: 'คำนวณภาษี 2568-69', path: '/tax', icon: Calculator, badge: 'ใหม่' },
  { name: 'ตั้งค่าระบบ', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { user, profile, isDemoMode, signOut } = useAuth();
  const { theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-40 bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 transition-colors">
      {/* App Logo & Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            {APP_NAME}
            {isDemoMode && (
              <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] px-1.5 py-0.5 font-medium">
                Demo
              </span>
            )}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">การเงินส่วนบุคคล & ภาษี</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          เมนูหลัก
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] px-1.5 py-0.5 font-medium">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Controls */}
      <div className="border-t border-slate-100 p-3 dark:border-slate-800 space-y-2">
        {/* Dark/Light toggle */}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-4 w-4 text-amber-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            <span>{theme === 'dark' ? 'โหมดกลางคืน' : 'โหมดกลางวัน'}</span>
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">สลับ</span>
        </button>

        {/* User Card */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              {profile?.display_name ? profile.display_name.slice(0, 1) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                {profile?.display_name || user?.email || 'ผู้ใช้งาน'}
              </p>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {isDemoMode ? 'โหมดทดลองใช้งาน' : user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="ออกจากระบบ"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-rose-600 dark:hover:bg-slate-700 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
