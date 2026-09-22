# 0002. Unify Transaction Intake and Co-Pay Quota into Deep Module

Transaction recording previously fragmented schema validation, Co-Pay Quota evaluation, Section 40 withholding tax calculations, and persistence payload construction across `TransactionForm.tsx`, `useThaiChuayThai.ts`, `thaiChuayThai.ts`, and `useAppStore.ts`. This created a three-way seam leak where callers had to calculate intermediate discounts and pass them between modules, and the store re-calculated discounts independently.

We decided to consolidate all transaction intake behavior behind the deep `transaction-draft` package interface via `intakeTransaction(draft, { ledger })`. The module encapsulates schema validation, chronological Co-Pay quota headroom, and Section 40 withholding tax rules, exposing a single entry point for both web forms and mobile quick-intake drawers.
