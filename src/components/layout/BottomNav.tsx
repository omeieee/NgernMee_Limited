// src/components/layout/BottomNav.tsx
// Mobile bottom navigation bar (<768px) with 5 primary navigation tabs

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  FolderTree,
  BarChart3,
  Calculator,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const MOBILE_NAV_ITEMS = [
  { name: 'แดชบอร์ด', path: '/', icon: LayoutDashboard },
  { name: 'รายการ', path: '/transactions', icon: ReceiptText },
  { name: 'หมวดหมู่', path: '/categories', icon: FolderTree },
  { name: 'รายงาน', path: '/reports', icon: BarChart3 },
  { name: 'ภาษี', path: '/tax', icon: Calculator },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold scale-105'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5', isActive ? 'stroke-[2.5px]' : 'stroke-2')} />
                <span className="text-[11px] mt-0.5 tracking-tight">{item.name}</span>
                {isActive && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
