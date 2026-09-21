export interface IncomeBreakdownInput {
  salary40_1?: number; // 40(1) เงินเดือนประจำ / ค่าจ้าง
  freelance40_2?: number; // 40(2) พาร์ทไทม์ / ฟรีแลนซ์ / รับจ้างทำของ
  allowanceExempt?: number; // เงินค่าขนม / ช่วยเหลือจากครอบครัว (ยกเว้นภาษี)
  scholarshipExempt?: number; // ทุนการศึกษา (ยกเว้นภาษี)
  otherTaxable?: number; // รายได้อื่นที่ต้องเสียภาษี
  withholdingTaxTotal?: number; // รวมภาษีหัก ณ ที่จ่ายที่ถูกหักไว้ (50 ทวิ)
}

export interface ClassifiedAnnualIncome {
  salary40_1: number;
  freelance40_2: number;
  allowanceExempt: number;
  scholarshipExempt: number;
  otherTaxable: number;
  withholdingTaxTotal: number;
  hasAnyIncomeTxs: boolean;
  totalTaxable: number;
}
