# NgernMee Limited (เงินมี จำกัด)

> **ระบบบันทึกรายรับ-รายจ่าย วางแผนภาษีเงินได้บุคคลธรรมดา และคำนวณโควตาคนละครึ่ง/ไทยช่วยไทย 60/40 อัจฉริยะ**

![React](https://img.shields.io/badge/React-19-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6-purple.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 🌟 ฟีเจอร์หลัก (Key Features)

### 1. 🛒 ระบบบันทึกรายรับ-รายจ่าย & Quick Select
- บันทึกรายรับและรายจ่ายได้สะดวกรวดเร็ว
- **ชิปเลือกด่วน (Quick Select Chips):** จัดอันดับรายการที่ใช้บ่อยที่สุดเพื่อคลิกกรอกแบบฟอร์มอัตโนมัติใน 1 วินาที
- จัดกลุ่มประวัติตามวันที่ พร้อมสรุปผลรวมรายวัน
- ค้นหาและกรองรายการตามประเภท หมวดหมู่ และสิทธิ์พิเศษ

### 2. 🇹🇭 โครงการคนละครึ่ง / ไทยช่วยไทย (Thai Chuay Thai 60/40)
- **อัตราส่วน 60/40:** รัฐบาลช่วยจ่าย 60% — ผู้ใช้จ่ายจริงเพียง 40%
- **ระบบตัดโควตาอัตโนมัติ:**
  - เพดานรายวัน: รัฐช่วยสูงสุดไม่เกิน **200 บาท/วัน**
  - เพดานรายเดือน: รัฐช่วยสูงสุดไม่เกิน **1,000 บาท/เดือน**
- แสดงยอดส่วนลดที่ได้รับจริง ยอดที่จ่ายจริง และโควตาคงเหลือแบบเรียลไทม์

### 3. 🌳 โครงสร้างหมวดหมู่แบบลำดับขั้น (Hierarchical Tree)
- จัดหมวดหมู่ได้แบบ **ไม่จำกัดระดับชั้น (Unlimited Nesting Depth)** ผ่าน `parent_id`
- ขยาย/ย่อ หมวดหมู่หลักและหมวดย่อยได้ตามต้องการ
- ปรับแต่งสีและไอคอน Lucide ได้ตามใจชอบ
- Breadcrumbs แสดงเส้นทางลำดับขั้น เช่น `อาหาร › อาหารประจำวัน`

### 4. 📊 แดชบอร์ด & รายงานวิเคราะห์การเงิน (4 มุมมอง)
- **ภาพรวม (Overview):** สรุปกระแสเงินสด ยอดประหยัดจากคนละครึ่ง และกราฟแท่งรายรับ-รายจ่าย
- **แนวโน้ม (Trends):** กราฟเส้นแนวโน้มการใช้จ่าย และตารางจัดอันดับสินค้าที่ซื้อบ่อยที่สุด
- **ค่าใช้จ่ายสูงสุด (Top Spending):** แผนภูมิวงแหวน (Donut Chart) และแถบสัดส่วนเปอร์เซ็นต์หมวดหมู่
- **รายงานภาษี (Tax Report):** สรุปเงินเดือน เงินได้สุทธิ และประมาณการภาษีประจำปี

### 5. 🧮 วางแผนและคำนวณภาษีเงินได้บุคคลธรรมดา (PIT 2568 - 2569)
- อิงตามเกณฑ์กรมสรรพากร 8 ขั้นบันไดจริง (0% ถึง 35%)
- **ค่าลดหย่อนมาตรฐาน:** ค่าลดหย่อนส่วนบุคคล 60,000 บาท, ค่าใช้จ่ายเงินเดือน 50% (สูงสุด 100,000 บาท), ประกันสังคม (สูงสุด 9,000 บาท)
- **ค่าลดหย่อนทางเลือก:** Thai ESG (สูงสุด 300,000 บาท), RMF (สูงสุด 500,000 บาท), SSF (สูงสุด 200,000 บาท), ประกันชีวิต/สุขภาพ, ดอกเบี้ยบ้าน, เลี้ยงดูบิดามารดา
- ดึงข้อมูลเงินเดือนจากรายการบันทึกมาคำนวณอัตโนมัติ
- คำนวณอัตราภาษีที่แท้จริง (Effective Tax Rate) และให้คำแนะนำการลดหย่อนเพิ่มเติม

### 6. 💾 รองรับทั้ง Supabase Cloud และโหมดทดลองใช้งานออฟไลน์ (Local Demo Mode)
- เมื่อยังไม่ได้ใส่ Supabase API Keys ระบบจะสลับเข้า **Instant Demo Mode** ให้ใช้งานได้ 100% ทันทีผ่าน `localStorage`
- เมื่อเชื่อมต่อ Supabase ข้อมูลจะซิงก์กับ PostgreSQL คลาวด์พร้อม Row-Level Security (RLS)

### 7. 📤 ส่งออกข้อมูลเป็น CSV (Excel Compatible)
- รองรับ UTF-8 BOM ทำให้เปิดไฟล์ใน Microsoft Excel ภาษาไทยได้ทันที สระและวรรณยุกต์ไม่เพี้ยน
- ส่งออกได้ทั้งประวัติรายการบันทึกและรายงานสรุปภาษี

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** React 19, Vite 6, TypeScript 5.x
- **Styling:** Tailwind CSS 4, Lucide React
- **Routing:** React Router v7 (`HashRouter` สำหรับ GitHub Pages)
- **State Management:** Zustand (พร้อม Middleware Persist)
- **Charts:** Recharts
- **Backend:** Supabase (PostgreSQL 15+, Row-Level Security)
- **CI/CD:** GitHub Actions (Deploy to GitHub Pages)

---

## 📁 โครงสร้างไฟล์ในโปรเจกต์ (File Structure)

```text
NgernMee_Limited/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD สำหรับ GitHub Pages
├── supabase/
│   └── migrations/
│       ├── 001_profiles.sql        # ตารางข้อมูลผู้ใช้และ Trigger
│       ├── 002_categories.sql      # ตารางหมวดหมู่แบบต้นไม้ลำดับขั้น
│       ├── 003_transactions.sql    # ตารางรายการบันทึกพร้อมสิทธิ์คนละครึ่ง
│       ├── 004_tax_configs.sql     # ตารางการตั้งค่าภาษีรายปี
│       ├── 005_rls_policies.sql    # RLS Policies จำกัดสิทธิ์เฉพาะเจ้าของข้อมูล
│       └── 006_seed_default_categories.sql # ข้อมูลตั้งต้นหมวดหมู่ภาษาไทย
├── src/
│   ├── lib/
│   │   ├── constants.ts            # ค่าคงที่ เพดานโควตา และชุดสี
│   │   ├── exportUtils.ts          # ระบบสร้างและดาวน์โหลดไฟล์ CSV
│   │   ├── mockData.ts             # ชุดข้อมูลตัวอย่างภาษาไทย
│   │   ├── supabase.ts             # การเชื่อมต่อ Supabase Client
│   │   ├── thaiChuayThai.ts        # ฟังก์ชันคำนวณโควตาคนละครึ่ง 60/40
│   │   ├── thaiTax.ts              # ฟังก์ชันคำนวณภาษีเงินได้บุคคลธรรมดา
│   │   ├── types.ts                # TypeScript Interfaces ทั้งหมด
│   │   └── utils.ts                # ฟังก์ชันฟอร์แมตเงินบาท และวันที่ไทย
│   ├── components/
│   │   ├── categories/             # CategoryTree, CategoryForm, CategoryPicker
│   │   ├── layout/                 # AppShell, Sidebar, BottomNav, AuthGuard
│   │   ├── tax/                    # BracketVisualizer, DeductionChecklist
│   │   ├── transactions/           # TransactionForm, TransactionList, QuickSelectPanel
│   │   └── ui/                     # Button, Card, Input, Modal, Badge, CategoryIcon
│   ├── hooks/
│   │   ├── useAnalytics.ts         # รวมยอด สถิติ และกระแสเงินสด
│   │   ├── useAuth.ts              # ระบบลงทะเบียนและเข้าสู่ระบบ
│   │   ├── useCategories.ts        # การจัดการต้นไม้หมวดหมู่
│   │   ├── useTaxCalculation.ts    # คำนวณภาษีและดึงเงินเดือน
│   │   ├── useThaiChuayThai.ts     # ติดตามโควตารายวัน/รายเดือน
│   │   └── useTransactions.ts      # กรอง ค้นหา และแบ่งหน้าประวัติ
│   ├── pages/
│   │   ├── CategoriesPage.tsx      # หน้าจัดการหมวดหมู่
│   │   ├── DashboardPage.tsx       # หน้าแดชบอร์ดสรุปผล
│   │   ├── LoginPage.tsx           # หน้าเข้าสู่ระบบ/สมัครสมาชิก
│   │   ├── ReportsPage.tsx         # หน้ารายงาน 4 แท็บ
│   │   ├── SettingsPage.tsx        # หน้าตั้งค่าและส่งออกข้อมูล
│   │   ├── TaxPage.tsx             # หน้าคำนวณและวางแผนภาษี
│   │   └── TransactionsPage.tsx    # หน้าประวัติและบันทึกรายการ
│   ├── stores/
│   │   └── useAppStore.ts          # ศูนย์กลาง State Management (Zustand)
│   ├── App.tsx                     # เส้นทางและ Code Splitting
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Tailwind CSS และชุดสี Tokens
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันในโหมดพัฒนา (Development Mode)
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:5173` — คุณสามารถคลิก **"เข้าทดลองใช้งานทันที (Demo Mode)"** เพื่อทดสอบระบบได้ทันทีโดยไม่ต้องตั้งค่าฐานข้อมูล!

### 3. ตรวจสอบและบิลด์โปรเจกต์ (Production Build)
```bash
npm run build
```
ผลลัพธ์จะถูกสร้างไว้ในโฟลเดอร์ `dist/` โดยไฟล์จะถูกแยก Chunk เพื่อประสิทธิภาพสูงสุด (< 500KB gzipped)

---

## 🗄️ การตั้งค่า Supabase (ทางเลือกเสริมสำหรับโหมด Cloud)

1. สมัครและสร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com)
2. เข้าไปที่เมนู **SQL Editor** ใน Supabase Console
3. รันไฟล์ Migration เรียงตามลำดับจาก `supabase/migrations/`:
   - `001_profiles.sql`
   - `002_categories.sql`
   - `003_transactions.sql`
   - `004_tax_configs.sql`
   - `005_rls_policies.sql`
   - `006_seed_default_categories.sql`
4. ไปที่ **Project Settings > API** คัดลอก `Project URL` และ `anon public API key`
5. สร้างไฟล์ `.env` ในโฟลเดอร์รูทของโปรเจกต์:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
6. รีสตาร์ท `npm run dev` แอปพลิเคชันจะเชื่อมต่อกับ Supabase อัตโนมัติ

---

## 🌐 การนำขึ้น GitHub Pages (Deployment)

1. Push โค้ดทั้งหมดขึ้น GitHub repository ของคุณ
2. ใน GitHub ไปที่แท็บ **Settings > Pages**
3. ภายใต้ **Build and deployment > Source** เลือก **GitHub Actions**
4. หากใช้ Supabase ให้เพิ่ม Secrets ใน **Settings > Secrets and variables > Actions**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. เมื่อ Push ขึ้น branch `main` ระบบ GitHub Actions (`deploy.yml`) จะทำ Build และ Deploy ขึ้น GitHub Pages ให้โดยอัตโนมัติ

---

## 📄 ใบอนุญาต (License)

MIT License © 2026 NgernMee Limited Team
