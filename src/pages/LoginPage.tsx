// src/pages/LoginPage.tsx
// Authentication page with sign in, register, and instant demo access

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, LogIn, UserPlus, Sparkles, CheckCircle, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME, APP_TAGLINE } from '../lib/constants';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signUp, signInWithDemo, loading, authError } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email || !email.includes('@')) {
      errs.email = 'กรุณากรอกอีเมลที่ถูกต้อง';
    }
    if (!password || password.length < 6) {
      errs.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let success = false;
    if (isRegister) {
      success = await signUp(email, password, displayName);
    } else {
      success = await signIn(email, password);
    }

    if (success) {
      navigate('/');
    }
  };

  const handleDemoAccess = () => {
    signInWithDemo();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* App Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
            <Coins className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {APP_NAME}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {APP_TAGLINE}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-sm border-slate-200/80 dark:border-slate-800">
          <CardHeader className="text-center pb-2">
            <CardTitle>{isRegister ? 'สมัครสมาชิกใหม่' : 'เข้าสู่ระบบ'}</CardTitle>
            <CardDescription>
              {isRegister
                ? 'กรอกข้อมูลเพื่อเริ่มต้นบริหารการเงินส่วนบุคคล'
                : 'ยินดีต้อนรับกลับสู่ระบบบริหารเงินอัจฉริยะ'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {authError && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/50 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isRegister && (
                <Input
                  label="ชื่อที่ต้องการให้เรียก"
                  placeholder="เช่น สมชาย มีเงิน"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              )}

              <Input
                label="อีเมล"
                type="email"
                placeholder="name@example.com"
                value={email}
                error={errors.email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="รหัสผ่าน"
                type="password"
                placeholder="••••••••"
                value={password}
                error={errors.password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" className="w-full mt-2 min-h-[44px] touch-manipulation font-semibold text-sm" isLoading={loading}>
                {isRegister ? (
                  <>
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    สร้างบัญชีผู้ใช้
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-1.5" />
                    เข้าสู่ระบบ
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">หรือ</span>
              </div>
            </div>

            {/* Instant Demo Access Button */}
            <Button
              variant="outline"
              type="button"
              onClick={handleDemoAccess}
              className="w-full text-slate-700 dark:text-slate-200 min-h-[44px] touch-manipulation font-medium text-xs sm:text-sm"
            >
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-1.5" />
              <span>เข้าทดลองใช้งานทันที (Demo Mode)</span>
            </Button>

            {/* Features Highlight */}
            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>คำนวณและตัดโควตาโครงการคนละครึ่ง / ไทยช่วยไทย 60/40 อัตโนมัติ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>จำลองการคำนวณภาษีเงินได้บุคคลธรรมดา 2568-2569 ตามขั้นบันไดจริง</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>จัดหมวดหมู่แบบต้นไม้ไม่จำกัดระดับชั้น พร้อมกราฟวิเคราะห์ครบครัน</span>
              </div>
            </div>

            {/* Mode Switch Toggle */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrors({});
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                {isRegister ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
