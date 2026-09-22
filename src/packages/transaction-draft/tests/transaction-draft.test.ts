import { describe, it, expect } from 'vitest';
import {
  buildTransactionPayload,
  calculateDraftAmounts,
  suggestTransactionMeta,
  validateTransactionDraft,
  extractDescriptionSuggestions,
  intakeTransaction,
  evaluateLedgerCoPayQuota,
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

    it('accepts empty or whitespace description and defaults it to อื่นๆ', () => {
      const draft = {
        type: 'expense',
        amount: 150,
        description: '   ',
        transaction_date: '2026-06-20',
      };
      const res = validateTransactionDraft(draft);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.description).toBe('อื่นๆ');
      }
    });

    it('accepts omitted description and defaults it to อื่นๆ', () => {
      const draft = {
        type: 'expense',
        amount: 80,
        transaction_date: '2026-06-20',
      };
      const res = validateTransactionDraft(draft);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.description).toBe('อื่นๆ');
      }
    });

    it('rejects zero or negative amount', () => {
      const invalid = {
        type: 'expense',
        amount: 0,
        description: 'ค่ากาแฟ',
        transaction_date: '2026-06-20',
      };
      const res = validateTransactionDraft(invalid);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.errors.amount).toBeDefined();
        expect(res.errors.description).toBeUndefined();
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

    it('defaults empty or whitespace description to อื่นๆ in payload', () => {
      const payload = buildTransactionPayload({
        type: 'expense',
        amount: 200,
        description: '   ',
        category_id: null,
        transaction_date: '2026-06-25',
      });

      expect(payload.description).toBe('อื่นๆ');
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

  describe('extractDescriptionSuggestions', () => {
    const mockTxHistory = [
      {
        type: 'expense' as const,
        description: 'กาแฟอเมซอน',
        category_id: 'cat-drink',
        transaction_date: '2026-06-20',
      },
      {
        type: 'expense' as const,
        description: 'ข้าวมันไก่',
        category_id: 'cat-food',
        transaction_date: '2026-06-19',
      },
      {
        type: 'expense' as const,
        description: 'กาแฟอเมซอน',
        category_id: 'cat-drink',
        transaction_date: '2026-06-21',
      },
      {
        type: 'expense' as const,
        description: 'อื่นๆ',
        category_id: null,
        transaction_date: '2026-06-22',
      },
      {
        type: 'income' as const,
        description: 'เงินเดือน บ.ไทยจำกัด',
        category_id: 'cat-salary',
        transaction_date: '2026-06-25',
      },
    ];

    it('extracts unique descriptions and associates with the correct category', () => {
      const suggestions = extractDescriptionSuggestions(mockTxHistory, { type: 'expense' });
      expect(suggestions.length).toBe(2); // กาแฟอเมซอน, ข้าวมันไก่ (ignores "อื่นๆ")

      const coffee = suggestions.find((s) => s.description === 'กาแฟอเมซอน');
      expect(coffee).toBeDefined();
      expect(coffee?.categoryId).toBe('cat-drink');
      expect(coffee?.count).toBe(2);
      expect(coffee?.lastUsed).toBe('2026-06-21');
    });

    it('filters suggestions by query substring and prioritizes prefix matches', () => {
      const suggestions = extractDescriptionSuggestions(mockTxHistory, {
        type: 'expense',
        query: 'กาแฟ',
      });
      expect(suggestions.length).toBe(1);
      expect(suggestions[0].description).toBe('กาแฟอเมซอน');
      expect(suggestions[0].categoryId).toBe('cat-drink');
    });

    it('isolates income suggestions from expense suggestions', () => {
      const incomeSuggestions = extractDescriptionSuggestions(mockTxHistory, { type: 'income' });
      expect(incomeSuggestions.length).toBe(1);
      expect(incomeSuggestions[0].description).toBe('เงินเดือน บ.ไทยจำกัด');
      expect(incomeSuggestions[0].categoryId).toBe('cat-salary');
    });
  });

  describe('intakeTransaction (Deep Interface)', () => {
    const mockLedger = [
      {
        id: 'tx-1',
        user_id: 'user-1',
        type: 'expense' as const,
        amount: 200,
        gross_amount: 200,
        net_amount: 80,
        description: 'มื้อเที่ยง',
        category_id: null,
        transaction_date: '2026-09-22',
        is_salary: false,
        is_thai_chuay_thai: true,
        thai_chuay_thai_discount: 120,
        created_at: '2026-09-22T12:00:00.000Z',
        updated_at: '2026-09-22T12:00:00.000Z',
      },
    ];

    it('validates and computes Co-Pay subsidy automatically from ledger context', () => {
      // 100 THB expense with Co-Pay. Daily used = 120 THB. Daily remaining = 80 THB.
      // 60% of 100 is 60 THB <= 80 THB. So effective discount is 60 THB, net is 40 THB.
      const result = intakeTransaction(
        {
          type: 'expense',
          amount: 100,
          description: 'อาหารเย็น',
          transaction_date: '2026-09-22',
          is_thai_chuay_thai: true,
        },
        { ledger: mockLedger }
      );

      expect(result.success).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.gross_amount).toBe(100);
      expect(result.payload?.thai_chuay_thai_discount).toBe(60);
      expect(result.payload?.net_amount).toBe(40);
      expect(result.copayStatus?.dailyRemaining).toBe(80);
    });

    it('caps Co-Pay subsidy when daily cap (200 THB) is reached', () => {
      // 200 THB expense with Co-Pay. Daily used = 120 THB. Daily remaining = 80 THB.
      // 60% of 200 is 120 THB > 80 THB. Capped to 80 THB discount, net is 120 THB.
      const result = intakeTransaction(
        {
          type: 'expense',
          amount: 200,
          description: 'บุฟเฟต์',
          transaction_date: '2026-09-22',
          is_thai_chuay_thai: true,
        },
        { ledger: mockLedger }
      );

      expect(result.success).toBe(true);
      expect(result.payload?.thai_chuay_thai_discount).toBe(80);
      expect(result.payload?.net_amount).toBe(120);
    });

    it('handles income transactions with Section 40 withholding tax', () => {
      const result = intakeTransaction({
        type: 'income',
        amount: 10000,
        description: 'งานฟรีแลนซ์ออกแบบ',
        transaction_date: '2026-09-22',
        income_type: 'freelance_part_time',
        has_wht: true,
        wht_rate: 3,
      });

      expect(result.success).toBe(true);
      expect(result.payload?.gross_amount).toBe(10000);
      expect(result.payload?.withholding_tax_amount).toBe(300);
      expect(result.payload?.net_amount).toBe(9700);
      expect(result.payload?.is_salary).toBe(false);
    });

    it('rejects invalid drafts cleanly with errors', () => {
      const result = intakeTransaction({
        type: 'expense',
        amount: -50,
        transaction_date: '2026-09-22',
      });

      expect(result.success).toBe(false);
      expect(result.errors?.amount).toBeDefined();
    });

    it('evaluates ledger quota status accurately via evaluateLedgerCoPayQuota', () => {
      const status = evaluateLedgerCoPayQuota(mockLedger, '2026-09-22', 100);
      expect(status.dailyUsed).toBe(120);
      expect(status.dailyRemaining).toBe(80);
      expect(status.effectiveDiscount).toBe(60);
      expect(status.effectiveNet).toBe(40);
    });
  });
});
