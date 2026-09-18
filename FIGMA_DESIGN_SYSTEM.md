# NgernMee Limited (เงินมี จำกัด) — Figma Design System & UX/UI Blueprint

> **Version:** 2.0.0 (Minimalist Financial Architecture)  
> **Target Platforms:** Responsive Web (Desktop 1440px, Tablet 768px, Mobile 390px)  
> **Aesthetic Archetype:** Modern Minimalist Fintech (Quiet Luxury / Calm Financial Dashboard)  
> **Key References:** Linear, Apple Wallet, Wise, Stripe Dashboard  
> **Design Philosophy:** Eliminates decorative gradients, harsh saturated drop shadows, and visual noise. Elevates data legibility through strict 8pt rhythm, generous whitespace, 1px subtle structural borders, and purposeful semantic color coding.

---

## 1. Design System Foundations & Tokens

### 1.1 Color Tokens & Semantic Roles

Colors are organized into functional roles to prevent arbitrary palette bloat. In Figma, define these as **Local Variables** (Color) with Light and Dark Mode modes.

#### A. Brand & Primary (Forest Emerald)
Represents financial health, balance growth, and core system accents without aggressive neon highlights.
| Token Name | Light Value | Dark Value | CSS / Tailwind | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `color/primary/default` | `#059669` (Emerald 600) | `#10b981` (Emerald 500) | `bg-emerald-600` | Primary buttons, active indicators, positive emphasis |
| `color/primary/hover` | `#047857` (Emerald 700) | `#059669` (Emerald 600) | `hover:bg-emerald-700` | Primary interactive hover states |
| `color/primary/active` | `#065f46` (Emerald 800) | `#047857` (Emerald 700) | `active:bg-emerald-800` | Clicked / pressed state |
| `color/primary/subtle` | `#ecfdf5` (Emerald 50) | `#064e3b` (Emerald 900/40) | `bg-emerald-50 dark:bg-emerald-950/40` | Badges, highlighted card tint, positive chips |
| `color/primary/border` | `#a7f3d0` (Emerald 200) | `#065f46` (Emerald 800) | `border-emerald-200 dark:border-emerald-800` | Micro-borders for active cards or badges |

#### B. Neutrals & Canvas Surfaces (Slate Scale)
Provides high readability with a warm cool-gray slate tone, avoiding pure `#000000` pitch black or stark `#ffffff` on high contrast.
| Token Name | Light Value | Dark Value | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `color/bg/canvas` | `#f8fafc` (Slate 50) | `#020617` (Slate 950) | `bg-slate-50 dark:bg-slate-950` | App-level viewport background |
| `color/bg/surface` | `#ffffff` (White) | `#0f172a` (Slate 900) | `bg-white dark:bg-slate-900` | Main cards, modals, sidebar container |
| `color/bg/surface-hover`| `#f1f5f9` (Slate 100) | `#1e293b` (Slate 800) | `hover:bg-slate-50 dark:hover:bg-slate-850`| Table rows, dropdown items, ghost buttons |
| `color/bg/subtle` | `#f1f5f9` (Slate 100) | `#1e293b` (Slate 800) | `bg-slate-100 dark:bg-slate-800` | Input backgrounds, segment tab tracks |
| `color/text/primary` | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | `text-slate-900 dark:text-white` | Headings, primary numbers, strong titles |
| `color/text/secondary` | `#475569` (Slate 600) | `#94a3b8` (Slate 400) | `text-slate-600 dark:text-slate-400` | Subtitles, labels, navigation items |
| `color/text/muted` | `#64748b` (Slate 500) | `#64748b` (Slate 500) | `text-slate-500 dark:text-slate-400` | Captions, dates, unit suffixes |
| `color/border/subtle` | `#f1f5f9` (Slate 100) | `#1e293b` (Slate 800) | `border-slate-100 dark:border-slate-800` | Soft dividers inside cards |
| `color/border/default` | `#e2e8f0` (Slate 200/80) | `#1e293b` (Slate 800/90)| `border-slate-200/80 dark:border-slate-800`| Standard card borders, input borders |
| `color/border/strong` | `#cbd5e1` (Slate 300) | `#334155` (Slate 700) | `border-slate-300 dark:border-slate-700` | Input hover border, modal borders |

#### C. Semantic Accents & Status
| Token Name | Light HEX | Background Tint | Border Tint | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `color/semantic/income` | `#059669` (Emerald 600) | `#ecfdf5` (Emerald 50) | `#a7f3d0` (Emerald 200) | Positive cashflow (+฿), salary, interest |
| `color/semantic/expense`| `#e11d48` (Rose 600) | `#fff1f2` (Rose 50) | `#fecdd3` (Rose 200) | Outgoing cashflow (-฿), delete buttons |
| `color/semantic/quota` | `#2563eb` (Blue 600) | `#eff6ff` (Blue 50) | `#bfdbfe` (Blue 200) | **Thai Chuay Thai 60/40 Co-pay**, tax deductible tags |
| `color/semantic/warning`| `#d97706` (Amber 600) | `#fffbeb` (Amber 50) | `#fde68a` (Amber 200) | Quota limits (>80%), pending tax actions |
| `color/semantic/neutral`| `#475569` (Slate 600) | `#f1f5f9` (Slate 100) | `#e2e8f0` (Slate 200) | General categories, metadata tags |

---

### 1.2 Typography Hierarchy (Inter + Prompt)

For Figma, set the primary English/Numerals font to **Inter** and Thai script to **Prompt** (or modern Thai system fallback such as **Thonburi** or **Sukhumvit Set**).  
*Rule:* All financial currencies and numerical figures must use **Tabular Numbers** (`font-variant-numeric: tabular-nums` or `font-mono`) to ensure perfect vertical alignment across columns.

| Figma Text Style | Font Size | Line Height | Weight | Letter Spacing | Desktop Usage | Mobile Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Display/Bold` | `32px` (2rem) | `40px` (1.25) | Bold (700) | `-0.025em` | Total Balance, Tax Summary Headline | Not used |
| `Heading/1` | `24px` (1.5rem) | `32px` (1.33) | SemiBold (600) | `-0.02em` | Page Titles, Card Hero Metrics | Mobile Screen Title, Net Worth |
| `Heading/2` | `18px` (1.125rem)| `26px` (1.44) | SemiBold (600) | `-0.015em` | Section Titles, Modal Headers | Modal Headers, Section Titles |
| `Heading/3` | `15px` (0.9375rem)| `22px` (1.46) | Medium (500) | `-0.01em` | Subsection Headers, Card Subtitles | Card Titles |
| `Body/Large` | `16px` (1rem) | `24px` (1.5) | Regular (400) | `0` | Form Input Values, Primary Body | Primary Body Text |
| `Body/Medium` | `14px` (0.875rem)| `20px` (1.43) | Regular (400) | `0` | Transaction List Names, Table Cells | Transaction List Titles |
| `Body/Medium-Semi`| `14px` (0.875rem)| `20px` (1.43) | SemiBold (600) | `0` | Button Labels, Active Tab Names | Button Labels |
| `Caption/Regular`| `12px` (0.75rem) | `16px` (1.33) | Regular (400) | `0` | Timestamps, Secondary Metadata | Timestamps, Secondary Labels |
| `Caption/Medium` | `12px` (0.75rem) | `16px` (1.33) | Medium (500) | `0` | Badges, Form Labels, Table Header | Badges, Filter Pills |
| `Micro/Caps` | `11px` (0.6875rem)| `14px` (1.27) | SemiBold (600) | `+0.05em` | Stat Card Eyebrows, Date Headers | Eyebrows |

---

### 1.3 Spacing, Grid & Layout Containers

NgernMee Limited adheres to an **8-point Spatial Rhythm** (with 4px half-steps for micro-alignments).

#### A. Spacing Scale (Figma Spacing Variables)
- `space-1` (4px): Tight badge insets, icon-to-text micro gap.
- `space-2` (8px): Button internal gap, compact list padding, chip gaps.
- `space-3` (12px): Standard form field vertical gap, small card header padding.
- `space-4` (16px): Content list spacing, input field padding (`px-3.5 py-2.5`).
- `space-5` (20px): Mobile card interior padding (`p-5`).
- `space-6` (24px): Desktop card interior padding (`p-6`), section headers gap.
- `space-8` (32px): Inter-module page vertical gaps.
- `space-12` (48px): Major layout section breaks.

#### B. Responsive Breakpoints & Figma Artboards
1. **Desktop Artboard:** `1440 x 1024 px`
   - Content max-width: `1280px` (`max-w-7xl`) centered with `px-6` margin.
   - Sidebar: Fixed `256px` (`w-64`) left drawer.
   - Main content canvas: Fluid Auto-Layout (`Fill container`).
2. **Tablet Artboard:** `768 x 1024 px`
   - Sidebar: Compact icon bar `72px` (`w-18`) or collapsible sheet.
   - 2-column grid for summary metric cards.
3. **Mobile Artboard:** `390 x 844 px` (iPhone 14 / 15 / 16 standard)
   - Layout: Single column Auto-Layout with `px-4 py-4`.
   - Top Bar: `h-14` (56px) with Sticky blur (`backdrop-blur-md`).
   - Bottom Nav: `h-16` (64px) fixed floating bar with safe-area padding.

---

### 1.4 Corner Radii & Elevation / Shadows

To deliver an elegant, tactile feel without outdated blur halos, shadows are dialed down to razor-sharp, whisper-thin ambient diffusions.

#### Corner Radii (Figma Corner Smoothing 60% iOS style)
- `radius-sm` (6px): In-table action buttons, micro tags.
- `radius-md` (8px): Filter chips, segment switcher pills, input fields.
- `radius-lg` (12px): Metric cards, modal action buttons, transaction icon avatars.
- `radius-xl` (16px): Main dashboard & page containers (`rounded-2xl`).
- `radius-2xl` (24px): Floating bottom action sheets, dialog modals.
- `radius-full` (9999px): Status pills, avatar circles, circular icon buttons.

#### Elevation & Shadows
- **Level 0 (Flat):** `none` — Default for cards, standard inputs (rely on `1px border-slate-200/80`).
- **Level 1 (Subtle / Card Rest):** `0 1px 2px 0 rgba(15, 23, 42, 0.04)` (`shadow-xs` / `shadow-2xs`).
- **Level 2 (Hover / Active Float):** `0 4px 12px -2px rgba(15, 23, 42, 0.06)` (Soft card hover).
- **Level 3 (Dropdown / Popover):** `0 10px 20px -3px rgba(15, 23, 42, 0.08)` (Dropdown menus, calendar pickers).
- **Level 4 (Modal Dialog):** `0 20px 30px -6px rgba(15, 23, 42, 0.12)` + backdrop blur `12px`.

---

## 2. Core UI Component Specifications

In Figma, build each of these components as a **Master Component** with **Auto-Layout**, **Component Properties** (Boolean, Instance Swap, Text), and **Variant Matrices**.

### 2.1 Buttons (`Button`)
All buttons feature a micro-scale tactile press effect (`active:scale-[0.98]`).

| Variant | Figma Fill | Figma Border | Figma Text Color | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `Primary` | `color/primary/default` (`#059669`) | None | `#ffffff` | Primary screen action (e.g., "บันทึกรายการ", "เพิ่มธุรกรรม") |
| `Secondary` | `color/bg/subtle` (`#f1f5f9`) | `border-slate-200/70` | `color/text/primary` (`#0f172a`) | Alternate options, secondary actions |
| `Outline` | Transparent | `color/border/default` (`#e2e8f0`)| `color/text/secondary` (`#334155`) | Filter actions, date range triggers, export triggers |
| `Ghost` | Transparent | None | `color/text/secondary` (`#475569`) | Icon-only buttons, row action toggles |
| `Danger` | `#e11d48` (Rose 600) | None | `#ffffff` | Destructive confirmations (e.g., "ลบรายการ") |

#### Size Variants:
- **Small (`sm`):** Height `32px`, Padding `px-3 py-1`, Font `12px Medium`, Gap `6px`, Radius `8px`.
- **Medium (`md` - Default):** Height `40px`, Padding `px-4 py-2`, Font `14px Medium`, Gap `8px`, Radius `10px`.
- **Large (`lg`):** Height `48px`, Padding `px-6 py-2.5`, Font `16px SemiBold`, Gap `10px`, Radius `12px`.

---

### 2.2 Segmented Control (`Tabs / Pill Switcher`)
Used for high-frequency binary/ternary toggles (e.g., **Expense** vs **Income** in the transaction form).

```
+-------------------------------------------------------------------+
|  [  - รายจ่าย (Expense)  ]       |        + รายรับ (Income)        |
+-------------------------------------------------------------------+
```

- **Container Frame:** Auto-layout Horizontal, Padding `3px`, Height `44px`, Fill `#f1f5f9` (`slate-100` / `slate-800`), Radius `12px`.
- **Inactive Item:** Auto-layout Fill, Height `100%`, Text `#64748b` (`slate-500`), Font `14px Medium`.
- **Active Item (Selected):** Auto-layout Fill, Height `100%`, Radius `9px`, Fill `#ffffff` (`dark:bg-slate-700`), Shadow Level 1 (`0 1px 3px rgba(0,0,0,0.06)`).
  - If Expense selected: Text `#e11d48` (`rose-600`), Icon `ArrowDownRight`.
  - If Income selected: Text `#059669` (`emerald-600`), Icon `ArrowUpRight`.

---

### 2.3 Input Fields & Form Controls (`Input`, `Select`)

- **Container:** Auto-layout Vertical, Gap `6px`, Width `Fill`.
- **Label:** `Caption/Medium` (12px), Fill `#475569` (`slate-600` / `dark:slate-300`).
- **Input Box:**
  - Height: `42px`, Horizontal Padding `14px`, Corner Radius `10px`.
  - Default State: Fill `#ffffff`, Stroke `1px #e2e8f0` (`slate-200`), Text `14px Regular #0f172a`.
  - Focus State: Stroke `1px #059669` (`emerald-600`), Outer Ring `3px rgba(5, 150, 105, 0.15)`.
  - Error State: Stroke `1px #e11d48` (`rose-600`), Helper text `12px Regular #e11d48`.
  - Placeholder: Fill `#94a3b8` (`slate-400`).

---

### 2.4 Status Badges & Category Tags (`Badge`)

Compact pills highlighting transaction status and project programs.

| Badge Variant | Figma Auto-Layout | Fill | Border Stroke | Text Color & Font |
| :--- | :--- | :--- | :--- | :--- |
| `Thai Chuay Thai` | `px-2.5 py-0.5`, Radius `9999px` | `#eff6ff` (Blue 50) | `1px #bfdbfe` (Blue 200) | `#1d4ed8` (Blue 700) • `12px Medium` |
| `Income` | `px-2.5 py-0.5`, Radius `9999px` | `#ecfdf5` (Emerald 50) | `1px #a7f3d0` (Emerald 200) | `#047857` (Emerald 700) • `12px Medium` |
| `Expense` | `px-2.5 py-0.5`, Radius `9999px` | `#fff1f2` (Rose 50) | `1px #fecdd3` (Rose 200) | `#be123c` (Rose 700) • `12px Medium` |
| `Warning / Limit`| `px-2.5 py-0.5`, Radius `9999px` | `#fffbeb` (Amber 50) | `1px #fde68a` (Amber 200) | `#b45309` (Amber 700) • `12px Medium` |
| `Neutral / Tag` | `px-2.5 py-0.5`, Radius `9999px` | `#f1f5f9` (Slate 100)| `1px #e2e8f0` (Slate 200) | `#475569` (Slate 600) • `12px Medium` |

---

### 2.5 Cards & Metric Stats (`Card`, `StatCard`)

Replaced dated multi-color gradient fills with clean white surfaces, crisp tabular typography, and structured micro-eyebrows.

```
+-------------------------------------------------------------+
|  รายรับเดือนนี้ (THIS MONTH'S INCOME)         [ Icon Avatar ] |
|  ฿ 45,000.00                                               |
|  +12% จากเดือนที่แล้ว                                         |
+-------------------------------------------------------------+
```

- **Card Frame:** Auto-layout Vertical, Padding `20px` (Desktop `24px`), Radius `16px`.
- **Card Background:** Fill `#ffffff` (`dark:bg-slate-900`), Border `1px solid #e2e8f0/80` (`dark:border-slate-800/90`).
- **Eyebrow Header:** Auto-layout Horizontal, Space-Between:
  - Text: `Micro/Caps` (11px), SemiBold, Uppercase, Tracking `+0.05em`, Color `#64748b` (`slate-500`).
  - Icon Avatar: Frame `36 x 36 px`, Radius `10px`, Fill `#f1f5f9`, Icon Size `18px`, Color `#475569`.
- **Metric Value:** `Heading/1` (24px / 28px), SemiBold, Color `#0f172a`, `font-mono` / tabular-nums.
- **Trend Subtext:** `Caption/Regular` (12px), Color `#059669` (for positive) or `#64748b` (neutral).

---

### 2.6 Thai Chuay Thai 60/40 Co-Pay Quota Indicator

Specialized financial module tracking government co-pay allowance (max ฿40,000 allowance, 60% user / 40% gov co-pay ratio).

```
+-----------------------------------------------------------------------------------+
|  [ Shield Icon ] โควตาโครงการไทยช่วยไทย (60/40 Co-Pay)     ฿12,400.00 / ฿40,000   |
|  [========================================--------------------------------------] |
|  ผู้ใช้จ่าย 60%: ฿7,440.00    รัฐช่วยจ่าย 40%: ฿4,960.00       คงเหลือสิทธิ์: ฿27,600 |
+-----------------------------------------------------------------------------------+
```

- **Card Shell:** Auto-layout Vertical, Gap `12px`, Padding `16px 20px`, Radius `14px`.
  - Fill: `#f8fafc` (`slate-50` / `dark:bg-slate-900/60`), Stroke: `1px #e2e8f0` (`slate-200` / `dark:slate-800`).
- **Progress Track:** Frame Width `Fill`, Height `6px`, Radius `9999px`, Fill `#e2e8f0` (`slate-200` / `dark:slate-800`).
- **Progress Fill Indicator:** Height `6px`, Radius `9999px`, Fill `#2563eb` (`blue-600`).
- **Co-Pay Breakdown Grid:** 3-Column Auto-Layout:
  - Column 1: "ผู้ใช้จ่าย 60%" (Label 11px `#64748b`, Value 13px SemiBold `#0f172a`).
  - Column 2: "รัฐช่วยจ่าย 40%" (Label 11px `#64748b`, Value 13px SemiBold `#2563eb`).
  - Column 3: "คงเหลือสิทธิ์" (Label 11px `#64748b`, Value 13px SemiBold `#059669`).

---

### 2.7 Transaction List Row

Designed for scanability on both 390px mobile screens and wide desktop tables.

```
+-----------------------------------------------------------------------------------+
| [ Coffee Icon ]  อเมซอน คาเฟ่ (Amazon Cafe)                    -฿ 65.00            |
|                  อาหารและเครื่องดื่ม • บัตรเครดิต [ไทยช่วยไทย 60/40]  14:30 น.     |
+-----------------------------------------------------------------------------------+
```

- **Row Container:** Auto-layout Horizontal, Alignment Center, Padding `12px 16px`, Radius `12px`.
  - Fill: Transparent (Hover: `#f8fafc` / `dark:hover:bg-slate-800/40`).
- **Left Block (Avatar + Info):** Auto-layout Horizontal, Gap `12px`, Alignment Center.
  - Avatar: `40 x 40 px`, Radius `12px`, Fill `#f1f5f9` (`slate-100`), Icon `20px` Neutral.
  - Title Group: Auto-layout Vertical, Gap `3px`.
    - Merchant/Title: `Body/Medium` (14px SemiBold), `#0f172a`.
    - Meta Subtext: `Caption/Regular` (12px), `#64748b`, includes Category pill or [60/40] badge.
- **Right Block (Amount + Time):** Auto-layout Vertical, Alignment Right, Gap `2px`.
  - Amount: `Body/Large` (15px SemiBold), Tabular numbers.
    - Expense: `#e11d48` (`rose-600`), Prefix `-฿`.
    - Income: `#059669` (`emerald-600`), Prefix `+฿`.
  - Timestamp: `Caption/Regular` (12px), `#94a3b8` (`slate-400`).

---

## 3. Screen Layout Blueprints & Wireframes

### 3.1 Dashboard (`DashboardPage`)
- **Primary Goal:** Give the user an instant, calm overview of current liquidity, monthly trends, and Thai Chuay Thai quota.
- **Auto-Layout Flow:** Vertical Stack, Gap `24px` (`space-6`).
- **Section Hierarchy:**
  1. **Top Greeting & Quick Action:** "สวัสดีคุณ ธนภัทร" + "บันทึกธุรกรรมด่วน" (Primary Button).
  2. **Top Metric Cards (3 Columns Desktop, 1 Column Mobile):**
     - Total Balance (฿ 124,580.00)
     - Monthly Income (฿ 45,000.00)
     - Monthly Expenses (฿ 18,240.00)
  3. **Thai Chuay Thai 60/40 Quota Status Card** (Full width progress & remaining allowance).
  4. **Analytics Grid (2 Columns Desktop):**
     - Left (60% width): 7-Day Spending Activity Area Chart (Subtle single emerald-stroke, `fill-opacity="0.1"`, zero grid clutter).
     - Right (40% width): Category Expense Distribution (Minimal progress list or clean donut).
  5. **Recent Transactions Feed:** Card with header ("ธุรกรรมล่าสุด" + "ดูทั้งหมด" Link) followed by top 5 transaction rows.

---

### 3.2 Transactions & Ledger (`TransactionsPage`)
- **Primary Goal:** Rapid record entry and granular filtering without cognitive overload.
- **Consolidated Action Strip:**
  - Removed old redundant 3-color gradient banner. Replaced with single horizontal action bar:
  - Left: Thai Chuay Thai Quota summary snippet (`฿12,400 / ฿40,000 used`).
  - Right: Search input (`w-64`) + Filter button + "เพิ่มธุรกรรม" (+ Add Transaction Button).
- **Quick Select Category Chips:**
  - Horizontal scrollable chip bar: `[ทั้งหมด]`, `[อาหาร]`, `[เดินทาง]`, `[ช้อปปิ้ง]`, `[เงินเดือน]`, `[โครงการ 60/40]`.
  - Micro-pills: Active chip `#0f172a` text `#ffffff`; Inactive `#ffffff` stroke `1px #e2e8f0`.
- **Transaction Ledger Feed:**
  - Grouped by Sticky Date Headers (`วันนี้`, `เมื่อวาน`, `17 ก.ย. 2026`).
  - Clean transaction rows with hover feedback.

---

### 3.3 Transaction Entry Modal (`TransactionForm`)
- **Primary Goal:** Frictionless 3-second data entry.
- **Modal Frame:** Width `480px`, Max-Width `95vw`, Radius `20px`, Padding `24px`.
- **Internal Form Hierarchy:**
  1. **Modal Header:** Title "บันทึกรายการใหม่" + Close 'X' icon button.
  2. **Segmented Switcher:** 2-tab pill (`รายจ่าย` vs `รายรับ`).
  3. **Hero Amount Input:** Large centered amount input (`text-3xl font-bold`, Prefix `฿`, Auto-focus).
  4. **Category Selector:** Grid of quick category icon buttons (4 columns).
  5. **Thai Chuay Thai 60/40 Toggle Card:**
     - Toggle switch with label "ใช้สิทธิ์โครงการไทยช่วยไทย (60/40)".
     - When toggled ON: displays real-time calculation pills (คุณจ่าย 60% = ฿X, รัฐจ่าย 40% = ฿Y).
  6. **Date & Payment Method:** 2-column side-by-side inputs.
  7. **Note / Description:** Clean single-line text input with placeholder.
  8. **Action Bar:** "ยกเลิก" (Ghost Button) + "บันทึกรายการ" (Full Emerald Button).

---

### 3.4 Personal Income Tax Planner (`TaxPage`)
- **Primary Goal:** Demystify Thai PIT (Personal Income Tax / ภ.ง.ด.91) calculations and highlight tax deduction opportunities.
- **Section Hierarchy:**
  1. **Executive Tax Outcome Card:**
     - Replaced loud green gradient with clean dual-metric card:
     - Left: Estimated Net Tax Payable (`฿ 8,450.00`).
     - Right: Current Tax Bracket (`10% Bracket - รายได้สุทธิ ฿350,000`).
  2. **Deductions Summary Bar:**
     - Progress bar showing total deductions utilized (e.g. ฿140,000 / ฿600,000 cap).
     - Breakdown tags: ค่าลดหย่อนส่วนตัว (฿60,000), ประกันสังคม (฿9,000), กองทุนสำรองเลี้ยงชีพ (฿45,000).
  3. **Smart Tax Saving Opportunities (3 Minimal Cards):**
     - SSF / RMF Recommendation Card: "ลงทุนเพิ่ม ฿20,000 เพื่อลดภาษีได้อีก ฿2,000".
     - Insurance Allowance Card: "สิทธิ์ลดหย่อนประกันชีวิตคงเหลือ ฿40,000".
     - Thai Chuay Thai Eligible Expense Total.

---

### 3.5 Reports & Monthly Analytics (`ReportsPage`)
- **Primary Goal:** Strategic financial analysis without visual clutter.
- **Section Hierarchy:**
  1. **Date Range Filter Strip:** Month selector dropdown (`กันยายน 2026`) + "ส่งออกรายงาน CSV" (Outline Button).
  2. **Key Financial Ratios (3 Stat Cards):**
     - Savings Rate: `34.2%` (Target > 20%).
     - Needs vs Wants Ratio: `52% Needs / 28% Wants / 20% Savings`.
     - Daily Average Spend: `฿ 608.00 / วัน`.
  3. **Visual Reports Grid:**
     - Cashflow Trend Bar Chart (Monthly Income vs Monthly Expense side-by-side).
     - Expense Breakdown Table with percentage share of total income.

---

## 4. Figma Implementation & Layer Structure Rules

When recreating or importing this system into your Figma workspace:

### 4.1 Page & File Structure
```
📂 NgernMee_Design_System.fig
  ├── 🎨 00_Cover & Principles
  ├── 📐 01_Foundations (Colors, Typography, Grids, Elevation)
  ├── 🧩 02_Atoms (Buttons, Badges, Inputs, Icons, Dividers)
  ├── 📦 03_Molecules (StatCards, TransactionRow, FormGroups, QuotaBar)
  ├── 🖥️ 04_Organisms (Sidebar, Header, TransactionModal, TaxCalculator)
  ├── 📱 05_Screens_Mobile (390px - Dashboard, Ledger, Form, Tax, Settings)
  └── 💻 06_Screens_Desktop (1440px - Dashboard, Ledger, Tax, Reports)
```

### 4.2 Auto-Layout & Constraints Checklist
- **Never use fixed frame widths for content containers:** Always set frames to `Fill container` (horizontal) and `Hug contents` (vertical).
- **Responsive Navigation:**
  - Sidebar: Set to Fixed Width (`256px`), Height `Fill container` (Pinned Left).
  - Main Content Canvas: Set to `Fill container` with maximum constraint `1280px`.
- **Text Layer Safety:**
  - Dynamic currency figures (e.g. `฿ 12,400.00`): Set text layer to `Auto width`, Tabular numbers ON (`font-variant-numeric: tabular-nums`).
  - Titles & Descriptions: Set to `Fill container` with auto-height to prevent text truncation bugs.

### 4.3 Figma Component Property Naming Convention
- **Variant:** `Type = Primary | Secondary | Outline | Ghost | Danger`
- **Size:** `Size = sm | md | lg`
- **State:** `State = Default | Hover | Active | Disabled | Focus`
- **Boolean Properties:** `showIconLeft = true/false`, `showBadge = true/false`
- **Instance Swap:** `iconLeft = [Icon Component Library]`
- **Text Properties:** `label = "บันทึกรายการ"`, `amount = "฿ 0.00"`

---

*Authored for NgernMee Limited by Antigravity Design & Engineering Team.*
