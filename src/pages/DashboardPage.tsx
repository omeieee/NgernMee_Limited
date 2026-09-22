// src/pages/DashboardPage.tsx
// Financial Dashboard with daily/monthly summaries, 7-day trend sparkline, and quick add

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  Sparkles,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Calendar,
  Wallet,
  PiggyBank,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { QuickTransactionSheet } from '../components/transactions/QuickTransactionSheet';
import { useAppStore } from '../stores/useAppStore';
import { useCategories } from '../hooks/useCategories';
import { useThaiChuayThai } from '../hooks/useThaiChuayThai';
import { calculateDashboardStats } from '../packages/financial-intelligence';
import { formatCurrency, formatThaiDate, cn } from '../lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { Transaction, TransactionType } from '../lib/types';

export const DashboardPage: React.FC = () => {
  const { profile, user, isDemoMode, transactions, addTransaction, theme, toggleTheme } =
    useAppStore();
  const { categoriesMap } = useCategories();
  const { quota } = useThaiChuayThai();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [mobileSheetType, setMobileSheetType] = useState<TransactionType>('expense');
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // Consolidated financial intelligence (computed in a single pass)
  const {
    todayIncome,
    todayExpense,
    monthIncome,
    monthExpense,
    monthSavings,
    monthThaiChuayThaiSavings,
    past7DaysTrend: past7DaysData,
    recentTransactions,
    runway,
  } = useMemo(
    () => calculateDashboardStats(transactions, categoriesMap),
    [transactions, categoriesMap]
  );

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => t.transaction_date === todayStr || t.transaction_date === '2026-09-22'
      ),
    [transactions, todayStr]
  );

  const yesterdayTransactions = useMemo(() => {
    return transactions.filter((t) => !todayTransactions.some((td) => td.id === t.id)).slice(0, 5);
  }, [transactions, todayTransactions]);

  const total7DayExpense = useMemo(() => {
    return past7DaysData.reduce((acc, curr) => acc + (curr.expense || 0), 0);
  }, [past7DaysData]);

  const avg7DaySpend = useMemo(() => {
    return Math.round(total7DayExpense / (past7DaysData.length || 7));
  }, [total7DayExpense, past7DaysData]);

  const spendTrendBadge = useMemo(() => {
    if (past7DaysData.length < 4) return null;
    const recent = past7DaysData.slice(-3).reduce((s, p) => s + (p.expense || 0), 0);
    const earlier = past7DaysData.slice(0, 3).reduce((s, p) => s + (p.expense || 0), 0);
    if (earlier === 0) return null;
    const diffPct = Math.round(((recent - earlier) / earlier) * 100);
    return {
      pct: Math.abs(diffPct),
      isDown: diffPct <= 0,
      text: `${diffPct <= 0 ? '-' : '+'}${Math.abs(diffPct)}% vs สัปดาห์ก่อน`,
    };
  }, [past7DaysData]);

  const isSurplus = runway.currentLiquidBalance >= 0 && monthSavings >= 0;

  const openMobileSheet = (type: TransactionType) => {
    setMobileSheetType(type);
    setIsMobileSheetOpen(true);
  };

  const handleQuickAddSubmit = async (
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ) => {
    await addTransaction(data);
    setIsQuickAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* MOBILE VIEW (< 768px): Style A: Daily Pulse UX/UI        */}
      {/* ======================================================== */}
      <div className="block md:hidden space-y-4">
        {/* Subtle Mobile Greeting Header */}
        <div className="flex items-center justify-between px-0.5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              สวัสดี,{' '}
              {profile?.display_name ||
                (isDemoMode ? 'คุณสมชาย' : user?.email?.split('@')[0] || 'ผู้ใช้งาน')}{' '}
              👋
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {formatThaiDate(todayStr, 'long')}
            </p>
          </div>
          {isDemoMode && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold border border-amber-500/20">
              โหมดทดลอง
            </span>
          )}
        </div>

        {/* HERO CARD: Adaptive Theme Mesh Finish with Depth & Glow */}
        <div
          className={cn(
            'rounded-3xl p-5 theme-hero text-slate-900 dark:text-white neo-card relative overflow-hidden border transition-all duration-300',
            isSurplus
              ? 'glow-financial-surplus border-emerald-500/20'
              : 'glow-financial-deficit border-rose-500/20'
          )}
        >
          {/* Atmospheric ambient glows */}
          <div
            className={cn(
              'absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none',
              isSurplus ? 'ambient-glow-surplus' : 'ambient-glow-deficit'
            )}
          />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>เงินสดคงเหลือสุทธิ</span>
                <button
                  type="button"
                  onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  title={isBalanceHidden ? 'แสดงยอดเงิน' : 'ซ่อนยอดเงิน'}
                >
                  {isBalanceHidden ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm font-light text-slate-500 dark:text-slate-400">฿</span>
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white drop-shadow-xs">
                  {isBalanceHidden
                    ? '••••••'
                    : formatCurrency(runway.currentLiquidBalance).replace('฿', '')}
                </span>
              </div>
            </div>

            {/* Runway Status Pill */}
            <div className="text-right">
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full theme-badge border transition-colors',
                  runway.runwayMonths >= 3
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : runway.runwayMonths >= 1
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                )}
              >
                {runway.runwayMonths >= 3 ? (
                  <ShieldCheck className="w-3 h-3" />
                ) : runway.runwayMonths >= 1 ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <ShieldAlert className="w-3 h-3" />
                )}
                <span>อยู่ได้ ~{runway.runwayMonths} เดือน</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono font-medium">
                สำรอง {runway.runwayDays} วัน
              </p>
            </div>
          </div>

          {/* Daily Radar: Safe Daily Spend & Net Monthly Expense */}
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] grid grid-cols-2 gap-2.5 relative z-10 text-xs">
            <div className="bg-slate-50/90 dark:bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">
                งบปลอดภัยวันนี้
              </span>
              <span className="theme-accent-text font-extrabold text-base tabular-nums mt-0.5 block">
                {formatCurrency(runway.safeDailySpend)}
              </span>
              <span className="text-[10px] text-slate-400">เฉลี่ยต่อวัน</span>
            </div>
            <div className="bg-slate-50/90 dark:bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-slate-200/80 dark:border-white/[0.06]">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">
                รายจ่ายสุทธิเดือนนี้
              </span>
              <span className="theme-expense-text font-extrabold text-base tabular-nums mt-0.5 block">
                {formatCurrency(monthExpense)}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                วันนี้: -{formatCurrency(todayExpense)}
              </span>
            </div>
          </div>
        </div>

        {/* QUICK ACTION BAR: Ergonomic 2-Column Shortcuts (Style 03 Neomorphic Buttons & Glows) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => openMobileSheet('expense')}
            className="neo-btn touch-btn flex items-center gap-3 p-3.5 rounded-2xl theme-surface border neo-card hover:glow-expense transition-all group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 theme-expense-text border border-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                บันทึกรายจ่าย
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                Expense Outflow
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => openMobileSheet('income')}
            className="neo-btn touch-btn flex items-center gap-3 p-3.5 rounded-2xl theme-surface border neo-card hover:glow-brand transition-all group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl theme-badge flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="text-left min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                บันทึกรายรับ
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                Income Inflow
              </span>
            </div>
          </button>
        </div>

        {/* THAI CHUAY THAI 60/40 CO-PAY STATUS WIDGET */}
        <div className="rounded-2xl p-4 theme-surface border border-slate-200/80 dark:border-white/[0.08] neo-card space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  สิทธิ์คนละครึ่ง / ไทยช่วยไทย (60/40)
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {quota.capReason || 'รัฐช่วย 60% สำหรับหมวดที่ร่วมโครงการ'}
                </p>
              </div>
            </div>
            <Badge variant="thaiChuayThai" className="text-[10px] px-2 py-0.5">
              60/40
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-black/20 border border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                โควตาวันนี้คงเหลือ
              </span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm block mt-0.5">
                {formatCurrency(quota.dailyRemaining)}
              </span>
              <span className="text-[9px] text-slate-400">จากสิทธิ์ ฿200/วัน</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-black/20 border border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                โควตาเดือนนี้คงเหลือ
              </span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm block mt-0.5">
                {formatCurrency(quota.monthlyRemaining)}
              </span>
              <span className="text-[9px] text-slate-400">จากเพดาน ฿1,000/ด.</span>
            </div>
          </div>
          {monthThaiChuayThaiSavings > 0 && (
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>ประหยัดสะสมเดือนนี้แล้ว {formatCurrency(monthThaiChuayThaiSavings)}</span>
            </div>
          )}
        </div>

        {/* 7-DAY DYNAMIC SPARKLINE (Style 03 Neomorphic Card) */}
        <div className="rounded-2xl p-4 theme-surface border border-slate-200/80 dark:border-white/[0.08] neo-card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
                ชีพจรรายจ่าย 7 วันล่าสุด
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                เฉลี่ย ฿{avg7DaySpend.toLocaleString()} / วัน{' '}
                {avg7DaySpend <= runway.safeDailySpend ? '(อยู่ในเกณฑ์ปลอดภัย)' : '(สูงกว่าเกณฑ์)'}
              </p>
            </div>
            {spendTrendBadge && (
              <span
                className={cn(
                  'text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-md border',
                  spendTrendBadge.isDown
                    ? 'theme-badge theme-accent-text border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                )}
              >
                {spendTrendBadge.text}
              </span>
            )}
          </div>

          {/* Dynamic Area Sparkline */}
          <div className="h-16 w-full relative mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={past7DaysData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mobilePulseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#mobilePulseGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-mono">
            {past7DaysData.map((d, i) => (
              <span
                key={d.date}
                className={cn(i === past7DaysData.length - 1 && 'theme-accent-text font-bold')}
              >
                {i === past7DaysData.length - 1 ? 'วันนี้' : d.dayName || d.date.slice(8)}
              </span>
            ))}
          </div>
        </div>

        {/* RECENT TRANSACTIONS (Grouped by Date) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              รายการวันนี้
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              รวม {todayTransactions.length} รายการ
            </span>
          </div>

          {todayTransactions.length === 0 ? (
            <div className="theme-surface rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 text-center neo-card">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ยังไม่มีรายการสำหรับวันนี้
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openMobileSheet('expense')}
                className="mt-2.5 text-xs h-8 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                บันทึกรายการแรก
              </Button>
            </div>
          ) : (
            <div className="theme-surface rounded-2xl border border-slate-200/80 dark:border-white/[0.08] divide-y divide-slate-100 dark:divide-white/[0.05] overflow-hidden neo-card">
              {todayTransactions.map((tx) => {
                const category = tx.category_id ? categoriesMap.get(tx.category_id) : null;
                const isExpense = tx.type === 'expense';
                const note = (tx.metadata?.note as string) || '';

                return (
                  <div
                    key={tx.id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-2xs"
                        style={{
                          backgroundColor: category?.color || (isExpense ? '#f43f5e' : '#10b981'),
                        }}
                      >
                        <CategoryIcon name={category?.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {tx.description}
                          </span>
                          {tx.is_thai_chuay_thai && (
                            <Badge variant="thaiChuayThai" className="text-[9px] py-0 px-1.5">
                              60/40
                            </Badge>
                          )}
                          {tx.income_type === 'freelance_part_time' ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold theme-badge border">
                              40(2)
                            </span>
                          ) : tx.income_type === 'salary' ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold theme-badge border">
                              40(1)
                            </span>
                          ) : tx.withholding_tax_amount && tx.withholding_tax_amount > 0 ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold theme-badge border">
                              หัก ณ ที่จ่าย
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                          {category ? category.name : 'อื่นๆ'}
                          {note ? ` • ${note}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={cn(
                          'text-xs font-bold tabular-nums block',
                          isExpense ? 'text-slate-900 dark:text-white' : 'theme-accent-text'
                        )}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.net_amount)}
                      </span>
                      {tx.is_thai_chuay_thai ? (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 block">
                          รัฐช่วย ฿{tx.thai_chuay_thai_discount.toFixed(0)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block">
                          {isExpense ? 'จ่ายเต็ม' : 'รับสุทธิ'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Section: Yesterday & Earlier */}
          {yesterdayTransactions.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  รายการก่อนหน้า
                </h2>
                <Link
                  to="/transactions"
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-white font-medium flex items-center gap-0.5"
                >
                  <span>ดูทั้งหมด</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="theme-surface rounded-2xl border border-slate-200/80 dark:border-white/[0.08] divide-y divide-slate-100 dark:divide-white/[0.05] overflow-hidden neo-card">
                {yesterdayTransactions.map((tx) => {
                  const category = tx.category_id ? categoriesMap.get(tx.category_id) : null;
                  const isExpense = tx.type === 'expense';

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-2xs"
                          style={{
                            backgroundColor: category?.color || (isExpense ? '#f43f5e' : '#10b981'),
                          }}
                        >
                          <CategoryIcon name={category?.icon} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                              {tx.description}
                            </span>
                            {tx.is_thai_chuay_thai && (
                              <Badge variant="thaiChuayThai" className="text-[9px] py-0 px-1.5">
                                60/40
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                            {formatThaiDate(tx.transaction_date, 'short')} •{' '}
                            {category ? category.name : 'อื่นๆ'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            'text-xs font-bold tabular-nums block',
                            isExpense ? 'text-slate-900 dark:text-white' : 'theme-accent-text'
                          )}
                        >
                          {isExpense ? '-' : '+'}
                          {formatCurrency(tx.net_amount)}
                        </span>
                        {tx.is_thai_chuay_thai ? (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 block">
                            รัฐช่วย ฿{tx.thai_chuay_thai_discount.toFixed(0)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Web App Style Theme Switcher Widget */}
          <div className="mt-4 p-3 rounded-2xl theme-surface border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between neo-card">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-slate-300">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  {theme === 'dark' ? 'โหมดกลางคืน (Obsidian)' : 'โหมดกลางวัน (Warm Sand)'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  สลับธีมเพื่อเปลี่ยนโทนแสงและความสบายตา
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white text-xs font-bold transition-colors neo-btn border border-slate-200/60 dark:border-white/10 cursor-pointer"
            >
              สลับ
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DESKTOP & TABLET VIEW (>= 768px): Original Web App Shell */}
      {/* ======================================================== */}
      <div className="hidden md:block space-y-6">
        {/* Welcome & Date Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              สวัสดี,{' '}
              {profile?.display_name ||
                (isDemoMode ? 'คุณสมชาย' : user?.email?.split('@')[0] || 'ผู้ใช้งาน')}{' '}
              👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>วันนี้ {formatThaiDate(todayStr, 'long')}</span>
            </p>
          </div>

          <Button onClick={() => setIsQuickAddOpen(true)} className="gap-1.5 shadow-md">
            <Plus className="h-4 w-4" />
            <span>บันทึกรายการ</span>
          </Button>
        </div>

        {/* Main Metric Cards (4 Cards: 2x2 on mobile/iPad portrait, 4 cols on desktop/iPad landscape) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Month Income */}
          <Card className="p-3 sm:p-5">
            <CardHeader className="p-0 pb-1 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                รายรับเดือนนี้
              </CardDescription>
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-1.5 sm:pt-2">
              <div className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {formatCurrency(monthIncome)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 truncate">
                วันนี้: +{formatCurrency(todayIncome)}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Month Expense */}
          <Card className="p-3 sm:p-5">
            <CardHeader className="p-0 pb-1 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                รายจ่ายสุทธิ
              </CardDescription>
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-1.5 sm:pt-2">
              <div className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {formatCurrency(monthExpense)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 truncate">
                วันนี้: -{formatCurrency(todayExpense)}
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Net Savings */}
          <Card className="p-3 sm:p-5">
            <CardHeader className="p-0 pb-1 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                เงินออมสุทธิ
              </CardDescription>
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
                <PiggyBank className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-1.5 sm:pt-2">
              <div
                className={cn(
                  'text-base sm:text-2xl font-bold tracking-tight tabular-nums',
                  monthSavings >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {monthSavings >= 0
                  ? `+${formatCurrency(monthSavings)}`
                  : formatCurrency(monthSavings)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 truncate">
                {monthIncome > 0
                  ? `อัตราออม ${Math.round((monthSavings / monthIncome) * 100)}%`
                  : 'ยังไม่มีรายรับ'}
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Thai Chuay Thai Benefit */}
          <Card className="p-3 sm:p-5">
            <CardHeader className="p-0 pb-1 flex flex-row items-center justify-between space-y-0">
              <CardDescription className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                รัฐช่วย 60/40
              </CardDescription>
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-1.5 sm:pt-2">
              <div className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">
                {formatCurrency(monthThaiChuayThaiSavings)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 truncate">
                เหลือวันนี้: {formatCurrency(quota.dailyRemaining)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cashflow Runway & Financial Safety Widget (Crucial for students & irregular earners) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>ระยะเวลาปลอดภัยทางการเงิน (Cashflow Runway)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ประเมินว่าเงินเก็บปัจจุบันจะสามารถประคองค่าใช้จ่ายจำเป็นได้นานเท่าใด
                  หากไม่มีรายรับใหม่
                </p>
              </div>
            </div>

            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border self-start sm:self-auto',
                runway.runwayMonths >= 3
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                  : runway.runwayMonths >= 1
                    ? 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
                    : 'bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'
              )}
            >
              {runway.runwayMonths >= 3 ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>สภาพคล่องปลอดภัยสูง</span>
                </>
              ) : runway.runwayMonths >= 1 ? (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  <span>สภาพคล่องปานกลาง</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>สภาพคล่องตึงตัว</span>
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400 block text-[11px]">เงินสำรองปัจจุบันอยู่ได้อีก:</span>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                ~{runway.runwayMonths} เดือน{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({runway.runwayDays} วัน)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                จากยอดเงินสดคงเหลือ {formatCurrency(runway.currentLiquidBalance)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400 block text-[11px]">
                ค่าใช้จ่ายจำเป็นคงที่ (Baseline Needs):
              </span>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                {formatCurrency(runway.monthlyEssentialExpenses)}{' '}
                <span className="text-xs font-normal text-slate-500">/ เดือน</span>
              </div>
              <span className="text-[10px] text-slate-400">
                ค่าหอพัก น้ำไฟ อาหารหลัก ค่าเดินทาง
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400 block text-[11px]">งบปลอดภัยเฉลี่ยที่ใช้ได้:</span>
              <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                {formatCurrency(runway.safeDailySpend)}{' '}
                <span className="text-xs font-normal text-slate-500">/ วัน</span>
              </div>
              <span className="text-[10px] text-slate-400">คำนวณจากวันคงเหลือในเดือนนี้</span>
            </div>
          </div>
        </div>

        {/* 7-Day Trend Chart & Thai Chuay Thai Quota Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 7-day sparkline chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">แนวโน้มรายจ่าย 7 วันย้อนหลัง</CardTitle>
                <CardDescription>กราฟติดตามค่าใช้จ่ายรายวันในสัปดาห์นี้</CardDescription>
              </div>
              <Link
                to="/reports"
                className="text-xs text-slate-600 dark:text-slate-400 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center transition-colors"
              >
                <span>ดูรายงานเต็ม</span>
                <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={past7DaysData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="dayName"
                      fontSize={11}
                      stroke="#94a3b8"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'รายจ่าย']}
                      labelFormatter={(lbl, payload) => {
                        const item =
                          payload && payload.length > 0
                            ? (payload[0]?.payload as { date?: string } | undefined)
                            : undefined;
                        return item?.date ? formatThaiDate(item.date, 'medium') : String(lbl || '');
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#059669"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#expenseGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Thai Chuay Thai Quota Card */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>สิทธิประโยชน์คนละครึ่ง (60/40)</span>
              </div>
              <CardTitle className="text-base mt-1">โควตาความช่วยเหลือวันนี้</CardTitle>
              <CardDescription className="text-xs">
                คำนวณและตัดโควตาอัตโนมัติเมื่อบันทึกรายการ
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              {/* Daily Quota Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500 dark:text-slate-400">โควตารายวัน</span>
                  <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(quota.dailyRemaining)}{' '}
                    <span className="font-normal text-slate-400">
                      / {formatCurrency(quota.dailyCap)}
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all"
                    style={{ width: `${Math.min(100, (quota.dailyUsed / quota.dailyCap) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Monthly Quota Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500 dark:text-slate-400">โควตารายเดือน</span>
                  <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(quota.monthlyRemaining)}{' '}
                    <span className="font-normal text-slate-400">
                      / {formatCurrency(quota.monthlyCap)}
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-700 dark:bg-slate-400 transition-all"
                    style={{
                      width: `${Math.min(100, (quota.monthlyUsed / quota.monthlyCap) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <Link to="/transactions" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  บันทึกรายการด้วยสิทธิ์คนละครึ่ง
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Grouped Transactions: รายการวันนี้ (Matching Screenshot & Design Token) */}
        {todayTransactions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                รายการวันนี้
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                รวม {todayTransactions.length} รายการ
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-2xs">
              {todayTransactions.map((tx) => {
                const category = tx.category_id ? categoriesMap.get(tx.category_id) : null;
                const isExpense = tx.type === 'expense';
                const note =
                  (tx.metadata?.note as string) ||
                  (tx.is_thai_chuay_thai ? 'คนละครึ่ง 60/40' : isExpense ? 'จ่ายเต็ม' : '');
                const time = (tx.metadata?.time as string) || '12:00 น.';
                const catName = category ? category.name : 'อาหารและเครื่องดื่ม';

                return (
                  <div
                    key={tx.id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: category?.color ? `${category.color}1a` : '#f973161a',
                          border: `1px solid ${category?.color || '#f97316'}33`,
                          color: category?.color || '#f97316',
                        }}
                      >
                        <CategoryIcon name={category?.icon || 'receipt'} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white truncate block">
                          {tx.description}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {catName} • {time}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={cn(
                          'text-xs font-bold tabular-nums block',
                          isExpense
                            ? 'text-slate-900 dark:text-white'
                            : 'text-emerald-600 dark:text-emerald-400'
                        )}
                      >
                        {isExpense ? '-' : '+'}฿{Number(tx.net_amount || 0).toFixed(2)}
                      </span>
                      {note && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">{note}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent / Past Transactions List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">
                {todayTransactions.length > 0 ? 'รายการก่อนหน้า' : 'รายการบันทึกล่าสุด'}
              </CardTitle>
              <CardDescription className="text-xs">
                {todayTransactions.length > 0
                  ? 'ประวัติรายการย้อนหลังในระบบ'
                  : '5 รายการล่าสุดที่ทำรายการในระบบ'}
              </CardDescription>
            </div>
            <Link
              to="/transactions"
              className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 font-medium flex items-center transition-colors"
            >
              <span>ดูทั้งหมด ({transactions.length})</span>
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          </CardHeader>

          <CardContent className="pt-2">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">ยังไม่มีรายการบันทึก</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recentTransactions
                  .filter((tx) => !todayTransactions.some((td) => td.id === tx.id))
                  .slice(0, 5)
                  .map((tx) => {
                    const category = tx.category_id ? categoriesMap.get(tx.category_id) : null;
                    const isExpense = tx.type === 'expense';
                    const note = (tx.metadata?.note as string) || '';

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                            style={{
                              backgroundColor:
                                category?.color || (isExpense ? '#f43f5e' : '#10b981'),
                            }}
                          >
                            <CategoryIcon name={category?.icon} className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate">
                                {tx.description}
                              </span>
                              {tx.is_thai_chuay_thai && (
                                <Badge variant="thaiChuayThai" className="text-[9px] py-0 px-1.5">
                                  60/40
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {formatThaiDate(tx.transaction_date, 'short')} •{' '}
                              {category ? category.name : 'อื่นๆ'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={cn(
                              'font-semibold text-xs tabular-nums',
                              isExpense
                                ? 'text-slate-900 dark:text-slate-100'
                                : 'text-emerald-600 dark:text-emerald-400'
                            )}
                          >
                            {isExpense ? '-' : '+'}
                            {formatCurrency(tx.net_amount)}
                          </span>
                          {note ? (
                            <span className="text-[10px] text-slate-400 block">{note}</span>
                          ) : tx.is_thai_chuay_thai ? (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 block">
                              รัฐช่วย ฿{tx.thai_chuay_thai_discount.toFixed(0)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Modal (Desktop) */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="บันทึกรายการด่วน"
        maxWidth="md"
      >
        <TransactionForm
          onSubmit={handleQuickAddSubmit}
          onCancel={() => setIsQuickAddOpen(false)}
          isModal
        />
      </Modal>

      {/* Quick Transaction Bottom Sheet (Mobile) */}
      <QuickTransactionSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        initialType={mobileSheetType}
      />
    </div>
  );
};
