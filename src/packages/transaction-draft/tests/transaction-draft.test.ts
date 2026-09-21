import { describe, it, expect } from 'vitest';
import {
  buildTransactionPayload,
  calculateDraftAmounts,
  suggestTransactionMeta,
  validateTransactionDraft,
} from '../index';

describe('Transaction Draft Deep Module', () => {
  describe('validateTransactionDraft', () => {
    it('validates a valid transaction draft', () => {
      const valid = {
        type: 'expense',
        amount: 250,
        description: 'ข้าวผัดกะเพรา',
        transaction_date: '2026-06-20',
        is_thai_chuay_thai: true,
      };
      const res = validateTransactionDraft(valid);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.description).toBe('ข้าวผัดกะเพรา');
      }
    });

    it('rejects zero or negative amount and empty description', () => {
      const invalid = {
        type: 'expense',
        amount: 0,
        description: '   ',
        transaction_date: '2026-06-20',
      };
      const res = validateTransactionDraft(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.errors.amount).toBeDefined();
        expect(res.errors.description).toBeDefined();
      }
    });
  });

  describe('calculateDraftAmounts', () => {
    it('calculates Thai Chuay Thai co-pay discount correctly for expense', () => {
      const amounts = calculateDraftAmounts({
        type: 'expense',
        amount: 300,
        isThaiChuayThai: true,
        thaiChuayThaiDiscount: 180, // e.g. 60% of 300 under daily cap
      });

      expect(amounts.gross).toBe(300);
      expect(amounts.discount).toBe(180);
      expect(amounts.net).toBe(120); // user pays 40% = 120
      expect(amounts.whtAmount).toBe(0);
    });

    it('calculates withholding tax 3% correctly for freelance income', () => {
      const amounts = calculateDraftAmounts({
        type: 'income',
        amount: 10000,
        incomeType: 'freelance_part_time',
        hasWht: true,
        whtRate: 3,
      });

      expect(amounts.gross).toBe(10000);
      expect(amounts.whtAmount).toBe(300);
      expect(amounts.net).toBe(9700);
      expect(amounts.discount).toBe(0);
    });

    it('supports custom withholding tax amount override', () => {
      const amounts = calculateDraftAmounts({
        type: 'income',
        amount: 10000,
        incomeType: 'freelance_part_time',
        hasWht: true,
        whtRate: 3,
        customWhtAmount: 500, // custom manual WHT
      });

      expect(amounts.gross).toBe(10000);
      expect(amounts.whtAmount).toBe(500);
      expect(amounts.net).toBe(9500);
    });
  });

  describe('buildTransactionPayload', () => {
    it('builds complete payload for saving to storage', () => {
      const payload = buildTransactionPayload({
        type: 'income',
        amount: '15000',
        description: ' งานฟรีแลนซ์ออกแบบเว็บไซต์ ',
        category_id: 'cat-123',
        transaction_date: '2026-06-25',
        income_type: 'freelance_part_time',
        has_wht: true,
        wht_rate: 3,
      });

      expect(payload.amount).toBe(15000);
      expect(payload.gross_amount).toBe(15000);
      expect(payload.net_amount).toBe(14550);
      expect(payload.withholding_tax_amount).toBe(450);
      expect(payload.withholding_tax_rate).toBe(3);
      expect(payload.description).toBe('งานฟรีแลนซ์ออกแบบเว็บไซต์');
      expect(payload.is_salary).toBe(false);
      expect(payload.income_type).toBe('freelance_part_time');
    });
  });

  describe('suggestTransactionMeta', () => {
    it('suggests freelance and withholding tax for freelance keywords', () => {
      const suggestion = suggestTransactionMeta('รับจ้างทำเว็บพาร์ทไทม์', 'income');
      expect(suggestion.suggestedType).toBe('income');
      expect(suggestion.suggestedIncomeType).toBe('freelance_part_time');
      expect(suggestion.suggestedHasWht).toBe(true);
    });

    it('suggests allowance for parents transfer keywords', () => {
      const suggestion = suggestTransactionMeta('แม่โอนเงินค่าขนม', 'income');
      expect(suggestion.suggestedIncomeType).toBe('allowance');
      expect(suggestion.suggestedHasWht).toBe(false);
    });

    it('suggests Thai Chuay Thai for market / co-pay keywords on expenses', () => {
      const suggestion = suggestTransactionMeta('ซื้อของตลาดคนละครึ่ง', 'expense');
      expect(suggestion.suggestedThaiChuayThai).toBe(true);
    });
  });
});
