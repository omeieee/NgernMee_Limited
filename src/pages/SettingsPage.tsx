// src/pages/SettingsPage.tsx
// Settings page for profile management, salary defaults, data export, and theme

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Download,
  Moon,
  Sun,
  ShieldCheck,
  RotateCcw,
  Database,
  Briefcase,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAppStore } from '../stores/useAppStore';
import { useCategories } from '../hooks/useCategories';
import { exportTransactionsToCSV, exportTaxReportToCSV } from '../lib/exportUtils';
import { isSupabaseConfigured } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const {
    theme,
    toggleTheme,
    profile,
    user,
    isDemoMode,
    taxConfig,
    updateTaxConfig,
    updateProfile,
    transactions,
    getTaxCalculation,
    resetToDemoData,
  } = useAppStore();

  const { categoriesMap } = useCategories();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [monthlySalary, setMonthlySalary] = useState(taxConfig.monthly_salary ? String(taxConfig.monthly_salary) : '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize input fields when profile or taxConfig updates from cloud sync
  useEffect(() => {
    if (profile?.display_name !== undefined && profile?.display_name !== null) {
      setDisplayName(profile.display_name);
    }
  }, [profile?.display_name]);

  useEffect(() => {
    if (taxConfig.monthly_salary !== undefined) {
      setMonthlySalary(taxConfig.monthly_salary ? String(taxConfig.monthly_salary) : '');
    }
  }, [taxConfig.monthly_salary]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      const salaryNum = parseFloat(monthlySalary) || 0;
      await updateProfile(displayName);
      await updateTaxConfig({
        monthly_salary: salaryNum,
        annual_salary: salaryNum * 12,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportTransactions = () => {
    exportTransactionsToCSV(transactions, categoriesMap);
  };

  const handleExportTax = () => {
    const taxCalc = getTaxCalculation();
    exportTaxReportToCSV(taxCalc);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 animate-in fade-in duration-200">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 p-4 text-xs font-semibold text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Profile & Financial Baseline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-600" />
            <span>ข้อมูลส่วนตัวและฐานเงินได้</span>
          </CardTitle>
          <CardDescription>
            กำหนดชื่อที่ใช้แสดงและเงินเดือนประจำสำหรับใช้เป็นฐานคำนวณภาษี
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="ชื่อที่ใช้แสดง"
                placeholder="เช่น สมชาย มีเงิน"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />

              <Input
                label="อีเมลบัญชีผู้ใช้"
                value={user?.email || 'demo@ngernmee.local'}
                disabled
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  เงินเดือนประจำเริ่มต้น (บาท / เดือน)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 sm:top-2.5 text-sm font-semibold text-slate-400">฿</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    placeholder="45,000"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    className="h-11 sm:h-10 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-base sm:text-sm font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 tabular-nums touch-manipulation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  เงินได้ทั้งปีโดยประมาณ (12 เดือน)
                </label>
                <div className="h-11 sm:h-10 flex items-center px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatCurrency((parseFloat(monthlySalary) || 0) * 12)}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isSaving} className="min-h-[44px] touch-manipulation w-full sm:w-auto">
                บันทึกข้อมูลส่วนตัว
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Appearance & Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5 text-amber-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
            <span>ธีมและการแสดงผล</span>
          </CardTitle>
          <CardDescription>ปรับเปลี่ยนชุดสีของแอปพลิเคชันตามความต้องการ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                โหมดสีปัจจุบัน: {theme === 'dark' ? 'โหมดมืด (Dark Mode)' : 'โหมดสว่าง (Light Mode)'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                รองรับการถนอมสายตา และการใช้งานในที่แสงน้อย
              </p>
            </div>
            <Button variant="outline" onClick={toggleTheme} className="gap-2">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-amber-400" />}
              <span>สลับธีม</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Export & Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-600" />
            <span>การส่งออกข้อมูล (Export Data)</span>
          </CardTitle>
          <CardDescription>
            ดาวน์โหลดข้อมูลออกเป็นไฟล์ CSV (UTF-8 with BOM รองรับภาษาไทยใน Microsoft Excel 100%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                ประวัติรายการบันทึกทั้งหมด
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ส่งออกรายการรายรับและรายจ่ายทั้งหมด {transactions.length} รายการ พร้อมยอดคนละครึ่ง
              </p>
              <Button variant="outline" size="sm" onClick={handleExportTransactions} className="w-full min-h-[44px] touch-manipulation">
                <Download className="h-4 w-4 mr-1.5" />
                ดาวน์โหลด CSV รายการ
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                รายงานการคำนวณภาษี
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ส่งออกสรุปค่าลดหย่อน เงินได้สุทธิ และการคำนวณขั้นบันไดภาษี ปี {taxConfig.tax_year}
              </p>
              <Button variant="outline" size="sm" onClick={handleExportTax} className="w-full min-h-[44px] touch-manipulation">
                <Download className="h-4 w-4 mr-1.5" />
                ดาวน์โหลด CSV ภาษี
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System & Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>สถานะระบบและฐานข้อมูล</span>
          </CardTitle>
          <CardDescription>ข้อมูลการเชื่อมต่อและเครื่องมือสำหรับนักพัฒนา</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-3 w-3 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {isSupabaseConfigured ? 'เชื่อมต่อ Supabase PostgreSQL สำเร็จ' : 'ใช้งานในโหมด Local Demo Store (ออฟไลน์)'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isSupabaseConfigured
                    ? 'ข้อมูลซิงก์กับระบบคลาวด์แบบเรียลไทม์'
                    : 'ข้อมูลถูกบันทึกในเบราว์เซอร์อย่างปลอดภัยด้วย LocalStorage'}
                </p>
              </div>
            </div>

            {isDemoMode && (
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 font-medium border border-slate-200 dark:border-slate-700">
                Demo
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                รีเซ็ตข้อมูลตัวอย่าง (Reset Demo Data)
              </p>
              <p className="text-[11px] text-slate-400">
                โหลดชุดข้อมูลเริ่มต้นของไทยใหม่ทั้งหมดสำหรับทดสอบระบบ
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetToDemoData();
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}
              className="gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>รีเซ็ตข้อมูล</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
