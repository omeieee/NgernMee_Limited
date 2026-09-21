// src/components/tax/DeductionChecklist.tsx
// Interactive deduction checklist enforcing official Thai Revenue Department maximum limits

import React from 'react';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import type { AdditionalDeductions } from '../../lib/types';
import { TAX_DEDUCTION_LIMITS } from '../../packages/tax-engine';
import { formatCurrency, formatNumber } from '../../lib/utils';

interface DeductionChecklistProps {
  grossIncome: number;
  deductions: AdditionalDeductions;
  onUpdate: (key: keyof AdditionalDeductions, value: number) => void;
}

export const DeductionChecklist: React.FC<DeductionChecklistProps> = ({
  grossIncome,
  deductions,
  onUpdate,
}) => {
  // Compute individual dynamic caps based on gross income
  const maxThaiEsg = Math.min(
    TAX_DEDUCTION_LIMITS.THAI_ESG_MAX,
    Math.round(grossIncome * TAX_DEDUCTION_LIMITS.THAI_ESG_PERCENT)
  );
  const maxRmf = Math.min(
    TAX_DEDUCTION_LIMITS.RMF_MAX,
    Math.round(grossIncome * TAX_DEDUCTION_LIMITS.RMF_PERCENT)
  );
  const maxSsf = Math.min(
    TAX_DEDUCTION_LIMITS.SSF_MAX,
    Math.round(grossIncome * TAX_DEDUCTION_LIMITS.SSF_PERCENT)
  );
  const maxPvd = Math.min(TAX_DEDUCTION_LIMITS.PROVIDENT_FUND_MAX, Math.round(grossIncome * 0.15));

  const deductionItems: {
    key: keyof AdditionalDeductions;
    label: string;
    desc: string;
    maxLimit: number;
    placeholder: string;
  }[] = [
    {
      key: 'life_insurance',
      label: 'เบี้ยประกันชีวิตทั่วไป',
      desc: 'กรมธรรม์ 10 ปีขึ้นไป รวมกับประกันสุขภาพไม่เกิน 100,000 บาท',
      maxLimit: TAX_DEDUCTION_LIMITS.LIFE_INSURANCE_MAX,
      placeholder: '0',
    },
    {
      key: 'health_insurance',
      label: 'เบี้ยประกันสุขภาพตนเอง',
      desc: 'ลดหย่อนได้ตามจริงสูงสุดไม่เกิน 25,000 บาท',
      maxLimit: TAX_DEDUCTION_LIMITS.HEALTH_INSURANCE_MAX,
      placeholder: '0',
    },
    {
      key: 'thai_esg',
      label: 'กองทุนรวมไทยเพื่อความยั่งยืน (Thai ESG)',
      desc: `ไม่เกิน 30% ของเงินได้ และสูงสุด 300,000 บาท (สำหรับคุณ: สูงสุด ${formatCurrency(maxThaiEsg)})`,
      maxLimit: maxThaiEsg,
      placeholder: '0',
    },
    {
      key: 'rmf',
      label: 'กองทุนรวมเพื่อการเลี้ยงชีพ (RMF)',
      desc: `ไม่เกิน 30% ของเงินได้ และสูงสุด 500,000 บาท (สำหรับคุณ: สูงสุด ${formatCurrency(maxRmf)})`,
      maxLimit: maxRmf,
      placeholder: '0',
    },
    {
      key: 'ssf',
      label: 'กองทุนรวมเพื่อส่งเสริมการออมระยะยาว (SSF)',
      desc: `ไม่เกิน 30% ของเงินได้ และสูงสุด 200,000 บาท (สำหรับคุณ: สูงสุด ${formatCurrency(maxSsf)})`,
      maxLimit: maxSsf,
      placeholder: '0',
    },
    {
      key: 'provident_fund',
      label: 'กองทุนสำรองเลี้ยงชีพ / กบข. / กอช.',
      desc: `ไม่เกิน 15% ของเงินได้ และสูงสุด 500,000 บาท (สำหรับคุณ: สูงสุด ${formatCurrency(maxPvd)})`,
      maxLimit: maxPvd,
      placeholder: '0',
    },
    {
      key: 'home_loan_interest',
      label: 'ดอกเบี้ยเงินกู้ยืมเพื่อซื้อที่อยู่อาศัย',
      desc: 'ดอกเบี้ยผ่อนบ้านหรือคอนโดมิเนียม สูงสุดไม่เกิน 100,000 บาท',
      maxLimit: TAX_DEDUCTION_LIMITS.HOME_LOAN_INTEREST_MAX,
      placeholder: '0',
    },
    {
      key: 'parent_care',
      label: 'ค่าอุปการะเลี้ยงดูบิดามารดา',
      desc: 'บิดามารดาอายุ 60 ปีขึ้นไปและมีเงินได้ไม่เกิน 30,000 บาท/ปี (คนละ 30,000 บาท)',
      maxLimit: 120000,
      placeholder: '0',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Statutory Standard Deductions (Fixed by Law) */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>ค่าลดหย่อนมาตรฐานตามกฎหมาย (คำนวณอัตโนมัติ)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">ค่าลดหย่อนส่วนบุคคล</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {formatCurrency(TAX_DEDUCTION_LIMITS.PERSONAL_ALLOWANCE)}
            </span>
            <span className="text-[10px] text-slate-400 block">สิทธิ์ลดหย่อนทุกคน</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">ค่าใช้จ่ายเงินเดือน 50%</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {formatCurrency(
                Math.min(grossIncome * 0.5, TAX_DEDUCTION_LIMITS.EMPLOYMENT_EXPENSE_MAX)
              )}
            </span>
            <span className="text-[10px] text-slate-400 block">สูงสุด 100,000 บาท</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">เงินสมทบประกันสังคม</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {formatCurrency(TAX_DEDUCTION_LIMITS.SOCIAL_SECURITY_MAX)}
            </span>
            <span className="text-[10px] text-slate-400 block">สูงสุด 9,000 บาท/ปี</span>
          </div>
        </div>
      </div>

      {/* Additional Deductions Inputs */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          ค่าลดหย่อนเพิ่มเติม (กรอกตามจำนวนที่จ่ายจริง)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {deductionItems.map((item) => {
            const currentValue = deductions[item.key] || 0;
            const isFilled = currentValue > 0;

            return (
              <div
                key={item.key}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      {item.label}
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                  {isFilled && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-3 sm:top-2 text-xs font-semibold text-slate-400">
                    ฿
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={item.maxLimit}
                    inputMode="numeric"
                    placeholder={item.placeholder}
                    value={currentValue > 0 ? currentValue : ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onUpdate(item.key, Math.min(val, item.maxLimit));
                    }}
                    className="h-11 sm:h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-7 pr-3 text-base sm:text-xs font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums touch-manipulation"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
