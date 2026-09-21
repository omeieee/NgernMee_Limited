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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { useAppStore } from '../stores/useAppStore';
import { useCategories } from '../hooks/useCategories';
import { useThaiChuayThai } from '../hooks/useThaiChuayThai';
import { calculateDashboardStats } from '../packages/financial-intelligence';
import { formatCurrency, formatThaiDate, cn } from '../lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { Transaction } from '../lib/types';

export const DashboardPage: React.FC = () => {
  const { profile, user, isDemoMode, transactions, addTransaction } = useAppStore();
  const { categoriesMap } = useCategories();
  const { quota } = useThaiChuayThai();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

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

  const handleQuickAddSubmit = async (
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ) => {
    await addTransaction(data);
    setIsQuickAddOpen(false);
  };

  return (
    <div className="space-y-6">
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
              <span className="text-xs font-normal text-slate-500">({runway.runwayDays} วัน)</span>
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
            <span className="text-[10px] text-slate-400">ค่าหอพัก น้ำไฟ อาหารหลัก ค่าเดินทาง</span>
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
                <AreaChart data={past7DaysData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

      {/* Recent Transactions List (Top 5) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">รายการบันทึกล่าสุด</CardTitle>
            <CardDescription className="text-xs">5 รายการล่าสุดที่ทำรายการในระบบ</CardDescription>
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
              {recentTransactions.map((tx) => {
                const category = tx.category_id ? categoriesMap.get(tx.category_id) : null;
                const isExpense = tx.type === 'expense';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                        style={{
                          backgroundColor: category?.color || (isExpense ? '#f43f5e' : '#10b981'),
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
                      {tx.is_thai_chuay_thai && (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 block">
                          รัฐช่วย ฿{tx.thai_chuay_thai_discount.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Add Modal */}
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
    </div>
  );
};
