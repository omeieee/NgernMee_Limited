// src/pages/ReportsPage.tsx
// Financial Reports & Analytics with 4 tabs: Overview, Trends, Top Spending, Tax Report

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Calculator,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Gift,
  Coffee,
  Briefcase,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAnalytics, type TimePeriod } from '../hooks/useAnalytics';
import { formatCurrency, formatThaiDate, cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const TABS = [
  { id: 'overview', label: 'ภาพรวม', icon: BarChart3 },
  { id: 'trends', label: 'แนวโน้ม', icon: TrendingUp },
  { id: 'top_spending', label: 'ค่าใช้จ่ายสูงสุด', icon: PieIcon },
  { id: 'tax_report', label: 'รายงานภาษี', icon: Calculator },
] as const;

type ActiveTab = (typeof TABS)[number]['id'];

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [period, setPeriod] = useState<TimePeriod>('this_month');

  const {
    summary,
    trendData,
    categorySpending,
    frequentItems,
    incomeAnalysis,
    runway,
    taxCalculation,
    transactionCount,
    startDate,
    endDate,
  } = useAnalytics(period);

  return (
    <div className="space-y-6">
      {/* Top Controls: Period selector & Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Period Buttons */}
        <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/80 overflow-x-auto touch-scroll no-scrollbar">
          {(
            [
              { id: 'this_month', label: 'เดือนนี้' },
              { id: 'last_month', label: 'เดือนที่แล้ว' },
              { id: 'this_year', label: 'ปีนี้' },
              { id: 'all', label: 'ทั้งหมด' },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                'rounded-xl px-3.5 py-2 text-xs font-semibold transition-all shrink-0 min-h-[38px] touch-manipulation active:scale-95',
                period === p.id
                  ? 'bg-white text-emerald-700 shadow-2xs dark:bg-slate-900 dark:text-emerald-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>
            {formatThaiDate(startDate, 'short')} — {formatThaiDate(endDate, 'short')}
          </span>
          <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[11px]">
            {transactionCount} รายการ
          </span>
        </div>
      </div>

      {/* Tabs Navigation: Touch-scrollable on mobile / iPad */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 sm:gap-2 overflow-x-auto touch-scroll no-scrollbar -mx-1 px-1 pb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-3.5 sm:px-4 py-3 text-xs sm:text-sm font-semibold transition-all shrink-0 min-h-[44px] touch-manipulation active:scale-[0.98]',
                isActive
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ภาพรวม (Overview) */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-1">
                <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  รายรับรวม
                </CardDescription>
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(summary.totalIncome)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-slate-400">รวมรายรับและเงินเดือนในช่วงเวลานี้</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  รายจ่ายสุทธิ
                </CardDescription>
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(summary.totalExpense)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-slate-400">ยอดที่จ่ายจริงหลังหักเงินช่วยจ่าย</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  เงินคงเหลือสุทธิ
                </CardDescription>
                <CardTitle
                  className={cn(
                    'text-2xl font-bold tracking-tight tabular-nums',
                    summary.netSavings >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'
                  )}
                >
                  {formatCurrency(summary.netSavings)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[11px] text-slate-400">
                  อัตราการออม: <span className="font-semibold text-slate-700 dark:text-slate-300">{summary.savingsRate}%</span> ของรายรับ
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Thai Chuay Thai Savings Callout */}
          {summary.totalThaiChuayThaiDiscount > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-blue-200/80 bg-blue-50/50 dark:border-blue-800/80 dark:bg-blue-950/20 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                  สิทธิประโยชน์โครงการคนละครึ่ง / ไทยช่วยไทย (60/40)
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  รัฐช่วยคุณประหยัดเงินไปได้ทั้งหมด {formatCurrency(summary.totalThaiChuayThaiDiscount)}
                </p>
              </div>
            </div>
          )}

          {/* Bar Chart: Income vs Expense */}
          <Card>
            <CardHeader>
              <CardTitle>เปรียบเทียบรายรับและรายจ่าย</CardTitle>
              <CardDescription>กราฟแท่งแสดงกระแสเงินสดตามวันที่ทำรายการ</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">
                  ไม่มีข้อมูลสำหรับแสดงกราฟในช่วงเวลานี้
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => val.slice(8)}
                        fontSize={11}
                        stroke="#94a3b8"
                      />
                      <YAxis fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `฿${v}`} />
                      <Tooltip
                        formatter={(val: unknown) => [formatCurrency(Number(val) || 0), '']}
                        labelFormatter={(lbl) => formatThaiDate(String(lbl), 'medium')}
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="income" name="รายรับ" fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="expense" name="รายจ่าย" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Income Streams & Multi-Source Breakdown */}
          {incomeAnalysis.sources.length > 0 && (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-emerald-600" />
                    <span>โครงสร้างที่มาของรายรับ (Income Streams Breakdown)</span>
                  </CardTitle>
                  <CardDescription>
                    วิเคราะห์สัดส่วนรายได้จากเงินเดือน พาร์ทไทม์ และเงินสนับสนุนจากครอบครัว
                  </CardDescription>
                </div>
                {incomeAnalysis.withholdingTaxTotal > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    ภาษีหัก ณ ที่จ่ายสะสม: {formatCurrency(incomeAnalysis.withholdingTaxTotal)}
                  </span>
                )}
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {incomeAnalysis.sources.map((source) => (
                    <div
                      key={source.type}
                      className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {source.type === 'allowance' && <Gift className="h-3.5 w-3.5 text-amber-500" />}
                          {source.type === 'freelance_part_time' && <Coffee className="h-3.5 w-3.5 text-blue-500" />}
                          {source.type === 'salary' && <Briefcase className="h-3.5 w-3.5 text-emerald-500" />}
                          <span>{source.label}</span>
                        </span>
                        <span className="text-slate-400 font-medium">{source.percentage}%</span>
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatCurrency(source.totalNet)}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>{source.count} รายการ</span>
                        <span>{source.isTaxable ? 'เสียภาษี (40(1)/40(2))' : 'ยกเว้นภาษี'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: แนวโน้ม (Trends) */}
      {activeTab === 'trends' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Frequent Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span>รายการที่ใช้จ่ายบ่อยที่สุด (Top Frequent Items)</span>
              </CardTitle>
              <CardDescription>จัดอันดับตามความถี่ในการซื้อ และยอดรวมการใช้จ่าย</CardDescription>
            </CardHeader>
            <CardContent>
              {frequentItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">ยังไม่มีข้อมูลรายการใช้จ่าย</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                        <th className="pb-3 font-semibold">อันดับ</th>
                        <th className="pb-3 font-semibold">ชื่อรายการ</th>
                        <th className="pb-3 font-semibold text-center">จำนวนครั้ง</th>
                        <th className="pb-3 font-semibold text-right">ยอดเฉลี่ย / ครั้ง</th>
                        <th className="pb-3 font-semibold text-right">ยอดรวมทั้งสิ้น</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {frequentItems.map((item, idx) => (
                        <tr key={item.description} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-3 font-bold text-slate-400">#{idx + 1}</td>
                          <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                            {item.description}
                          </td>
                          <td className="py-3 text-center">
                            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 font-bold">
                              {item.count} ครั้ง
                            </span>
                          </td>
                          <td className="py-3 text-right font-medium tabular-nums text-slate-600 dark:text-slate-400">
                            {formatCurrency(item.avgAmount)}
                          </td>
                          <td className="py-3 text-right font-bold tabular-nums text-slate-900 dark:text-slate-100">
                            {formatCurrency(item.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Net Flow Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>แนวโน้มรายจ่ายตามเวลา</CardTitle>
              <CardDescription>เส้นแสดงการใช้จ่ายในแต่ละวัน</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400">ไม่มีข้อมูลแสดงแนวโน้ม</div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => val.slice(8)}
                        fontSize={11}
                        stroke="#94a3b8"
                      />
                      <YAxis fontSize={11} stroke="#94a3b8" />
                      <Tooltip
                        formatter={(val: unknown) => [formatCurrency(Number(val) || 0), '']}
                        labelFormatter={(lbl) => formatThaiDate(String(lbl), 'medium')}
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        name="รายจ่าย"
                        stroke="#f43f5e"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: ค่าใช้จ่ายสูงสุด (Top Spending) */}
      {activeTab === 'top_spending' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <Card>
              <CardHeader>
                <CardTitle>สัดส่วนรายจ่ายตามหมวดหมู่</CardTitle>
                <CardDescription>เปอร์เซ็นต์ค่าใช้จ่ายแต่ละหมวด</CardDescription>
              </CardHeader>
              <CardContent>
                {categorySpending.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">ยังไม่มีรายจ่ายในหมวดหมู่นี้</div>
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySpending}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {categorySpending.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'ยอดเงิน']}
                        />
                        <Legend
                          formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ranked Category Progress Bars */}
            <Card>
              <CardHeader>
                <CardTitle>อันดับหมวดหมู่ค่าใช้จ่ายสูงสุด</CardTitle>
                <CardDescription>เรียงลำดับจากยอดใช้จ่ายมากที่สุดไปหาน้อยที่สุด</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorySpending.slice(0, 8).map((cat) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                        <span className="text-slate-400 font-normal">({cat.count} รายการ)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums text-slate-900 dark:text-slate-100">
                          {formatCurrency(cat.amount)}
                        </span>
                        <span className="text-slate-400 w-10 text-right">{cat.percentage}%</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(2, cat.percentage))}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: ภาษี (Tax Report) */}
      {activeTab === 'tax_report' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <Card className="border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-emerald-600" />
                  <span>สรุปประมาณการภาษีเงินได้บุคคลธรรมดา (ปีภาษี {taxCalculation.taxYear})</span>
                </CardTitle>
                <CardDescription>
                  สรุปคำนวณจากทุกแหล่งรายได้ (เงินเดือน, พาร์ทไทม์, ฟรีแลนซ์) และภาษีหัก ณ ที่จ่ายสะสม
                </CardDescription>
              </div>

              <Link to="/tax">
                <Button variant="outline" size="sm" className="gap-1">
                  <span>ดูรายละเอียดภาษีฉบับเต็ม</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
              {/* Top stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">เงินได้พึงประเมิน</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrency(taxCalculation.grossIncome)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">เงินได้ยกเว้น (ค่าขนม)</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {formatCurrency(taxCalculation.exemptIncome)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">รวมค่าลดหย่อน</span>
                  <span className="text-lg font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatCurrency(taxCalculation.totalDeductions)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">ภาษีหัก ณ ที่จ่าย (50 ทวิ)</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {formatCurrency(taxCalculation.totalWithholdingTax)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block font-medium">
                    {taxCalculation.isEligibleForRefund ? 'สิทธิขอคืนเงินภาษี' : 'ภาษีชำระสุทธิ'}
                  </span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                    {taxCalculation.isEligibleForRefund
                      ? `+${formatCurrency(taxCalculation.taxRefund)}`
                      : formatCurrency(taxCalculation.netTaxPayable)}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">
                    {taxCalculation.isEligibleForRefund ? '(ยื่น ภ.ง.ด.90 ขอคืน 100%)' : `(Effective ${taxCalculation.effectiveRate}%)`}
                  </span>
                </div>
              </div>

              {/* Bracket Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  การคำนวณตามขั้นบันไดภาษี
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                        <th className="pb-2 font-semibold">ขั้นเงินได้สุทธิ</th>
                        <th className="pb-2 font-semibold">อัตราภาษี</th>
                        <th className="pb-2 font-semibold text-right">เงินได้ในขั้น</th>
                        <th className="pb-2 font-semibold text-right">ภาษีในขั้น</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {taxCalculation.brackets.map((b) => (
                        <tr key={b.bracket} className={b.taxableInBracket > 0 ? 'font-medium' : 'text-slate-400'}>
                          <td className="py-2.5">{b.bracket}</td>
                          <td className="py-2.5">{(b.rate * 100).toFixed(0)}%</td>
                          <td className="py-2.5 text-right tabular-nums">
                            {formatCurrency(b.taxableInBracket)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(b.taxAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
