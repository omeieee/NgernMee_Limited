import { z } from 'zod';

export const transactionDraftSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.union([z.number(), z.string()]).refine(
    (val) => {
      const num = typeof val === 'number' ? val : parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: 'กรุณาระบุจำนวนเงินที่มากกว่า 0' }
  ),
  description: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      if (typeof val !== 'string') return 'อื่นๆ';
      const trimmed = val.trim();
      return trimmed.length > 0 ? trimmed : 'อื่นๆ';
    }),
  category_id: z.string().nullable().optional(),
  transaction_date: z.string().min(1, { message: 'กรุณาระบุวันที่' }),
  is_thai_chuay_thai: z.boolean().optional().default(false),
  income_type: z
    .enum(['salary', 'freelance_part_time', 'allowance', 'scholarship', 'investment', 'other'])
    .optional(),
  has_wht: z.boolean().optional().default(false),
  wht_rate: z.number().min(0).max(100).optional().default(3),
  custom_wht_amount: z.union([z.number(), z.string()]).nullable().optional(),
});

export type ValidatedTransactionDraft = z.infer<typeof transactionDraftSchema>;

export function validateTransactionDraft(data: unknown) {
  const result = transactionDraftSchema.safeParse(data);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path[0];
      if (typeof path === 'string') {
        fieldErrors[path] = issue.message;
      }
    }
    return { success: false as const, errors: fieldErrors };
  }
  return { success: true as const, data: result.data };
}
