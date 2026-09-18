// src/pages/TaxPage.tsx
// Comprehensive Thai Personal Income Tax (PIT) planning & calculation page

import React from 'react';
import {
  Calculator,
  Coins,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BracketVisualizer } from '../components/tax/BracketVisualizer';
import { DeductionChecklist } from '../components/tax/DeductionChecklist';
import { useTaxCalculation } from '../hooks/useTaxCalculation';
import { exportTaxReportToCSV } from '../lib/exportUtils';
import { formatCurrency, formatNumber } from '../lib/utils';

export const TaxPage: React.FC = () => {
  const {
    taxConfig,
    grossIncome,
    transactionSalaryTotal,
    useAutoSalary,
    setUseAutoSalary,
    calculation,
    taxSavingTips,
    updateSalary,
    updateAdditionalDeduction,
  } = useTaxCalculation();

  const handleExport = () => {
    exportTaxReportToCSV(calculation);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-time Tax Outcome Summary */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-700/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-100">
              <Calculator className="h-4 w-4" />
              <span>ประมาณการภาษีเงินได้บุคคลธรรมดา ปีภาษี {taxConfig.tax_year}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              ภาษีที่ต้องชำระ: {formatCurrency(calculation.totalTax)}
            </h2>
            <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
              อัตราภาษีที่แท้จริง (Effective Tax Rate):{' '}
              <strong className="text-white text-sm">{calculation.effectiveRate}%</strong> | เงินได้สุทธิที่ต้องเสียภาษี:{' '}
              {formatCurrency(calculation.netTaxableIncome)}
            </p>
          </div>

          {/* Export & Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={handleExport}
              className="bg-white text-emerald-800 hover:bg-emerald-50 shadow-sm"
            >
              <Download className="h-4 w-4 mr-1.5" />
              ดาวน์โหลดรายงาน CSV
            </Button>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20 text-xs">
          <div>
            <span className="text-emerald-200 block text-[11px]">เงินได้รวมทั้งปี</span>
            <div className="text-base font-bold tabular-nums">{formatCurrency(calculation.grossIncome)}</div>
          </div>
          <div>
            <span className="text-emerald-200 block text-[11px]">ลดหย่อนมาตรฐาน</span>
            <div className="text-base font-bold tabular-nums">
              {formatCurrency(calculation.standardDeductions)}
            </div>
          </div>
          <div>
            <span className="text-emerald-200 block text-[11px]">ลดหย่อนเพิ่มเติม</span>
            <div className="text-base font-bold tabular-nums">
              {formatCurrency(calculation.additionalDeductionsTotal)}
            </div>
          </div>
          <div>
            <span className="text-emerald-200 block text-[11px]">รวมลดหย่อนทั้งสิ้น</span>
            <div className="text-base font-bold tabular-nums text-emerald-100">
              {formatCurrency(calculation.totalDeductions)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections: Income Settings & Bracket Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Income and Deductions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Income Source Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">1. ข้อมูลเงินได้พึงประเมิน (มาตรา 40(1))</CardTitle>
              <CardDescription>
                กำหนดเงินเดือนประจำเพื่อใช้เป็นฐานในการคำนวณภาษี
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Option to sync with transaction history */}
              {transactionSalaryTotal > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 p-3 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="font-semibold text-emerald-900 dark:text-emerald-100 block">
                        พบข้อมูลเงินเดือนจากรายการบันทึก
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        รวมเงินเดือนจากประวัติบันทึกปี {taxConfig.tax_year}: {formatCurrency(transactionSalaryTotal)}
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-emerald-800 dark:text-emerald-200">
                    <input
                      type="checkbox"
                      checked={useAutoSalary}
                      onChange={(e) => setUseAutoSalary(e.target.checked)}
                      className="h-4 w-4 rounded-sm text-emerald-600"
                    />
                    <span>ดึงยอดนี้มาคำนวณ</span>
                  </label>
                </div>
              )}

              {/* Monthly Salary Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    เงินเดือนประจำ (บาท / เดือน)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">฿</span>
                    <input
                      type="number"
                      disabled={useAutoSalary && transactionSalaryTotal > 0}
                      value={taxConfig.monthly_salary || ''}
                      onChange={(e) => updateSalary(parseFloat(e.target.value) || 0)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50 tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    เงินได้ทั้งปีที่ใช้คำนวณ (บาท)
                  </label>
                  <div className="h-10 flex items-center px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrency(grossIncome)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions Checklist Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">2. รายการหักค่าใช้จ่ายและค่าลดหย่อน</CardTitle>
              <CardDescription>
                ปรับเปลี่ยนสิทธิลดหย่อนเพื่อดูผลลัพธ์ภาษีแบบเรียลไทม์
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeductionChecklist
                grossIncome={grossIncome}
                deductions={taxConfig.additional_deductions}
                onUpdate={updateAdditionalDeduction}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Visualizer & Savings Tips */}
        <div className="space-y-6">
          {/* Bracket Progression Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">3. โครงสร้างขั้นบันไดภาษี</CardTitle>
              <CardDescription>
                อัตราภาษีเงินได้บุคคลธรรมดา 8 ขั้น (0% - 35%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BracketVisualizer calculation={calculation} />
            </CardContent>
          </Card>

          {/* Tax Optimization Suggestions */}
          {taxSavingTips.length > 0 && (
            <Card className="border-amber-200/80 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>คำแนะนำเพื่อประหยัดภาษี</span>
                </CardTitle>
                <CardDescription className="text-amber-700/80 dark:text-amber-400">
                  โอกาสในการลดหย่อนภาษีเพิ่มเติมที่คุณยังใช้ไม่เต็มสิทธิ์
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {taxSavingTips.map((tip) => (
                  <div
                    key={tip.title}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/80 text-xs space-y-1"
                  >
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">{tip.title}</h5>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{tip.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
