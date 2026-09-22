# NgernMee Limited — Prototype Design System & Style Guide

> **Version:** 2.0 (Mobile-First 3-Style Fusion & Adaptive Device Architecture)  
> **Source of Truth for:** [`prototype_mobile_first.html`](./prototype_mobile_first.html)  
> **Domain Standards:** Conforms to [`CONTEXT.md`](./CONTEXT.md) and [`PROJECT_RULES.md`](./PROJECT_RULES.md)

---

## 1. Overview & Design Philosophy

เอกสารนี้รวบรวม **Design Tokens, สไตล์, ค่าสี, ฟิสิกส์แอนิเมชัน, Component Recipes และสถาปัตยกรรมการแสดงผล** ทั้งหมดที่ใช้ใน `prototype_mobile_first.html` เพื่อให้การพัฒนาหรือปรับแต่งในครั้งถัดไป ไม่ว่าจะทำในหน้าใดหรือระบบใด สามารถถอดแบบและสร้างสรรค์ต่อได้ตรงตามเอกลักษณ์เดิม 100% โดยไม่ต้องเดาหรือเริ่มใหม่

### 🎯 Core Principles

1. **Mobile Experience (โทรศัพท์):**
   - ผสาน 3 สไตล์ชั้นนำอย่างลงตัว:
     - **03 Neomorphism (นูนต่ำสัมผัสจริง):** พื้นผิวคู่เงา 2 ทิศทาง ให้ความรู้สึกลอยนูนและยุบตัวเมื่อกด
     - **05 Shadows & Depth (มิติและลำดับชั้น):** มี Ambient Glow เรืองแสงนุ่มๆ รอบการ์ดสำคัญ มีการแบ่งชั้นความลึกระหว่าง Canvas, Surface, Sub-card และ Modal
     - **06 Micro-Interactions (ปฏิสัมพันธ์ละเอียดอ่อน):** ทุกการกด สลับแท็บ หรือคำนวณเงิน ตอบสนองด้วยสปริงฟิสิกส์ที่รวดเร็ว ฉับไว ไม่ย้วย และไม่น่ารำคาญ
   - ออกแบบเพื่อการใช้งานด้วยนิ้วโป้งมือเดียว (**Thumb-Zone Friendly**): ปุ่มสำคัญและ Bottom Sheet อยู่ครึ่งล่างของจอ
2. **Desktop & iPad Experience (คอมพิวเตอร์และแท็บเล็ต):**
   - ถอดแบบเลย์เอาต์เดิมของระบบจริง 100% ตาม [`AppShell.tsx`](./src/components/layout/AppShell.tsx) และภาพหน้าจอของระบบจริง
   - **iPad:** มี Top Bar พร้อมปุ่ม Hamburger Menu `☰` สำหรับสไลด์ Drawer Sidebar ออกมา และการ์ดสรุปตัวเลขแบบ 2x2 Grid
   - **Desktop:** มี Fixed Sidebar คงที่ด้านซ้าย (กว้าง 256px / `w-64`) และการ์ดตัวชี้วัดเรียงเต็ม 4 คอลัมน์
3. **Discreet Government Stimulus (สิทธิประโยชน์คนละครึ่ง):**
   - โครงการรัฐช่วย (คนละครึ่ง / ไทยช่วยไทย 60/40) ถูกจัดวางเป็นตัวเลือกย่อยที่แอบซ่อนอย่างเป็นระเบียบ ไม่แย่งสายตา และคำนวณหักยอดให้อัตโนมัติเมื่อเลือกใช้

---

## 2. Color Palette & Theme Tokens

ระบบรองรับ 2 โหมดสีหลักที่ถอดแบบจากระบบจริงอย่างแม่นยำ:

```css
/* ======================================================== */
/* THEME CSS VARIABLES: Day Mode (Light) & Night Mode (Dark)  */
/* ======================================================== */

/* โหมดกลางคืน (Night Mode / Obsidian Charcoal - Default) */
html.dark,
:root {
  --canvas-bg: #0f1115; /* ดำชาร์โคลลึกตามตัวเว็บจริง */
  --card-bg: #16181f; /* พื้นหลังการ์ดของระบบจริง */
  --card-border: #232732; /* ขอบการ์ดมินิมอล */
  --hero-grad-from: #181b24;
  --hero-grad-to: #111319;

  --brand-green: #22c55e; /* สีเขียวหลักสำหรับเน้นผลลัพธ์ */
  --brand-green-hover: #16a34a;
  --accent-primary: #22c55e;
  --accent-primary-text: #4ade80;
  --accent-glow: rgba(34, 197, 94, 0.25);

  --accent-expense: #f43f5e; /* สีแดงกุหลาบสำหรับรายจ่าย */
  --accent-indigo: #818cf8; /* สีม่วงครามสำหรับภาษี 40(2) */
  --accent-blue: #60a5fa; /* สีฟ้าสำหรับสิทธิประโยชน์คนละครึ่ง */

  --badge-bg: rgba(34, 197, 94, 0.12);
  --badge-border: rgba(34, 197, 94, 0.28);
  --badge-text: #4ade80;

  --text-main: #ffffff;
  --text-muted: #9ca3af;
  --sub-card-bg: rgba(0, 0, 0, 0.3);
  --sub-card-border: rgba(255, 255, 255, 0.06);
}

/* โหมดกลางวัน (Day Mode / Warm Sand Paper) */
html:not(.dark) {
  --canvas-bg: #f5f4ef; /* พื้นหลังโทนกระดาษทรายอุ่นนวล สบายตา */
  --card-bg: #ffffff; /* การ์ดสีขาวสะอาด */
  --card-border: #e6e3da; /* เส้นขอบการ์ดสีนวล */
  --hero-grad-from: #ffffff;
  --hero-grad-to: #faf9f6;

  --brand-green: #16a34a; /* สีเขียวเข้มของปุ่ม + บันทึกรายการ */
  --brand-green-hover: #15803d;
  --accent-primary: #16a34a;
  --accent-primary-text: #15803d;
  --accent-glow: rgba(22, 163, 74, 0.18);

  --accent-expense: #dc2626;
  --accent-indigo: #4f46e5;
  --accent-blue: #2563eb;

  --badge-bg: #e8f7ee;
  --badge-border: #bbf0cc;
  --badge-text: #15803d;

  --text-main: #18181b;
  --text-muted: #71717a;
  --sub-card-bg: #f8f7f2;
  --sub-card-border: #e8e5dc;
}
```

---

## 3. Neomorphic & Dual Shadow Formulas (Style 03 & 05)

พื้นผิวนูนต่ำใช้การซ้อนเงาสองขั้ว (เงาสว่างจากมุมบนซ้าย + เงามืดจากมุมล่างขวา) ทำให้การ์ดและปุ่มดูมีมิติเหมือนสัมผัสได้จริง:

```css
/* ======================================================== */
/* NEOMORPHIC SHADOW TOKENS                                 */
/* ======================================================== */

/* โหมดกลางคืน (Night Mode Shadow Formulations) */
html.dark {
  --neo-card-shadow:
    0 10px 25px -4px rgba(0, 0, 0, 0.65), 0 4px 10px -2px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
  --neo-card-hover:
    0 16px 36px -6px rgba(0, 0, 0, 0.8), 0 6px 16px -2px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.12);
  --neo-btn-shadow:
    4px 4px 12px rgba(0, 0, 0, 0.45), -2px -2px 8px rgba(255, 255, 255, 0.03),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.07);
  --neo-btn-pressed:
    inset 2px 2px 6px rgba(0, 0, 0, 0.7), inset -1px -1px 4px rgba(255, 255, 255, 0.03);
  --neo-sunken:
    inset 2px 2px 5px rgba(0, 0, 0, 0.65), inset -1px -1px 3px rgba(255, 255, 255, 0.04);
  --glow-brand: 0 10px 28px -4px rgba(34, 197, 94, 0.35);
  --glow-expense: 0 10px 28px -4px rgba(244, 63, 94, 0.3);
}

/* โหมดกลางวัน (Light Mode Shadow Formulations) */
html:not(.dark) {
  --neo-card-shadow:
    6px 10px 26px -4px rgba(185, 175, 155, 0.3), -6px -6px 20px 0 rgba(255, 255, 255, 0.95),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.8);
  --neo-card-hover:
    10px 16px 36px -4px rgba(185, 175, 155, 0.42), -8px -8px 24px 0 rgba(255, 255, 255, 1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.9);
  --neo-btn-shadow:
    4px 5px 14px rgba(185, 175, 155, 0.28), -4px -4px 12px rgba(255, 255, 255, 0.95),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.9);
  --neo-btn-pressed:
    inset 2px 3px 6px rgba(185, 175, 155, 0.35), inset -2px -2px 5px rgba(255, 255, 255, 0.9);
  --neo-sunken:
    inset 2px 3px 6px rgba(185, 175, 155, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.9);
  --glow-brand: 0 10px 28px -4px rgba(22, 163, 74, 0.25);
  --glow-expense: 0 10px 28px -4px rgba(220, 38, 38, 0.2);
}

/* Utility Classes สำหรับนำไปใช้ */
.neo-card {
  box-shadow: var(--neo-card-shadow);
  transition:
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.neo-card:hover {
  box-shadow: var(--neo-card-hover);
}
.neo-btn {
  box-shadow: var(--neo-btn-shadow);
  transition:
    transform 0.14s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.14s cubic-bezier(0.16, 1, 0.3, 1);
  touch-action: manipulation;
}
.neo-btn:active {
  box-shadow: var(--neo-btn-pressed);
  transform: scale(0.97);
}
.neo-sunken {
  box-shadow: var(--neo-sunken);
}
.glow-brand {
  box-shadow: var(--glow-brand);
}
```

---

## 4. Typography & Tabular Numerals

- **ตัวอักษรภาษาไทย:** `Prompt` (Google Font) เพื่อความคมชัด อ่านง่าย ทันสมัย
- **ตัวเลขทางการเงิน:** `Inter` พร้อมเปิดใช้งาน **Tabular Figures** เพื่อให้ตัวเลขในตารางและตัวชี้วัดเรียงตรงกันอย่างแม่นยำ ไม่กระตุกเวลาค่าเปลี่ยน

```css
/* Tabular Numerals for Financial Data */
.num-tabular {
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
  font-family: 'Inter', sans-serif;
}
```

---

## 5. Micro-Interactions & Physics (Style 06)

หัวใจสำคัญของการทำให้แอปดูไม่เป็น AI และดูน่าใช้ คือ **แอนิเมชันที่สั้น ฉับไว (ไม่เกิน 240ms) และมีแรงต้านทางกายภาพ**:

```css
/* 1. สัมผัสปุ่มนุ่มนวล มีแรงต้าน (Tactile Spring Tap) */
.smooth-tap {
  transition:
    transform 0.16s cubic-bezier(0.2, 0.8, 0.4, 1),
    opacity 0.16s ease,
    box-shadow 0.16s ease;
  touch-action: manipulation;
}
.smooth-tap:active {
  transform: scale(0.96);
}

/* 2. การเปิดมุมมองใหม่อย่างนุ่มนวล (View Entrance Animation) */
@keyframes viewFadeSlide {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-view {
  animation: viewFadeSlide 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* 3. การเด้งของตัวเลขเมื่อมีการอัปเดต (Number Counter Pulse) */
@keyframes numPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
  }
  100% {
    transform: scale(1);
  }
}
.pulse-num {
  animation: numPulse 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 4. รางเลื่อนแคปซูลสำหรับแท็บ (Sliding Pill Indicator) */
.tab-slider-track {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  border-radius: 16px;
  user-select: none;
}
.tab-slider-thumb {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  border-radius: 12px;
  transition:
    transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.2s ease,
    box-shadow 0.2s ease;
  z-index: 1;
}
```

---

## 6. Component Recipes (ชิ้นส่วนพร้อมใช้งาน)

### A. Hero / Balance Card (การ์ดยอดเงินคงเหลือ)

```html
<div
  class="rounded-3xl p-5 theme-hero text-slate-900 dark:text-white neo-card glow-brand relative overflow-hidden border border-slate-200/80 dark:border-white/[0.08]"
>
  <!-- แสงฟุ้งกระจายด้านหลัง (Atmospheric Ambient Glow) -->
  <div
    class="absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
    style="background: var(--brand-green);"
  ></div>

  <div class="flex items-start justify-between relative z-10">
    <div>
      <span
        class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
      >
        <span>เงินสดคงเหลือสุทธิ</span>
        <button
          onclick="toggleBalanceVisibility()"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <i data-lucide="eye" class="w-3.5 h-3.5"></i>
        </button>
      </span>
      <div class="mt-1 flex items-baseline gap-1">
        <span class="text-sm font-light text-slate-500 dark:text-slate-400">฿</span>
        <span
          class="text-3xl sm:text-4xl font-extrabold tracking-tight num-tabular text-slate-900 dark:text-white"
          >48,250.00</span
        >
      </div>
    </div>

    <!-- Runway Badge -->
    <div class="text-right">
      <span
        class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full theme-badge border"
      >
        <i data-lucide="shield-check" class="w-3 h-3"></i>
        <span>อยู่ได้ 4.8 เดือน</span>
      </span>
      <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono font-medium">
        สำรอง 144 วัน
      </p>
    </div>
  </div>
</div>
```

---

### B. Sliding Segmented Tab (สลับรายจ่าย / รายรับ)

```html
<div
  class="tab-slider-track bg-slate-100 dark:bg-black/50 rounded-2xl text-xs font-semibold border border-slate-200/80 dark:border-white/[0.06] relative"
>
  <!-- Capsule Thumb ที่เลื่อนไปมา -->
  <div
    id="tab-slider-indicator"
    class="tab-slider-thumb bg-white dark:bg-white/10 shadow-sm border border-slate-200/60 dark:border-white/10"
    style="transform: translateX(0%);"
  ></div>

  <button
    type="button"
    onclick="setSheetType('expense')"
    class="smooth-tap py-2.5 rounded-xl z-10 flex items-center justify-center gap-1.5 font-bold theme-expense-text"
  >
    <i data-lucide="arrow-down-right" class="w-3.5 h-3.5"></i>
    <span>รายจ่าย (Expense)</span>
  </button>
  <button
    type="button"
    onclick="setSheetType('income')"
    class="smooth-tap py-2.5 rounded-xl z-10 flex items-center justify-center gap-1.5 font-medium text-slate-400"
  >
    <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
    <span>รายรับ (Income)</span>
  </button>
</div>
```

---

### C. Floating Bottom Navigation Bar พร้อมปุ่มบวกหมุน 45°

```html
<div
  class="fixed sm:absolute bottom-0 left-0 right-0 z-40 theme-canvas bg-opacity-95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.08] px-4 py-2 flex items-center justify-around shadow-modern-nav"
>
  <button
    onclick="switchAppTab('home')"
    class="smooth-tap flex flex-col items-center py-1 theme-accent-text font-bold scale-105"
  >
    <i data-lucide="layout-grid" class="w-5 h-5"></i>
    <span class="text-[10px] mt-0.5">ภาพรวม</span>
  </button>
  <button
    onclick="switchAppTab('ledger')"
    class="smooth-tap flex flex-col items-center py-1 text-slate-400"
  >
    <i data-lucide="receipt" class="w-5 h-5"></i>
    <span class="text-[10px] mt-0.5 font-medium">สมุดบัญชี</span>
  </button>

  <!-- Tactile FAB Plus Button (หมุน 45° เป็น 'x' เมื่อเปิด Sheet) -->
  <button
    onclick="handleCtaPlusClick()"
    id="cta-plus-btn"
    class="neo-btn smooth-tap -mt-5 w-12 h-12 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-black flex items-center justify-center glow-brand shadow-lg border border-white/20"
  >
    <i
      data-lucide="plus"
      id="cta-plus-icon"
      class="w-6 h-6 stroke-[3] transition-transform duration-200"
    ></i>
  </button>

  <button
    onclick="openTaxModal()"
    class="smooth-tap flex flex-col items-center py-1 text-slate-400"
  >
    <i data-lucide="calculator" class="w-5 h-5"></i>
    <span class="text-[10px] mt-0.5 font-medium">ภาษี</span>
  </button>
  <button
    onclick="switchAppTab('reports')"
    class="smooth-tap flex flex-col items-center py-1 text-slate-400"
  >
    <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
    <span class="text-[10px] mt-0.5 font-medium">รายงาน</span>
  </button>
</div>
```

---

### D. Tucked-Away Co-Pay & WHT Options (ซ่อนตัวเลือกคนละครึ่ง)

```html
<!-- ปุ่มคลี่เปิดตัวเลือกเพิ่มเติม -->
<button
  type="button"
  onclick="toggleAdvancedOptions()"
  class="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-between w-full py-1.5 px-1 font-medium"
>
  <span class="flex items-center gap-1.5">
    <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5"></i>
    <span>ตัวเลือกเพิ่มเติม (สิทธิ์คนละครึ่ง / หักภาษี ณ ที่จ่าย)</span>
  </span>
  <i
    data-lucide="chevron-down"
    id="adv-chevron"
    class="w-3.5 h-3.5 transition-transform duration-200"
  ></i>
</button>

<!-- กล่องตัวเลือกที่ซ่อนอยู่ -->
<div
  id="advanced-options"
  class="hidden mt-1.5 p-3 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/[0.08] space-y-2.5"
>
  <label class="flex items-center justify-between cursor-pointer">
    <div>
      <span class="text-xs font-medium text-slate-800 dark:text-slate-300 block"
        >ใช้สิทธิ์คนละครึ่ง / ไทยช่วยไทย (60/40)</span
      >
      <span class="text-[10px] text-slate-500">รัฐช่วย 60% สูงสุด ฿200/วัน</span>
    </div>
    <input
      type="checkbox"
      id="copay-checkbox"
      class="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
    />
  </label>
  <label
    class="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200/80 dark:border-white/[0.06]"
  >
    <div>
      <span class="text-xs font-medium text-slate-800 dark:text-slate-300 block"
        >หักภาษี ณ ที่จ่าย 3% (ภ.ง.ด.91)</span
      >
      <span class="text-[10px] text-slate-500">สำหรับเงินได้ฟรีแลนซ์/รับจ้าง ม.40(2)</span>
    </div>
    <input
      type="checkbox"
      id="wht-checkbox"
      class="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
    />
  </label>
</div>
```

---

## 7. Device Responsiveness & Layout Matrix

| Breakpoint       | Target Device           | Layout Shell                            | Sidebar Behavior                                    | Metrics Layout                 |
| :--------------- | :---------------------- | :-------------------------------------- | :-------------------------------------------------- | :----------------------------- |
| `< 768px`        | **Smartphone (มือถือ)** | **Mobile-First Prototype (ดีไซน์ใหม่)** | ไม่มี Sidebar ใช้ Bottom Navigation Bar             | Single-column cards & Carousel |
| `768px – 1023px` | **iPad / Tablet**       | **Original Web App Shell**              | Slide-out Drawer Sidebar (`w-72`) เปิดด้วยปุ่ม `☰` | 2x2 Grid Columns               |
| `≥ 1024px`       | **Desktop (จอคอม)**     | **Original Web App Shell**              | Fixed Left Sidebar (`w-64`) คงที่ด้านซ้ายตลอดเวลา   | 4 Grid Columns                 |

---

## 8. Domain Terms Compliance Checklist ([`CONTEXT.md`](./CONTEXT.md))

เมื่อสร้างหรือแก้ไขหน้าจอใหม่ ให้ใช้คำศัพท์โดเมนตามมาตรฐานดังนี้:

| หมวดหมู่             | คำที่ถูกต้อง (Preferred)                               | คำที่ต้องหลีกเลี่ยง (Avoid)      |
| :------------------- | :----------------------------------------------------- | :------------------------------- |
| **การเงินพื้นฐาน**   | **Transaction** (รายการบันทึก)                         | Entry, Record, Item, Log         |
| **ประวัติรายการ**    | **Ledger** (สมุดบัญชี / ทะเบียนรายการ)                 | History, Journal, Statement      |
| **หมวดหมู่**         | **Category** (หมวดหมู่)                                | Tag, Folder, Label, Bucket       |
| **เงินอุดหนุนรัฐ**   | **Co-Pay Quota (Thai Chuay Thai)**                     | Discount, Welfare Credit, Coupon |
| **ประเภทเงินได้**    | **Section 40 Income** (เงินได้ ม.40(1), 40(2))         | Earnings, Salary Type, Wage      |
| **การประเมินภาษี**   | **Tax Assessment** (การประเมินภาษี ภ.ง.ด.91)           | Tax calculation, Tax summary     |
| **สภาพคล่อง**        | **Cashflow Runway** (ระยะเวลาปลอดภัยทางการเงิน)        | Burn time, Survival days         |
| **ค่าใช้จ่ายจำเป็น** | **Essential Baseline Expense** (ค่าใช้จ่ายจำเป็นคงที่) | Fixed cost, Mandatory spending   |

---

## 9. Next Iteration Guidelines (แนวทางต่อยอด)

1. **ห้ามแตะต้องไฟล์ใน `src/`:** การปรับแต่ง Prototype ใดๆ ต้องทำในไฟล์อิสระ เช่น `prototype_mobile_first.html` จนกว่าผู้ใช้จะระบุให้แปลงเป็น Production Code
2. **รักษาความสมูทของแอนิเมชัน:** ห้ามใส่แอนิเมชันที่ช้าเกิน 250ms และให้ใช้ `cubic-bezier(0.34, 1.56, 0.64, 1)` หรือ `cubic-bezier(0.16, 1, 0.3, 1)` เสมอ
3. **ตรวจสอบทั้ง Day และ Night Mode:** เมื่อเพิ่ม Component ใหม่ ต้องแน่ใจว่าอ่านชัดเจนทั้งในโหมด Warm Sand Paper (`#f5f4ef`) และโหมด Obsidian Charcoal (`#0f1115`)
4. **ความสอดคล้องระหว่าง Mobile และ Desktop:** ให้แน่ใจว่า State ตัวเลข (ยอดเงิน, รายการ, โควตาคนละครึ่ง) ทำงานเชื่อมโยงกัน เมื่อบันทึกจากอุปกรณ์ใด อีกอุปกรณ์จะอัปเดตตัวเลขตรงกันทันที
