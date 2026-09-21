# NgernMee Limited &mdash; Architecture Improvement Plan

> **Living Roadmap & Execution Checkpoints**  
> เอกสารนี้ใช้บันทึกขั้นตอนการปรับปรุงสถาปัตยกรรม (Architecture Deepening) ของโปรเจกต์ NgernMee Limited  
> โดยทำทีละขั้นตอน (Step-by-Step) และบันทึกผลการตรวจสอบเป็น Checkpoint อย่างต่อเนื่อง เพื่อรักษา Context ของระบบ

---

## 🎯 วัตถุประสงค์หลัก

1. เปลี่ยน Shallow Modules ให้เป็น **Deep Modules** (Interface กะทัดรัดแต่ซ่อน Implementation ที่ซับซ้อนไว้ภายใน)
2. วาง **Seams** และ **Adapters** สำหรับ Data Persistence (Supabase vs LocalStorage) เพื่อให้โค้ดทดสอบได้แบบ Zero-Mock
3. ติดตั้ง **Test Harness** (Vitest) และ **Boundary Guardrails** (dependency-cruiser) ป้องกันโค้ดรั่วไหลข้ามโมดูล
4. รวบรวม Financial Intelligence และ Thai Tax Classification ไม่ให้คำนวณซ้ำซ้อน

---

## 📋 แผนการดำเนินงานและ Checkpoints

### [x] Phase 0: Domain Modeling & ADR Baseline

- [x] **Step 0.1**: สร้าง [`CONTEXT.md`](CONTEXT.md) กำหนดคำศัพท์โดเมนร่วม (Ubiquitous Language) เช่น _Ledger, Co-Pay Quota (60/40), Section 40 Tax Classification, Cashflow Runway, Storage Seam_
- [x] **Step 0.2**: สร้าง `docs/adr/0001-deep-modules-and-storage-seam.md` บันทึกการตัดสินใจแยก Data Persistence ออกจาก Application State Store
- 🏁 **Checkpoint 0**: ผ่านเรียบร้อย (บันทึกคำศัพท์โดเมนใน `CONTEXT.md` และสร้าง ADR-0001 สำหรับ Storage Seam)

---

### [x] Phase 1: Test Harness & Boundary Guardrails (`tdd` + `setup-ts-deep-modules`)

- [x] **Step 1.1**: ติดตั้ง `vitest`, `@testing-library/react` และสร้าง `vitest.config.ts` เพื่อให้โปรเจกต์มีระบบรัน Test ครั้งแรก
- [x] **Step 1.2**: เพิ่มคำสั่ง `"test": "vitest run"` ใน `package.json` และเขียน smoke test ชุดแรกเพื่อยืนยันว่า test harness ทำงานได้
- [x] **Step 1.3**: ติดตั้ง `dependency-cruiser` และสร้างไฟล์คอนฟิก `.dependency-cruiser.cjs` สำหรับควบคุมขอบเขตโมดูล
- [x] **Step 1.4**: เพิ่มสคริปต์ `"lint:boundaries": "depcruise src"` เพื่อบล็อกการ import เข้า subfolder ภายในโมดูลอื่น และพิสูจน์แล้วว่า boundary rule ดักจับ deep imports ได้จริง
- 🏁 **Checkpoint 1**: ผ่านเรียบร้อย (`npm test`, `npm run lint:boundaries`, และ `npm run build` สำเร็จ 100%)

---

### [x] Phase 2: Candidate 1 &mdash; Storage Seam & Adapters (`codebase-design`)

- [x] **Step 2.1**: ออกแบบ Storage Interface ที่ Seam ใน `src/packages/storage/lib/types.ts` และ factory ใน `index.ts`
- [x] **Step 2.2**: เขียน Unit Tests ด้วย TDD สำหรับ Storage Seam ใน `src/packages/storage/tests/storage.test.ts`
- [x] **Step 2.3**: พัฒนา `LocalStorageAdapter` (สำหรับ Demo mode / Tests) และ `SupabaseStorageAdapter` (สำหรับ Cloud sync)
- [x] **Step 2.4**: Refactor [`src/stores/useAppStore.ts`](src/stores/useAppStore.ts) ให้เรียกใช้งานผ่าน Storage Seam แทนการยิง Supabase โดยตรง (ลดโค้ด boilerplate กว่า 110 บรรทัด และขจัด try/catch Supabase กระจายใน mutation)
- 🏁 **Checkpoint 2**: ผ่านเรียบร้อย (Unit Tests 8/8 ผ่าน, `depcruise src` ผ่าน, `vite build` สำเร็จ 100%)

---

### [x] Phase 3: Candidate 2 &mdash; Financial Intelligence Deep Module

- [x] **Step 3.1**: เขียน Unit Tests สำหรับการสรุปรายรับ-รายจ่าย รายวัน รายเดือน และ Cashflow Runway ใน `src/packages/financial-intelligence/tests/`
- [x] **Step 3.2**: สกัดและสร้าง Deep Module `src/packages/financial-intelligence/` ที่มี Interface เรียบง่าย (`calculateDashboardStats`, `calculatePeriodSummary`, `calculateDailyTrend`, `calculateCategorySpending`, `calculateCashflowRunway`, `analyzeIncomeStreams`)
- [x] **Step 3.3**: ปรับหน้า [`DashboardPage.tsx`](src/pages/DashboardPage.tsx) และ Hook [`useAnalytics.ts`](src/hooks/useAnalytics.ts) ให้ใช้โมดูลเดียวกัน ตัดการคำนวณ `reduce/filter` ซ้ำซ้อนและแก้อาการ re-render จาก `new Date()` dependencies
- 🏁 **Checkpoint 3**: ผ่านเรียบร้อย (Unit Tests 12/12 ผ่าน, `depcruise src` ผ่าน, `vite build` สำเร็จ 100%)

---

### [x] Phase 4: Candidate 3 &mdash; Thai Tax & Section 40 Engine

- [x] **Step 4.1**: รวบรวม Rule-based Heuristics (คัดแยกมาตรา 40(1), 40(2), เงินได้ยกเว้นภาษี เช่น ค่าขนมพ่อแม่) เข้าสู่ Tax Classifier Module
- [x] **Step 4.2**: เขียน Tests ตรวจสอบความถูกต้องของการคำนวณภาษีและสิทธิลดหย่อนตามข้อกำหนดกรมสรรพากร
- [x] **Step 4.3**: ตัด logic คัดแยกข้อความที่ซ้ำกันใน `useTaxCalculation.ts`, `useAppStore.ts`, และ `DeductionChecklist.tsx` หันมาเรียกใช้ `src/packages/tax-engine`
- 🏁 **Checkpoint 4**: ผ่านเรียบร้อย (Unit Tests 15/15 ผ่าน, `depcruise src` 80 modules / 220 dependencies 0 violations, `vite build` สำเร็จ 100%)

---

### [x] Phase 5: Candidate 4 &mdash; Transaction Entry & Quota Drafting

- [x] **Step 5.1**: สร้าง `TransactionDraft` Module ที่ผสาน Zod Schema ตรวจสอบความถูกต้องและคำนวณโควตาคนละครึ่ง 60/40 และหัก ณ ที่จ่าย 3% อัตโนมัติ (`src/packages/transaction-draft`)
- [x] **Step 5.2**: ลดความซับซ้อนของ [`TransactionForm.tsx`](src/components/transactions/TransactionForm.tsx) จาก 574 บรรทัดให้เหลือเฉพาะ UI Presentation และเชื่อมต่อ Smart Meta Suggestions
- 🏁 **Checkpoint 5**: ผ่านเรียบร้อย (Unit Tests 24/24 ผ่าน, `depcruise src` 86 modules / 226 dependencies 0 violations, `vite build` สำเร็จ 100%)

---

### [x] Phase 6: Quality Gates & Pre-commit Hooks (`code-review` + `setup-pre-commit`)

- [x] **Step 6.1**: ติดตั้งและคอนฟิก Husky + lint-staged ตรวจสอบ typecheck, boundary lint, และ tests ก่อน commit (`.husky/pre-commit`, `.lintstagedrc`, `.prettierrc`)
- [x] **Step 6.2**: ทำ Architectural Review ยืนยันความสะอาด ความลึกของโมดูล (Module Depth) และ Locality
- 🏁 **Checkpoint 6**: ผ่านเรียบร้อย (ระบบมี Safety Net ครบถ้วน ไม่สามารถ commit โค้ดที่ละเมิด Seam หรือทำ test fail ได้อีกต่อไป)

---

## 📝 บันทึกประวัติ Checkpoints

- **Checkpoint 0 (Domain Modeling)**: กำหนดคำศัพท์โดเมนใน `CONTEXT.md` และบันทึก ADR-0001
- **Checkpoint 1 (Test & Boundary Harness)**: Vitest และ dependency-cruiser พร้อมทำงาน
- **Checkpoint 2 (Storage Seam)**: แยก Data Persistence ออกจาก Store ด้วย LocalStorage & Supabase adapters
- **Checkpoint 3 (Financial Intelligence)**: รวมการคำนวณสถิติและ Cashflow Runway ใน `src/packages/financial-intelligence`
- **Checkpoint 4 (Thai Tax & Section 40 Engine)**: ย้ายการจัดหมวดหมู่ภาษีมาตรา 40 และการคำนวณภาษีอัตราก้าวหน้าเข้าสู่ `src/packages/tax-engine` ลดความซ้ำซ้อนใน Store และ Hook ทั้งหมด
- **Checkpoint 5 (Transaction Draft & Quota)**: แยก Validation & Drafting ออกจาก `TransactionForm.tsx` มาเป็น `src/packages/transaction-draft` พร้อม 9 Unit Tests
- **Checkpoint 6 (Quality Gates & Guardrails)**: ติดตั้ง Husky v9, lint-staged, Prettier, พร้อม boundary check, typecheck และ vitest pre-commit gate ป้องกัน regression 100%
