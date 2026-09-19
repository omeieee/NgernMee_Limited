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
  Gift,
  Coffee,
  Briefcase,
  HelpCircle,
  ArrowUpRight,
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
    incomeStats,
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
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] px-2.5 py-0.5 font-medium border border-slate-200 dark:border-slate-700">
                <Calculator className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>ประมาณการภาษีเงินได้บุคคลธรรมดา ปีภาษี {taxConfig.tax_year}</span>
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] px-2 py-0.5 font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                Effective Rate: {calculation.effectiveRate}%
              </span>

              {calculation.isEligibleForRefund && (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] px-2.5 py-0.5 font-semibold border border-blue-200/60 dark:border-blue-800/60">
                  <Gift className="h-3 w-3" />
                  <span>มีสิทธิขอคืนภาษี (Tax Refund)</span>
                </span>
              )}
            </div>

            {/* Headline outcome: Tax Refund or Net Tax Due */}
            <div className="pt-1">
              {calculation.isEligibleForRefund && calculation.taxRefund > 0 ? (
                <div>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    ยอดเงินภาษีที่คุณมีสิทธิ์ได้รับคืน:
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatCurrency(calculation.taxRefund)}
                    </h2>
                    <span className="text-xs text-slate-500">
                      (จากภาษีหัก ณ ที่จ่ายสะสม {formatCurrency(calculation.totalWithholdingTax)})
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">ภาษีที่ต้องชำระสุทธิ:</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(calculation.netTaxPayable)}
                    </h2>
                    {calculation.totalWithholdingTax > 0 && (
                      <span className="text-xs text-slate-500">
                        (หักภาษี ณ ที่จ่ายไปแล้ว {formatCurrency(calculation.totalWithholdingTax)})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              ฐานเงินได้สุทธิที่นำไปคำนวณภาษี: <strong className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(calculation.netTaxableIncome)}</strong>
            </p>
          </div>

          {/* Export Button */}
          <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
            <Button
              onClick={handleExport}
              variant="outline"
              className="text-xs font-medium min-h-[44px] touch-manipulation w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-1.5 text-slate-500" />
              <span>ดาวน์โหลดรายงานภาษี (CSV)</span>
            </Button>
          </div>
        </div>

        {/* 5 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">เงินได้พึงประเมิน</span>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">{formatCurrency(calculation.grossIncome)}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">เงินได้ยกเว้น (ค่าขนม/ทุน)</span>
            <div className="text-base font-semibold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
              {formatCurrency(calculation.exemptIncome)}
            </div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">ลดหย่อนรวม</span>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
              {formatCurrency(calculation.totalDeductions)}
            </div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">ภาษีคำนวณได้</span>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
              {formatCurrency(calculation.totalTax)}
            </div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">ภาษีหัก ณ ที่จ่าย (50 ทวิ)</span>
            <div className="text-base font-semibold text-blue-600 dark:text-blue-400 tabular-nums mt-0.5">
              {formatCurrency(calculation.totalWithholdingTax)}
            </div>
          </div>
        </div>
      </Card>

      {/* Student / Freelance Tax Refund Celebration Card */}
      {calculation.isEligibleForRefund && calculation.taxRefund > 0 && (
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-emerald-50/80 p-5 dark:border-blue-900/60 dark:from-blue-950/40 dark:to-emerald-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-900 dark:text-blue-100">
                <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>คุณมีสิทธิได้รับเงินคืนภาษี {formatCurrency(calculation.taxRefund)} จากกรมสรรพากร!</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                เนื่องจากยอดเงินได้สุทธิทั้งปีของคุณไม่ถึงเกณฑ์เสียภาษี (ภาษีจริง = 0 บาท) แต่ถูกผู้ว่าจ้างหักภาษี ณ ที่จ่าย (ใบ 50 ทวิ) ไประหว่างปี
                คุณสามารถยื่นแบบ <strong>ภ.ง.ด.90</strong> เพื่อขอรับเงินส่วนนี้คืนเข้าบัญชีพร้อมเพย์ได้เต็มจำนวน 100%
              </p>
            </div>
            <a
              href="https://efiling.rd.go.th"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shrink-0 shadow-2xs"
            >
              <span>ยื่นขอคืนภาษีที่ rd.go.th</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Main Sections: Income Settings & Bracket Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Income and Deductions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Income Source Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">1. โครงสร้างและแหล่งที่มาของเงินได้ (Income Streams)</CardTitle>
              <CardDescription>
                รองรับทั้งเงินเดือนประจำ (40(1)), งานพาร์ทไทม์/ฟรีแลนซ์ (40(2)), และเงินช่วยเหลือจากครอบครัว (ไม่คิดภาษี)
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Option to sync with transaction history */}
              {incomeStats.hasAnyIncomeTxs && (
                <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                        ดึงข้อมูลรายรับจริงจากประวัติบันทึกปี {taxConfig.tax_year}
                      </span>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-emerald-800 dark:text-emerald-200 select-none">
                      <input
                        type="checkbox"
                        checked={useAutoSalary}
                        onChange={(e) => setUseAutoSalary(e.target.checked)}
                        className="h-4 w-4 rounded-sm text-emerald-600"
                      />
                      <span>ใช้ยอดจริงคำนวณ</span>
                    </label>
                  </div>

                  {/* Multi-stream breakdown pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/60">
                      <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                        <Briefcase className="h-3 w-3 text-emerald-600" />
                        <span>เงินเดือน 40(1):</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatCurrency(incomeStats.salary40_1)}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/60">
                      <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                        <Coffee className="h-3 w-3 text-blue-600" />
                        <span>พาร์ทไทม์/ฟรีแลนซ์ 40(2):</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatCurrency(incomeStats.freelance40_2)}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/60 col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                        <Gift className="h-3 w-3 text-amber-600" />
                        <span>เงินจากครอบครัว/ค่าขนม:</span>
                      </div>
                      <span className="font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                        {formatCurrency(incomeStats.allowanceExempt)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">(ไม่คิดภาษี)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Monthly Salary Input (for fixed earners or simulation) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    เงินเดือนประจำ (บาท / เดือน) <span className="text-slate-400 font-normal">(ถ้ามี)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 sm:top-2.5 text-sm font-semibold text-slate-400">฿</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      disabled={useAutoSalary && incomeStats.hasAnyIncomeTxs}
                      value={taxConfig.monthly_salary || ''}
                      placeholder="0.00"
                      onChange={(e) => updateSalary(parseFloat(e.target.value) || 0)}
                      className="h-11 sm:h-10 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-base sm:text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-50 tabular-nums touch-manipulation"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    สำหรับผู้ที่มีเงินเดือนคงที่ (หากเป็นนักศึกษาหรือฟรีแลนซ์สามารถเว้นว่างไว้ได้)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    เงินได้พึงประเมินรวมทั้งปีที่ใช้คำนวณ (บาท)
                  </label>
                  <div className="h-11 sm:h-10 flex items-center px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatCurrency(grossIncome)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    เฉพาะรายได้ที่ต้องเสียภาษี (ไม่รวมเงินค่าขนมและทุน)
                  </p>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>คำแนะนำเพื่อประหยัดภาษี</span>
                </CardTitle>
                <CardDescription>
                  โอกาสในการลดหย่อนภาษีเพิ่มเติมที่คุณยังใช้ไม่เต็มสิทธิ์
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {taxSavingTips.map((tip) => (
                  <div
                    key={tip.title}
                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1"
                  >
                    <h5 className="font-semibold text-slate-900 dark:text-slate-100">{tip.title}</h5>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{tip.desc}</p>
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
