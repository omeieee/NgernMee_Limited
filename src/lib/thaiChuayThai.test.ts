import { describe, it, expect } from 'vitest';
import { calculateDiscount } from './thaiChuayThai';

describe('calculateDiscount (Thai Chuay Thai 60/40)', () => {
  it('should calculate 60% government subsidy accurately when within daily and monthly limits', () => {
    // 100 THB -> 60 THB subsidy, user pays 40 THB
    const res = calculateDiscount(100, 0, 0);
    expect(res.nominalDiscount).toBe(60);
    expect(res.effectiveDiscount).toBe(60);
    expect(res.netAmount).toBe(40);
    expect(res.isCapped).toBe(false);
  });

  it('should cap subsidy at daily maximum (200 THB)', () => {
    // 500 THB -> 60% is 300 THB, but daily cap is 200 THB
    const res = calculateDiscount(500, 0, 0);
    expect(res.nominalDiscount).toBe(300);
    expect(res.effectiveDiscount).toBe(200);
    expect(res.netAmount).toBe(300);
    expect(res.isCapped).toBe(true);
    expect(res.capReason).toBe('daily');
  });

  it('should cap subsidy when monthly remaining limit is lower than daily remaining', () => {
    // Monthly cap is 1,000 THB. If 950 THB used, only 50 THB remains.
    // 100 THB expense -> nominal 60 THB, but capped to 50 THB.
    const res = calculateDiscount(100, 0, 950);
    expect(res.effectiveDiscount).toBe(50);
    expect(res.netAmount).toBe(50);
    expect(res.isCapped).toBe(true);
    expect(res.capReason).toBe('monthly');
  });

  it('should handle zero or negative amounts gracefully', () => {
    const res = calculateDiscount(0, 0, 0);
    expect(res.effectiveDiscount).toBe(0);
    expect(res.netAmount).toBe(0);
    expect(res.isCapped).toBe(false);
  });
});
