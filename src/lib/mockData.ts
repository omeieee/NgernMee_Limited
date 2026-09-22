// src/lib/mockData.ts
// Default seed data for NgernMee Limited local/demo mode

import type { Category, Profile, TaxConfig, Transaction } from './types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from './constants';
import { generateId } from './utils';
import { calculateDiscount } from './thaiChuayThai';

export const DEMO_USER_ID = 'demo-user-001';

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  display_name: 'คุณสมชาย มีเงิน',
  avatar_url:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function createInitialCategories(userId: string = DEMO_USER_ID): Category[] {
  const categories: Category[] = [];
  let sortOrder = 1;

  // Expense categories
  for (const exp of DEFAULT_EXPENSE_CATEGORIES) {
    const parentId = generateId();
    categories.push({
      id: parentId,
      user_id: userId,
      parent_id: null,
      name: exp.name,
      icon: exp.icon,
      color: exp.color,
      type: 'expense',
      sort_order: sortOrder++,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    if (exp.subcategories) {
      let subOrder = 1;
      for (const subName of exp.subcategories) {
        let icon = exp.icon;
        if (subName === 'ของว่าง / เครื่องดื่ม') icon = 'coffee';
        else if (subName === 'มื้อพิเศษ / บุฟเฟต์') icon = 'party-popper';
        else if (subName === 'ค่าน้ำมันรถ') icon = 'fuel';
        else if (subName === 'รถไฟฟ้า / ขนส่งสาธารณะ') icon = 'train';
        else if (subName === 'ที่จอดรถ / ค่าทางด่วน') icon = 'navigation';
        else if (subName === 'ค่าส่วนกลาง / ซ่อมบำรุง') icon = 'wrench';
        else if (subName === 'ค่ายา / พบแพทย์') icon = 'stethoscope';
        else if (subName === 'เบี้ยประกันสุขภาพ') icon = 'shield-check';
        else if (subName === 'ค่าไฟฟ้า') icon = 'zap';
        else if (subName === 'ค่าน้ำประปา') icon = 'droplets';
        else if (subName === 'ค่าอินเทอร์เน็ต / โทรศัพท์') icon = 'wifi';
        else if (subName === 'กองทุน / หุ้น') icon = 'trending-up';

        categories.push({
          id: generateId(),
          user_id: userId,
          parent_id: parentId,
          name: subName,
          icon,
          color: exp.color,
          type: 'expense',
          sort_order: subOrder++,
          is_active: true,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  // Income categories
  for (const inc of DEFAULT_INCOME_CATEGORIES) {
    categories.push({
      id: generateId(),
      user_id: userId,
      parent_id: null,
      name: inc.name,
      icon: inc.icon,
      color: inc.color,
      type: 'income',
      sort_order: sortOrder++,
      is_active: true,
      created_at: new Date().toISOString(),
    });
  }

  return categories;
}

export function createInitialTransactions(
  userId: string = DEMO_USER_ID,
  categories: Category[]
): Transaction[] {
  const getCatId = (name: string) => categories.find((c) => c.name === name)?.id || null;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const pad = (n: number) => String(n).padStart(2, '0');
  const d1 = `${year}-${month}-${pad(Math.max(1, now.getDate() - 1))}`;
  const d2 = `${year}-${month}-${pad(Math.max(1, now.getDate() - 2))}`;
  const d3 = `${year}-${month}-${pad(Math.max(1, now.getDate() - 3))}`;
  const d4 = `${year}-${month}-01`;

  const foodDaily =
    getCatId('อาหารประจำวัน') || getCatId('อาหารและเครื่องดื่ม') || getCatId('อาหาร');
  const foodSpecial =
    getCatId('มื้อพิเศษ / บุฟเฟต์') || getCatId('อาหารและเครื่องดื่ม') || getCatId('อาหาร');
  const coffeeCat =
    getCatId('ของว่าง / เครื่องดื่ม') || getCatId('อาหารและเครื่องดื่ม') || getCatId('อาหาร');
  const fuelCat = getCatId('ค่าน้ำมันรถ') || getCatId('การเดินทาง') || getCatId('เดินทาง');
  const trainCat =
    getCatId('รถไฟฟ้า / ขนส่งสาธารณะ') || getCatId('การเดินทาง') || getCatId('เดินทาง');
  const rentCat = getCatId('ค่าเช่าห้อง / ผ่อนบ้าน') || getCatId('ที่อยู่อาศัย');
  const salaryCat = getCatId('เงินเดือน');
  const freelanceCat = getCatId('งานพาร์ทไทม์ / สอนพิเศษ') || getCatId('งานฟรีแลนซ์ / รายได้เสริม');
  const allowanceCat = getCatId('เงินจากครอบครัว / ค่าขนม') || getCatId('ของขวัญ / โบนัส');

  return [
    {
      id: generateId(),
      user_id: userId,
      category_id: foodDaily,
      type: 'expense',
      amount: 60,
      gross_amount: 60,
      description: 'ข้าวราดแกงป้าพร',
      transaction_date: todayStr,
      is_salary: false,
      is_thai_chuay_thai: false,
      thai_chuay_thai_discount: 0,
      net_amount: 60,
      metadata: {
        note: 'มื้อเที่ยง',
        time: '12:30 น.',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      user_id: userId,
      category_id: trainCat,
      type: 'expense',
      amount: 35,
      gross_amount: 35,
      description: 'BTS สายสีเขียว ชิดลม-สยาม',
      transaction_date: todayStr,
      is_salary: false,
      is_thai_chuay_thai: false,
      thai_chuay_thai_discount: 0,
      net_amount: 35,
      metadata: {
        note: 'จ่ายเต็ม',
        time: '08:45 น.',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      user_id: userId,
      category_id: freelanceCat,
      type: 'income',
      amount: 15000,
      gross_amount: 15000,
      withholding_tax_rate: 3,
      withholding_tax_amount: 450,
      description: 'ค่าออกแบบ UI ระบบ ERP',
      transaction_date: d1,
      is_salary: false,
      income_type: 'freelance_part_time',
      is_thai_chuay_thai: false,
      thai_chuay_thai_discount: 0,
      net_amount: 14550,
      metadata: {
        note: 'หักภาษีไว้ ฿450',
        tax_section: '40(2)',
        time: '14:00 น.',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      user_id: userId,
      category_id: salaryCat,
      type: 'income',
      amount: 45000,
      gross_amount: 45000,
      description: 'เงินเดือนประจำ บ. พัฒนา',
      transaction_date: d2,
      is_salary: true,
      income_type: 'salary',
      is_thai_chuay_thai: false,
      thai_chuay_thai_discount: 0,
      net_amount: 45000,
      metadata: {
        note: 'เงินเดือนประจำ',
        tax_section: '40(1)',
        time: '09:00 น.',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      user_id: userId,
      category_id: rentCat,
      type: 'expense',
      amount: 6500,
      gross_amount: 6500,
      description: 'ค่าเช่าหอพักนักศึกษา / คอนโด',
      transaction_date: d4,
      is_salary: false,
      is_thai_chuay_thai: false,
      thai_chuay_thai_discount: 0,
      net_amount: 6500,
      metadata: {
        note: 'จ่ายเต็ม',
        time: '10:00 น.',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      user_id: userId,
      category_id: fuelCat,
      type: 'expense',
      amount: 1000,
      gross_amount: 1000,
      description: 'เติมน้ำมันเต็มถัง',
      transaction_date: d3,
      is_salary: false,
      is_thai_chuay_thai: false,
      thai_chuay_thai_discount: 0,
      net_amount: 1000,
      metadata: {
        note: 'จ่ายเต็ม',
        time: '18:15 น.',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      user_id: userId,
      category_id: allowanceCat,
      type: 'income',
      amount: 8000,
      gross_amount: 8000,
      description: 'เงินค่าขนมจากคุณแม่',
      transaction_date: d4,
      is_salary: false,
      income_type: 'allowance',
      is_thai_chuay_thai: false,
      thai_chuay_thai_discount: 0,
      net_amount: 8000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export function createInitialTaxConfig(userId: string = DEMO_USER_ID): TaxConfig {
  const currentYear = new Date().getFullYear();
  return {
    id: generateId(),
    user_id: userId,
    tax_year: currentYear,
    monthly_salary: 48000,
    annual_salary: 48000 * 12,
    personal_allowance: 60000,
    expense_deduction: 100000,
    social_security: 9000,
    additional_deductions: {
      life_insurance: 30000,
      health_insurance: 15000,
      provident_fund: 28800,
      thai_esg: 50000,
      rmf: 0,
      ssf: 0,
      home_loan_interest: 0,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
