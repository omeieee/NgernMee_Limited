// src/pages/DashboardPage.tsx
// Financial Dashboard with daily/monthly summaries, 7-day trend sparkline, and quick add

import React, { useState } from 'react';
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
import { formatCurrency, formatThaiDate, cn } from '../lib/utils';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import type { Transaction } from '../lib/types';

export const DashboardPage: React.FC = () => {
  const { profile, transactions, addTransaction } = useAppStore();
  const { categoriesMap } = useCategories();
  const { quota } = useThaiChuayThai();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const thisMonthStr = todayStr.slice(0, 7);

  // Today stats
  const todayTransactions = transactions.filter((t) => t.transaction_date === todayStr);
  const todayIncome = todayTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.net_amount, 0);
  const todayExpense = todayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.net_amount, 0);

  // Month stats
  const monthTransactions = transactions.filter((t) => t.transaction_date.startsWith(thisMonthStr));
  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.net_amount, 0);
  const monthExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.net_amount, 0);
  const monthSavings = monthIncome - monthExpense;
  const monthThaiChuayThaiSavings = monthTransactions
    .filter((t) => t.is_thai_chuay_thai)
    .reduce((sum, t) => sum + (t.thai_chuay_thai_discount || 0), 0);

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // 7-day sparkline data
  const past7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().slice(0, 10);
    const dayTxs = transactions.filter((t) => t.transaction_date === dStr);
    const expense = dayTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.net_amount, 0);
    const income = dayTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.net_amount, 0);

    return {
      date: dStr,
      dayName: d.toLocaleDateString('th-TH', { weekday: 'short' }),
      expense,
      income,
    };
  });

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
            สวัสดี, {profile?.display_name || 'คุณสมชาย'} 👋
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

      {/* Main Metric Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Month Income */}
        <Card className="border-emerald-100 dark:border-emerald-950 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900">
          <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              รายรับเดือนนี้
            </CardDescription>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(monthIncome)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">วันนี้: +{formatCurrency(todayIncome)}</p>
          </CardContent>
        </Card>

        {/* Card 2: Month Expense */}
        <Card className="border-rose-100 dark:border-rose-950 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950/20 dark:to-slate-900">
          <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-semibold text-rose-800 dark:text-rose-300">
              รายจ่ายสุทธิเดือนนี้
            </CardDescription>
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {formatCurrency(monthExpense)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">วันนี้: -{formatCurrency(todayExpense)}</p>
          </CardContent>
        </Card>

        {/* Card 3: Net Savings */}
        <Card className="border-indigo-100 dark:border-indigo-950 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
          <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
              เงินออมสุทธิเดือนนี้
            </CardDescription>
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              <PiggyBank className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div
              className={cn(
                'text-2xl font-bold tabular-nums',
                monthSavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'
              )}
            >
              {formatCurrency(monthSavings)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              อัตราการออม {monthIncome > 0 ? ((monthSavings / monthIncome) * 100).toFixed(0) : 0}%
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Thai Chuay Thai Benefit */}
        <Card className="border-blue-100 dark:border-blue-950 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-900">
          <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              รัฐช่วยจ่ายสะสม (60/40)
            </CardDescription>
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {formatCurrency(monthThaiChuayThaiSavings)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              โควตารายวันคงเหลือ: {formatCurrency(quota.dailyRemaining)}
            </p>
          </CardContent>
        </Card>
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
            <Link to="/reports" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center">
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
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="dayName" fontSize={11} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'รายจ่าย']}
                    labelFormatter={(lbl, payload) => {
                      const item = payload[0]?.payload;
                      return item ? formatThaiDate(item.date, 'medium') : lbl;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Thai Chuay Thai Quota Card */}
        <Card className="flex flex-col justify-between border-blue-200/80 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 dark:from-slate-900 dark:to-blue-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              <span>สิทธิประโยชน์คนละครึ่ง (60/40)</span>
            </div>
            <CardTitle className="text-base mt-1">โควตาความช่วยเหลือวันนี้</CardTitle>
            <CardDescription className="text-xs">
              คำนวณและตัดโควตาอัตโนมัติเมื่อบันทึกรายการ
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3.5 pt-0">
            {/* Daily Quota Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">โควตารายวัน</span>
                <span className="tabular-nums font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(quota.dailyRemaining)} / {formatCurrency(quota.dailyCap)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${Math.min(100, (quota.dailyUsed / quota.dailyCap) * 100)}%` }}
                />
              </div>
            </div>

            {/* Monthly Quota Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">โควตารายเดือน</span>
                <span className="tabular-nums font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(quota.monthlyRemaining)} / {formatCurrency(quota.monthlyCap)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${Math.min(100, (quota.monthlyUsed / quota.monthlyCap) * 100)}%` }}
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
            <CardDescription className="text-xs">
              5 รายการล่าสุดที่ทำรายการในระบบ
            </CardDescription>
          </div>
          <Link to="/transactions" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center">
            <span>ดูทั้งหมด ({transactions.length})</span>
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </CardHeader>

        <CardContent className="pt-2">
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">ยังไม่มีรายการบันทึก</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => {
                const category = tx.category_id ? categoriesMap.get(tx.category_id) : null;
                const isExpense = tx.type === 'expense';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs"
                        style={{
                          backgroundColor:
                            category?.color || (isExpense ? '#f43f5e' : '#10b981'),
                        }}
                      >
                        <CategoryIcon name={category?.icon} className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
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
                          'font-bold text-xs tabular-nums',
                          isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        )}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.net_amount)}
                      </span>
                      {tx.is_thai_chuay_thai && (
                        <span className="text-[10px] text-blue-500 block">
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
