# Prototype Migration & Implementation Checklist

> **Purpose**: Roadmap and gap checklist to port UX/UI components and interactions from [`prototype_mobile_first.html`](../prototype_mobile_first.html) into the production React 19 / TypeScript codebase ([`src/`](../src/)).
> **Design & Domain Authority**: Strictly follow [`CONTEXT.md`](../CONTEXT.md), [`PROTOTYPE_STYLE_GUIDE.md`](../PROTOTYPE_STYLE_GUIDE.md), and recorded ADRs in `docs/adr/`.

---

## 1. Prototype Gap Analysis (Audit Findings)

| Component / Feature          | Prototype State (`prototype_mobile_first.html`)     | Production Target (`src/`)                                                                                 | Priority |
| :--------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :------- |
| **Tax Deduction Simulator**  | Mock alert toast only (`L5149`)                     | Connect to [`tax-engine`](../src/packages/tax-engine) (SSF/RMF 30%, Health 25k, 500k ceiling)              | **P1**   |
| **Co-Pay (Thai Chuay Thai)** | Checks only daily ฿200 limit (`L4576`)              | Use [`transaction-draft`](../src/packages/transaction-draft) (฿200/day + ฿1,000/month dual cap)            | **P1**   |
| **Cashflow Runway**          | Naive `balance / totalExpenses` (`L4105`)           | Use [`runway.ts`](../src/packages/financial-intelligence/lib/runway.ts) (Essential baseline spending only) | **P1**   |
| **Spending Trend Sparkline** | Hardcoded static SVG coordinates (`L665`)           | Render Recharts AreaChart with 7-day trend from `financial-intelligence`                                   | **P2**   |
| **Expense Distribution**     | Hardcoded percentages (42%, 28%, 18%, 12%) (`L798`) | Dynamic category aggregation from `useTransactions` & `useCategories`                                      | **P2**   |
| **Tax Document Export**      | Fake alert toast (`L5153`)                          | Real CSV/JSON download via [`exportUtils.ts`](../src/lib/exportUtils.ts)                                   | **P2**   |
| **Auth & Session Logout**    | Mock confirm popup & tab switch (`L5196`)           | Supabase auth `signOut()` + redirect to `/login`                                                           | **P3**   |
| **Desktop Simulation Pages** | Static HTML mocks (`L2395-2585`)                    | Native React pages (`TransactionsPage`, `TaxPage`, `ReportsPage`)                                          | **P3**   |

---

## 2. Implementation Checklist

### Phase 1: Business Logic & Deep Module Alignment

- [x] **1.1 Co-Pay Dual-Cap Enforcement**
  - Verify UI shows both daily remaining (max ฿200) and monthly remaining (max ฿1,000).
  - Source: [`copay.ts`](../src/packages/transaction-draft/lib/copay.ts) & [`prototype_mobile_first.html`](../prototype_mobile_first.html).
- [x] **1.2 Cashflow Runway with Essential Expenses**
  - Compute runway using strictly non-discretionary categories (food, shelter, utilities, health, education, transport).
  - Source: [`runway.ts`](../src/packages/financial-intelligence/lib/runway.ts) & [`prototype_mobile_first.html`](../prototype_mobile_first.html).
- [x] **1.3 Dynamic Tax Assessment & Simulator**
  - Wire interactive deduction chips (SSF/RMF, Health, Easy E-Receipt) to `calculateTax()` in [`tax-engine`](../src/packages/tax-engine).
  - Accurately compute Progressive PIT brackets (0%–35%) and refund from WHT prepaid.

---

### Phase 2: Mobile-First UX & Polish Migration

- [x] **2.1 Mobile Hero Balance Card & Ambient Glow**
  - Port tactile neomorphic hero card (`.theme-hero`, `.neo-card`) into [`DashboardPage.tsx`](../src/pages/DashboardPage.tsx).
  - Implement surplus (green glow) vs deficit (rose calm glow) state triggers.
- [x] **2.2 Real Spending Trend Sparkline**
  - Embed dynamic 7-day spending curve into mobile overview using Recharts or SVG path generated from real dates/amounts.
- [x] **2.3 Dynamic Category Distribution Widget**
  - Replace static bars with dynamic percentage bars and color tokens from category definitions.
- [x] **2.4 Quick Transaction Bottom Sheet Enhancements**
  - Ensure [`QuickTransactionSheet.tsx`](../src/components/transactions/QuickTransactionSheet.tsx) includes autocomplete chips, category tree picker, and tucked-away 60/40 Co-pay & WHT options.

---

### Phase 3: Reporting & Exports

- [x] **3.1 Real Tax Filing Summary Export**
  - Connect "ส่งออกรายงานภาษี" button to generate actual CSV/P.N.D.91 calculation file via [`exportUtils.ts`](../src/lib/exportUtils.ts).
- [x] **3.2 Custom Category Persistence**
  - Ensure user-created custom categories persist through Storage Seam / Supabase adapter instead of local memory only.

---

### Phase 4: Quality & Architectural Guardrails

- [x] **4.1 Architecture Boundaries**
  - Run `npm run lint:boundaries` — ensure zero dependency cycle/boundary violations (88 modules, 0 violations).
- [x] **4.2 Unit & Integration Tests**
  - Run `npm test` — all test suites must pass 100% (8 test files, 41 tests passed).
- [x] **4.3 Production Build**
  - Run `npm run build` — zero TypeScript or Vite bundle errors (3,462 modules built cleanly).
