# NgernMee Limited — AI Prompts for Each Phase

Copy each prompt below and give it to an AI coding assistant to implement that phase.
Each prompt is **self-contained** — it includes all necessary context.

---

## Prompt 1: Project Setup & Supabase Schema

```
You are building a personal finance web app called "NgernMee Limited".

## Tech Stack
- React 19 + Vite 6 + TypeScript 5.x
- Tailwind CSS 4 + shadcn/ui components
- Supabase (PostgreSQL) for backend
- React Router v7 (hash router for GitHub Pages)
- Zustand for UI state
- date-fns for dates
- React Hook Form + Zod for validation
- Recharts for charts
- Lucide React for icons

## Task
1. Scaffold the Vite + React + TypeScript project in the workspace root.
2. Install all dependencies: @supabase/supabase-js, tailwindcss, @shadcn/ui, zustand, react-router-dom, date-fns, react-hook-form, zod, @hookform/resolvers, recharts, lucide-react.
3. Configure Tailwind CSS 4 with shadcn/ui (follow latest shadcn init for Vite).
4. Create `.env.example` with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
5. Create `src/lib/supabase.ts` — initialize Supabase client from env vars.
6. Create `src/lib/types.ts` — define all TypeScript interfaces:
   - Profile { id, display_name, avatar_url, created_at }
   - Category { id, user_id, parent_id (nullable), name, icon, color, type ('income'|'expense'), sort_order, is_active, created_at, children? (recursive) }
   - Transaction { id, user_id, category_id (nullable), type ('income'|'expense'), amount, description, transaction_date, is_salary, is_thai_chuay_thai, thai_chuay_thai_discount, net_amount, metadata, created_at, updated_at }
   - TaxConfig { id, user_id, tax_year, monthly_salary, annual_salary, personal_allowance, expense_deduction, social_security, additional_deductions, created_at, updated_at }
7. Create Supabase SQL migrations in `supabase/migrations/`:
   - 001_profiles.sql: profiles table with trigger to auto-create on auth.users insert
   - 002_categories.sql: categories table with self-referencing parent_id, indexes on user_id and parent_id
   - 003_transactions.sql: transactions table with all fields, indexes on user_id, category_id, transaction_date
   - 004_tax_configs.sql: tax_configs table
   - 005_rls_policies.sql: Row-Level Security — users can only CRUD their own data
   - 006_seed_default_categories.sql: Insert default Thai categories (อาหาร, เดินทาง, ที่อยู่อาศัย, สุขภาพ, การศึกษา, บันเทิง, เสื้อผ้า, สาธารณูปโภค, ออมทรัพย์/ลงทุน, อื่นๆ) — these are templates, each user gets their own copy
8. Create `src/App.tsx` with React Router HashRouter and placeholder routes: /, /transactions, /categories, /reports, /tax, /settings, /login
9. Create `.github/workflows/deploy.yml` — GitHub Actions to build Vite and deploy to GitHub Pages on push to main.
10. Create a `README.md` with project overview and setup instructions.

## File Structure
Follow this layout exactly:
NgernMee_Limited/
├── .github/workflows/deploy.yml
├── supabase/migrations/001-006.sql
├── src/
│   ├── lib/ (supabase.ts, types.ts, constants.ts, utils.ts)
│   ├── pages/ (placeholder .tsx files)
│   ├── components/ui/ (shadcn)
│   ├── hooks/
│   ├── stores/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── index.html
├── package.json, tsconfig.json, vite.config.ts, tailwind.config.ts

## Acceptance Criteria
- `npm run dev` starts without errors
- All TypeScript types compile clean
- SQL migrations are valid PostgreSQL
- RLS policies prevent cross-user data access
- GitHub Actions workflow builds and deploys on push
```

---

## Prompt 2: Authentication & Layout Shell

```
You are continuing work on "NgernMee Limited", a personal finance web app.
Tech stack: React 19 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui + Supabase.

The project scaffold, Supabase client, types, and SQL migrations already exist.

## Task
1. Implement Supabase Auth:
   - Create `src/hooks/useAuth.ts` — hook wrapping supabase.auth with: signUp, signIn (email/password), signOut, session, user, loading states.
   - Create `src/pages/LoginPage.tsx` — login/register form using shadcn Card, Input, Button. Toggle between sign-in and sign-up mode. Show validation errors.
   - Create `src/components/layout/AuthGuard.tsx` — wrapper that redirects to /login if not authenticated.

2. Build the responsive App Shell:
   - Create `src/components/layout/AppShell.tsx`:
     - Desktop (>=768px): sidebar navigation on left (240px), main content area
     - Mobile (<768px): bottom navigation bar with 5 icons
   - Create `src/components/layout/Sidebar.tsx`:
     - Logo/app name at top
     - Nav items: Dashboard, Transactions, Categories, Reports, Tax, Settings
     - Active state highlighting
     - User avatar and sign-out at bottom
   - Create `src/components/layout/BottomNav.tsx`:
     - 5 main nav items with icons
     - Active state indicator

3. Update `src/App.tsx`:
   - Wrap all routes (except /login) with AuthGuard
   - Wrap authenticated routes with AppShell
   - Add route transitions

## Design Guidelines
- Use a clean, modern financial app aesthetic
- Primary color: emerald/green (money theme)
- Dark mode support via Tailwind dark: variants
- All text labels in Thai

## Acceptance Criteria
- Can register and login with email/password
- Redirect to login when not authenticated
- Sidebar renders on desktop, bottom nav on mobile
- Active route is highlighted in navigation
- Sign-out works and redirects to login
```

---

## Prompt 3: Category Management (Hierarchical Tree)

```
You are continuing work on "NgernMee Limited", a personal finance web app.
Tech stack: React 19 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui + Supabase.

Auth, layout shell, Supabase client, and types already exist.

## Context
Categories have unlimited nesting depth via self-referencing parent_id.
Database schema: id (uuid), user_id, parent_id (nullable), name, icon, color, type ('income'|'expense'), sort_order, is_active, created_at

## Task
1. Create `src/hooks/useCategories.ts`:
   - Fetch all categories for current user
   - Build tree structure from flat array (recursive buildTree)
   - CRUD: createCategory, updateCategory, deleteCategory, moveCategory

2. Create `src/components/categories/CategoryTree.tsx`:
   - Recursive tree with expand/collapse
   - Icon + color badge + name per node
   - Add subcategory, edit, delete actions

3. Create `src/components/categories/CategoryForm.tsx`:
   - Dialog form: name, icon, color, type, parent
   - Zod validation

4. Create `src/components/categories/CategoryPicker.tsx`:
   - Popover with searchable tree for TransactionForm
   - Breadcrumb path display
   - "อื่นๆ" always available (maps to null category_id)
   - Recently used categories at top

5. Create `src/pages/CategoriesPage.tsx`:
   - Two tabs: Income | Expense categories
   - CategoryTree for each

## Default Categories (Thai)
Expenses: อาหาร, เดินทาง, ที่อยู่อาศัย, สุขภาพ, การศึกษา, บันเทิง, เสื้อผ้า, สาธารณูปโภค, อื่นๆ
Income: เงินเดือน, งานฟรีแลนซ์, ลงทุน, ของขวัญ, อื่นๆ

## Acceptance Criteria
- Unlimited depth category nesting
- Tree renders with expand/collapse
- CategoryPicker shows searchable tree with breadcrumbs
- Delete parent prompts about children
```

---

## Prompt 4: Transaction CRUD & Quick Select

```
You are continuing work on "NgernMee Limited", a personal finance web app.
Tech stack: React 19 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui + Supabase + Recharts.

Auth, layout, categories (hierarchical) already exist.

## Context
Transaction fields: id, user_id, category_id (nullable), type ('income'|'expense'), amount, description, transaction_date, is_salary, is_thai_chuay_thai, thai_chuay_thai_discount, net_amount, metadata, created_at, updated_at

Thai Chuay Thai 60/40:
- is_thai_chuay_thai=true: discount = amount*0.60, net_amount = amount*0.40
- Daily cap: 200 THB discount/day, Monthly cap: 1,000 THB/month

is_salary=true on income -> taxable employment income

## Task
1. `src/hooks/useTransactions.ts` — CRUD with pagination, optimistic updates
2. `src/lib/thaiChuayThai.ts` — calculateDiscount, getDailyUsage, getMonthlyUsage, getRemainingQuota
3. `src/hooks/useThaiChuayThai.ts` — Supabase-backed quota tracking
4. `src/components/transactions/TransactionForm.tsx`:
   - Income/Expense toggle, amount, description, CategoryPicker, date
   - Thai Chuay Thai toggle (expenses only): shows "รัฐช่วย 60%: ฿X | คุณจ่าย 40%: ฿Y" + remaining quota
   - Salary toggle (income only)
5. `src/components/transactions/QuickSelectPanel.tsx`:
   - Recent distinct transactions as clickable chips
   - Pre-fills form, sorted by frequency
6. `src/components/transactions/TransactionList.tsx`:
   - Grouped by date, inline edit/delete, Thai Chuay Thai badge, filters

## Acceptance Criteria
- CRUD works for income and expenses
- Thai Chuay Thai calculates correctly with daily/monthly limits
- Quick select pre-fills form from history
- All amounts formatted as ฿X,XXX
```

---

## Prompt 5: Reports & Analytics Dashboard

```
You are continuing work on "NgernMee Limited", a personal finance web app.
Tech stack: React 19 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui + Supabase + Recharts.

All CRUD features exist.

## Task
Build Reports page with 4 tabs:

1. `src/hooks/useAnalytics.ts`:
   - getIncomeExpenseSummary(period, dateRange)
   - getTopSpendingCategories(dateRange, limit)
   - getFrequentItems(dateRange, limit)
   - getSpendingTrend(dateRange, groupBy)
   - getCategoryTreeSpending(dateRange)

2. Tab 1 — ภาพรวม (Overview):
   - Summary cards: income, expense, net
   - Thai Chuay Thai savings note
   - Bar chart: income vs expense (daily/monthly/yearly toggle)

3. Tab 2 — แนวโน้ม (Trends):
   - Line chart: top 5 frequent items over time
   - Table: most purchased ranked by frequency
   - Calendar heatmap

4. Tab 3 — ค่าใช้จ่ายสูงสุด (Top Spending):
   - Pie chart: expense by category
   - Horizontal bar: top 10 categories
   - Ranked list with percentages

5. Tab 4 — ภาษี (Tax Report):
   - Annual salary summary
   - Estimated tax
   - Bracket visualization

## Acceptance Criteria
- Date range filtering across all tabs
- Correct calculations including Thai Chuay Thai adjusted amounts
- Responsive charts
```

---

## Prompt 6: Tax Calculator Page

```
You are continuing work on "NgernMee Limited".
Tech stack: React 19 + Vite + TypeScript + shadcn/ui + Supabase + Recharts.

## Thai Tax Brackets (2025-2026)
0-150,000: 0% | 150,001-300,000: 5% | 300,001-500,000: 10% | 500,001-750,000: 15%
750,001-1,000,000: 20% | 1,000,001-2,000,000: 25% | 2,000,001-4,000,000: 30% | 4,000,001+: 35%

Standard deductions: Personal 60,000 | Employment 50% max 100,000 | Social Security max 9,000
Optional: Life insurance 100,000 | Health 25,000 | RMF 500,000 | SSF 200,000 | Thai ESG 300,000 | Home loan 100,000

## Task
1. `src/lib/thaiTax.ts` — calculateTax(income, deductions) returns bracket breakdown, total tax, effective rate
2. `src/hooks/useTaxCalculation.ts` — load/save TaxConfig, auto-pull salary from transactions
3. `src/pages/TaxPage.tsx` — Income section, deduction checklist, real-time tax result, bracket visualization
4. `src/components/tax/BracketVisualizer.tsx` — stacked bar chart
5. `src/components/tax/DeductionChecklist.tsx` — toggles with max limits

## Acceptance Criteria
- Matches official Thai Revenue Department formula
- Deduction limits enforced
- Auto-pulls salary from transaction data
- Save/load tax config per year
```

---

## Prompt 7: Dashboard & Settings

```
You are continuing work on "NgernMee Limited".
All features (auth, categories, transactions, Thai Chuay Thai, reports, tax) exist.

## Task
1. `src/pages/DashboardPage.tsx`:
   - Welcome + today's date
   - Summary cards: today/month income, expense, net, Thai Chuay Thai savings
   - Quick add transaction form
   - Recent 5 transactions
   - 7-day sparkline
2. `src/pages/SettingsPage.tsx`:
   - Profile, salary setting, Thai Chuay Thai prefs
   - CSV export (transactions + tax report)
   - Dark/light theme toggle
3. `src/lib/exportUtils.ts` — CSV generation + download

## Acceptance Criteria
- Dashboard accurate data, quick add works
- CSV exports correctly
- Theme toggle persists
```

---

## Prompt 8: Integration, Testing & Deploy

```
You are finalizing "NgernMee Limited".

## Task
1. End-to-end flow test: Register → Categories → Transactions → Reports → Tax
2. Performance: React.lazy for report tabs, memo heavy charts, verify indexes
3. Deploy: GitHub Actions → GitHub Pages, hash router, env vars in GH Secrets
4. README: screenshots, setup guide, features, deploy instructions

## Acceptance Criteria
- Full flow works without errors
- Production build < 500KB gzipped
- Deploys to GitHub Pages successfully
- No console errors in production
```
