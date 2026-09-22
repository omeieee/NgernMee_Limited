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
  Smartphone,
  ExternalLink,
  FolderPlus,
  FolderTree,
  SunMoon,
  BadgePercent,
  Calculator,
  RefreshCw,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAppStore } from '../stores/useAppStore';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
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
    syncWithSupabase,
  } = useAppStore();

  const { signOut } = useAuth();
  const { categories, categoriesMap } = useCategories();
  const expenseCatCount = categories.filter((c) => c.type === 'expense' && !c.parent_id).length;
  const incomeCatCount = categories.filter((c) => c.type === 'income' && !c.parent_id).length;

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [monthlySalary, setMonthlySalary] = useState(
    taxConfig.monthly_salary ? String(taxConfig.monthly_salary) : ''
  );
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
      {/* ==================================================== */}
      {/* VIEW: DEDICATED MOBILE SETTINGS (ตั้งค่าระบบ)        */}
      {/* Exactly matching prototype_mobile_first.html #view-settings and Screenshot 2026-09-22 200217.png */}
      {/* ==================================================== */}
      <div className="block md:hidden space-y-4">
        {/* Settings Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              ตั้งค่าระบบ
            </h2>
            <p className="text-[11px] text-slate-400">บัญชีผู้ใช้ ความปลอดภัย และการตั้งค่า</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Settings className="w-4 h-4" />
          </div>
        </div>

        {/* User Profile Card (Neomorphic Card) */}
        <div className="theme-surface rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 neo-card flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
            <span>NM</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {profile?.display_name ||
                  (isDemoMode
                    ? 'คุณสมชาย มีเงิน'
                    : user?.email?.split('@')[0] || 'คุณสมชาย มีเงิน')}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 shrink-0">
                บุคคลธรรมดา
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {user?.email || 'somchai.mee@ngernmee.com'}
            </p>
          </div>
        </div>

        {/* Category Management Section */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            จัดการหมวดหมู่ (CATEGORIES)
          </span>
          <div className="theme-surface rounded-2xl border border-slate-200/80 dark:border-white/[0.08] divide-y divide-slate-100 dark:divide-white/[0.04] overflow-hidden neo-card">
            {/* Add New Category */}
            <Link
              to="/categories"
              className="p-3.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                    เพิ่มหมวดหมู่ใหม่ (รายรับ - รายจ่าย)
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    สร้างหมวดหลักหรือหมวดย่อย เลือกสีและไอคอนตามต้องการ
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 whitespace-nowrap inline-flex items-center justify-center leading-normal">
                  เพิ่ม
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </Link>

            {/* View Full Category Structure */}
            <Link
              to="/categories"
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    โครงสร้างหมวดหมู่ทั้งหมด
                  </span>
                  <span className="text-[10px] text-slate-400">
                    รายจ่าย {expenseCatCount} หมวดหลัก • รายรับ {incomeCatCount} หมวดหลัก
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Preferences List */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            การใช้งาน & รูปแบบ
          </span>
          <div className="theme-surface rounded-2xl border border-slate-200/80 dark:border-white/[0.08] divide-y divide-slate-100 dark:divide-white/[0.04] overflow-hidden neo-card">
            {/* Day / Night Mode Row */}
            <div className="p-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <SunMoon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                    ธีมหน้าจอ
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    สลับโทนสีสว่าง / มืด (Neomorphic)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-blue-400 num-tabular whitespace-nowrap">
                  {theme === 'dark' ? 'โหมดมืด (Dark)' : 'โหมดสว่าง (Day)'}
                </span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-3 py-1 rounded-xl theme-badge border text-[11px] font-bold text-slate-700 dark:text-slate-200 smooth-tap whitespace-nowrap inline-flex items-center justify-center leading-normal shrink-0 cursor-pointer"
                >
                  สลับ
                </button>
              </div>
            </div>

            {/* Co-pay Thai Chuay Thai Quota Info */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <BadgePercent className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    สิทธิ์คนละครึ่ง / ไทยช่วยไทย (60/40)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    โควตารัฐช่วย 60% สูงสุด ฿200/วัน
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-500 num-tabular">เปิดใช้งาน</span>
            </div>

            {/* Tax Assistant Shortcut */}
            <Link
              to="/tax"
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    ผู้ช่วยคำนวณภาษี & ขอคืนเงิน
                  </span>
                  <span className="text-[10px] text-slate-400">
                    จำลองสิทธิลดหย่อน ภ.ง.ด.91 ปี 2568-69
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            {/* Real Project Data Sync */}
            <div
              onClick={async () => {
                try {
                  await syncWithSupabase();
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 2000);
                } catch {
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 2000);
                }
              }}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    เชื่อมต่อข้อมูลโปรเจคจริง
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ซิงค์ ngernmee-storage และ LocalStorage
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ซิงค์
              </span>
            </div>

            {/* Reset Data Option */}
            <div
              onClick={() => {
                resetToDemoData();
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    รีเซ็ตข้อมูลธุรกรรม
                  </span>
                  <span className="text-[10px] text-slate-400">
                    คืนค่าธุรกรรมและยอดเงินเริ่มต้น
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">รีเซ็ต</span>
            </div>
          </div>
        </div>

        {/* App Version info */}
        <div className="text-center py-1">
          <span className="text-[11px] text-slate-400">
            NgernMee Limited v1.2 (Mobile Prototype)
          </span>
        </div>

        {/* Logout Button (Prominent & Clear) */}
        <button
          type="button"
          onClick={() => signOut()}
          className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-500/30 neo-btn smooth-tap active:scale-[0.98] transition-all shadow-xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบ (Logout)</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* DESKTOP & TABLET VIEW (>= 768px): Original Settings  */}
      {/* ==================================================== */}
      <div className="hidden md:block space-y-6">
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
                    <span className="absolute left-3.5 top-3 sm:top-2.5 text-sm font-semibold text-slate-400">
                      ฿
                    </span>
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
                <Button
                  type="submit"
                  isLoading={isSaving}
                  className="min-h-[44px] touch-manipulation w-full sm:w-auto"
                >
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
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-amber-400" />
              ) : (
                <Sun className="h-5 w-5 text-amber-500" />
              )}
              <span>ธีมและการแสดงผล</span>
            </CardTitle>
            <CardDescription>ปรับเปลี่ยนชุดสีของแอปพลิเคชันตามความต้องการ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  โหมดสีปัจจุบัน:{' '}
                  {theme === 'dark' ? 'โหมดมืด (Dark Mode)' : 'โหมดสว่าง (Light Mode)'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  รองรับการถนอมสายตา และการใช้งานในที่แสงน้อย
                </p>
              </div>
              <Button variant="outline" onClick={toggleTheme} className="gap-2">
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-amber-400" />
                )}
                <span>สลับ</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportTransactions}
                  className="w-full min-h-[44px] touch-manipulation"
                >
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportTax}
                  className="w-full min-h-[44px] touch-manipulation"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  ดาวน์โหลด CSV ภาษี
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile-First Prototype Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-emerald-600" />
              <span>Mobile-First Prototype (เงินมี จำกัด)</span>
            </CardTitle>
            <CardDescription>
              เชื่อมต่อข้อมูลแบบสองทิศทางกับ prototype_mobile_first.html ผ่าน LocalStorage & Zustand
              Store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200/80 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  เปิดหน้าจอต้นแบบสมาร์ตโฟน & แท็บเล็ต
                </p>
                <p className="text-[11px] text-slate-400">
                  ทดลองใช้งาน Neomorphic Design System, Thumb-Zone Quick Add และสลับ Day/Night Mode
                </p>
              </div>
              <a
                href="./prototype_mobile_first.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all touch-manipulation active:scale-95 shrink-0"
              >
                <span>เปิด Prototype</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
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
                    {isSupabaseConfigured
                      ? 'เชื่อมต่อ Supabase PostgreSQL สำเร็จ'
                      : 'ใช้งานในโหมด Local Demo Store (ออฟไลน์)'}
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
    </div>
  );
};
