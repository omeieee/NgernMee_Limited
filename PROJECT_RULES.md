# NgernMee Limited — Project Rules & Architecture Guidelines

## 1. Overview & Tech Stack

- **Purpose**: Thai Personal Finance Management (PFM) & Tax Planning Web Application ("เงินมี จำกัด") for tracking income/expenses, Thai Chuay Thai (60/40) co-pay quotas, PIT (ภ.ง.ด.91) taxes, and cashflow runway.
- **Target Users**: Thai salaried employees (มนุษย์เงินเดือน), freelancers, students, and retail consumers participating in government co-pay stimulus programs.
- **Frontend Core**: React 19, TypeScript 5.x, Vite 6 (configured with HashRouter for GitHub Pages static deployment).
- **Styling & Design System**: Tailwind CSS 4 with custom warm-neutral design tokens, Lucide React icons, `clsx`, and `tailwind-merge`.
- **State Management & Forms**: Zustand 5 with `persist` middleware (LocalStorage), React Hook Form, and Zod validation.
- **Data Visualization & Date Handling**: Recharts for cashflow trends and expense distribution; date-fns with Thai locale and Buddhist Era calendar conversion.
- **Backend & Persistence**: Supabase (PostgreSQL 15+ with Row-Level Security) with seamless offline LocalStorage Demo Mode fallback.
- **CI/CD & Deployment**: GitHub Actions workflow building Vite and deploying to GitHub Pages on pushes to `main`.

## 2. Project Structure

- `src/App.tsx`: App root defining client-side routing, route-level code splitting via `React.lazy`, and suspense loading fallbacks.
- `src/main.tsx`: Application entry point initializing React 19 root and importing global Tailwind CSS styles.
- `src/index.css`: Tailwind CSS entrypoint defining color palettes, `@theme` token variables, and dark mode variants.
- `src/components/layout/`: Responsive application shell (`AppShell`), desktop sidebar, mobile bottom navigation, and route guards (`AuthGuard`).
- `src/components/ui/`: Primitive reusable UI design system components (`Button`, `Card`, `Badge`, `Input`, `Modal`, `CategoryIcon`).
- `src/components/transactions/`: Transaction ledger tables, mobile cards, entry forms (`TransactionForm`), and quick-select chips (`QuickSelectPanel`).
- `src/components/categories/`: Hierarchical category tree view (`CategoryTree`), category creation modals, and picker dropdowns (`CategoryPicker`).
- `src/components/tax/`: PIT 8-bracket visualizer (`BracketVisualizer`), deduction checklists (`DeductionChecklist`), and withholding tax calculators.
- `src/hooks/`: Business logic hooks (`useAuth`, `useTransactions`, `useCategories`, `useTaxCalculation`, `useThaiChuayThai`, `useAnalytics`).
- `src/lib/constants.ts`: Global static configurations, co-pay quota caps, default color palettes, and Lucide icon mappings.
- `src/lib/types.ts`: Comprehensive TypeScript interfaces for users, categories, transactions, tax configs, and calculation outputs.
- `src/lib/thaiTax.ts`: Pure calculation engine for Thai PIT (8 progressive brackets, employment deductions, and withholding tax refunds).
- `src/lib/thaiChuayThai.ts`: Pure calculation engine and daily/monthly quota tracker for Thai Chuay Thai 60/40 government co-pay.
- `src/lib/cashflowIntelligence.ts`: Financial runway calculator, essential baseline expense identification, and survival runway analysis.
- `src/lib/exportUtils.ts`: Excel-compatible CSV generator with UTF-8 BOM encoding for Thai character support.
- `src/lib/supabase.ts`: Supabase client initialization with automatic fallback to offline mock mode.
- `src/lib/utils.ts`: Formatting utilities for Thai Baht currency (`formatCurrency`), Buddhist Era dates (`formatThaiDate`), and class names (`cn`).
- `src/pages/`: Lazy-loaded page route views (`DashboardPage`, `TransactionsPage`, `CategoriesPage`, `ReportsPage`, `TaxPage`, `SettingsPage`, `LoginPage`).
- `src/stores/useAppStore.ts`: Centralized application Zustand store managing state, mutations, LocalStorage persistence, and Supabase cloud sync.
- `supabase/migrations/`: SQL migration files (001–011) defining profiles, categories, transactions, tax configs, triggers, and RLS security policies.
- `vite.config.ts`: Vite build configuration setting path aliases (`@/`), React plugin, and GitHub Pages production base URL.
- `.github/workflows/deploy.yml`: Automated CI/CD workflow building Vite and deploying to GitHub Pages on pushes to `main`.

## 3. Coding Conventions

- **TypeScript Strictness**: Strictly type all models and functions using interfaces in `src/lib/types.ts`; avoid `any` and use union types (`IncomeType`, `TransactionType`).
- **File & Naming Conventions**: PascalCase for React components and pages (`AppShell.tsx`), camelCase for hooks, libraries, and utilities (`useTransactions.ts`, `thaiTax.ts`).
- **Module Architecture**: Strict separation of concerns: UI views in `src/pages/`, modular widgets in `src/components/`, state hooks in `src/hooks/`, and domain logic in `src/lib/`.
- **State Management**: Centralize all shared state in `useAppStore.ts`; access slices via specific Zustand selectors to prevent unnecessary re-renders.
- **Data Mutations**: Trigger asynchronous persistence through store actions; apply updates optimistically before synchronizing with Supabase.
- **Form Handling & Validation**: Use `react-hook-form` paired with `zod` schemas for form validation, ensuring strict input validation before store dispatch.
- **Styling Standards**: Apply Tailwind utility classes combined via `cn()`; maintain dual-theme support using `.dark` root styling and semantic color tokens. Always consult and adhere to [PROTOTYPE_STYLE_GUIDE.md](./PROTOTYPE_STYLE_GUIDE.md) before making UX/UI design, styling, or component adjustments.
- **Icon Standards**: Use `lucide-react` with standardized sizes (`h-4 w-4` / `h-5 w-5`) and consistent color tokens matching `src/lib/constants.ts`.
- **Thai Localization**:
  - Currency: Always format monetary amounts using `formatCurrency()` with the Thai Baht symbol (`฿`).
  - Dates: Always display dates via `formatThaiDate()` converting to Buddhist Era years (พ.ศ. = CE + 543).
  - CSV Export: Always prepend the UTF-8 BOM (`\uFEFF`) in `exportUtils.ts` to ensure Thai characters render correctly in Microsoft Excel.
- **Routing Safety**: Use `HashRouter` from `react-router-dom` to ensure reliable client-side navigation on static hosts (e.g., GitHub Pages).

## 4. Key Boundaries & Architectural Constraints

- **Dual-Mode Parity (Demo vs. Cloud)**: The app must remain 100% functional offline in Demo Mode (`DEMO_USER_ID`) without Supabase credentials.
- **Row-Level Security (RLS)**: Never bypass Supabase RLS policies; all database tables enforce user data isolation (`auth.uid() = user_id`) and cascade deletes.
- **Pure Calculation Engines**: Domain calculation logic in `thaiTax.ts`, `thaiChuayThai.ts`, and `cashflowIntelligence.ts` must remain pure functions with zero DOM or hook dependencies.
- **Government Co-Pay Quota Invariants**: Thai Chuay Thai 60/40 logic must strictly adhere to `THAI_CHUAY_THAI_CONFIG` (60% subsidy, max ฿200/day, max ฿1,000/month).
- **Thai Tax Legal Compliance**: Tax calculations must strictly conform to Revenue Department PIT rules (8 brackets from 0% to 35%, 50% expense cap at ฿100,000, ฿60,000 personal allowance).
- **Multi-Stream Income Classification**: Distinguish Section 40(1) salary, Section 40(2) freelance, and tax-exempt allowances strictly per `IncomeType`.
- **Category Tree Integrity**: Nested category trees rely on self-referencing `parent_id`; category deletions must safely cascade or reassign child transactions.
- **Theme Synchronization**: Theme switching (`light` / `dark`) must synchronously update the `.dark` class on `document.documentElement` and persist in localStorage.
- **Credential Security**: Never hardcode private service keys; only public anonymous credentials (`VITE_SUPABASE_ANON_KEY`) are permitted on the frontend.
- **Git & Build Hygiene**: Avoid pushing build artifacts (`dist/`), local environment keys (`.env`), or cache files to version control.
