# NgernMee Limited

Thai Personal Finance Management (PFM) and Personal Income Tax (ภ.ง.ด.91) planning system for salaried employees, freelancers, and recipients of government co-pay stimulus programs.

## Language

### Financial Core

**Transaction**:
A single financial inflow or outflow with an amount, date, category, and optional co-pay or withholding tax attributes.
_Avoid_: Entry, record, item, log

**Ledger**:
The chronological record of all transactions belonging to a user, serving as the source of truth for balances and metrics.
_Avoid_: History, journal, statement

**Category**:
A hierarchical classification assigned to a transaction, structured as parent and child nodes with sort order.
_Avoid_: Tag, folder, label, bucket

### Government Co-Pay & Taxes

**Co-Pay Quota (Thai Chuay Thai)**:
The government subsidy program (60% subsidy up to ฿200 daily cap and ฿1,000 monthly cap) applied to eligible expenses.
_Avoid_: Discount, welfare credit, government coupon

**Section 40 Income**:
Thai Revenue Department classification of assessable income into salary (40(1)), freelance/contract (40(2)), and tax-exempt personal allowances.
_Avoid_: Earnings, salary type, wage category

**Tax Assessment**:
The evaluation of annual assessable income, allowable expenses, and deductions against progressive PIT brackets (0% to 35%) to determine tax liability or refund.
_Avoid_: Tax calculation, tax summary, tax report

### Intelligence & Runway

**Cashflow Runway**:
The projected number of days a user can sustain baseline essential living expenses based on current liquid balance and historical burn rate.
_Avoid_: Burn time, survival days, remaining balance

**Essential Baseline Expense**:
Non-discretionary expenses strictly necessary for survival (food, rent, utilities, medical care, transportation).
_Avoid_: Fixed cost, mandatory spending, vital expense

### Architecture & Persistence

**Storage Seam**:
The public boundary where data persistence operations are decoupled from UI state, satisfied by Supabase and LocalStorage adapters.
_Avoid_: Database layer, repository boundary, persistence service
