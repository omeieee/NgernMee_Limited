import { describe, it, expect } from 'vitest';
import {
  buildTransactionPayload,
  calculateDraftAmounts,
  suggestTransactionMeta,
  validateTransactionDraft,
  extractDescriptionSuggestions,
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
});
