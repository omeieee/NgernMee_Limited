// src/lib/constants.ts
// Constants for NgernMee Limited

export const APP_NAME = 'เงินมี จำกัด';
export const APP_TAGLINE = 'ระบบบันทึกรายรับ-รายจ่าย วางแผนภาษี และบริหารเงินอัจฉริยะ';

export const THAI_CHUAY_THAI_CONFIG = {
  DAILY_DISCOUNT_CAP: 200, // รัฐช่วยจ่ายสูงสุด 200 บาท / วัน
  MONTHLY_DISCOUNT_CAP: 1000, // รัฐช่วยจ่ายสูงสุด 1,000 บาท / เดือน
  GOV_COPAY_RATIO: 0.6, // รัฐช่วยจ่าย 60%
  USER_COPAY_RATIO: 0.4, // ผู้ใช้จ่าย 40%
};

export const DEFAULT_CATEGORY_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f97316', // Orange
  '#ef4444', // Red
  '#eab308', // Yellow
  '#14b8a6', // Teal
  '#64748b', // Slate
];

export const AVAILABLE_ICONS = [
  { name: 'utensils', label: 'อาหาร' },
  { name: 'coffee', label: 'กาแฟ/เครื่องดื่ม' },
  { name: 'car', label: 'รถยนต์' },
  { name: 'fuel', label: 'น้ำมัน' },
  { name: 'train', label: 'รถไฟฟ้า' },
  { name: 'home', label: 'บ้าน/ที่พัก' },
  { name: 'heart-pulse', label: 'สุขภาพ/ยา' },
  { name: 'graduation-cap', label: 'การศึกษา' },
  { name: 'gamepad-2', label: 'บันเทิง' },
  { name: 'shirt', label: 'เสื้อผ้า' },
  { name: 'zap', label: 'ไฟฟ้า' },
  { name: 'droplets', label: 'น้ำประปา' },
  { name: 'wifi', label: 'อินเทอร์เน็ต' },
  { name: 'piggy-bank', label: 'เงินออม' },
  { name: 'briefcase', label: 'เงินเดือน' },
  { name: 'laptop', label: 'ฟรีแลนซ์' },
  { name: 'trending-up', label: 'ลงทุน' },
  { name: 'gift', label: 'ของขวัญ' },
  { name: 'more-horizontal', label: 'อื่นๆ' },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  {
    name: 'อาหารและเครื่องดื่ม',
    icon: 'utensils',
    color: '#f97316',
    subcategories: ['อาหารประจำวัน', 'ของว่าง / เครื่องดื่ม', 'มื้อพิเศษ / บุฟเฟต์'],
  },
  {
    name: 'การเดินทาง',
    icon: 'car',
    color: '#3b82f6',
    subcategories: ['ค่าน้ำมันรถ', 'รถไฟฟ้า / ขนส่งสาธารณะ', 'ที่จอดรถ / ค่าทางด่วน'],
  },
  {
    name: 'ที่อยู่อาศัย',
    icon: 'home',
    color: '#8b5cf6',
    subcategories: ['ค่าเช่าห้อง / ผ่อนบ้าน', 'ค่าส่วนกลาง / ซ่อมบำรุง'],
  },
  {
    name: 'สุขภาพ',
    icon: 'heart-pulse',
    color: '#ef4444',
    subcategories: ['ค่ายา / พบแพทย์', 'เบี้ยประกันสุขภาพ'],
  },
  {
    name: 'การศึกษา',
    icon: 'graduation-cap',
    color: '#06b6d4',
    subcategories: ['หนังสือ / สื่อการเรียน', 'คอร์สเรียน / อบรม'],
  },
  {
    name: 'บันเทิง',
    icon: 'gamepad-2',
    color: '#ec4899',
    subcategories: ['สตรีมมิ่ง / ดูหนัง', 'ท่องเที่ยว / พักผ่อน'],
  },
  {
    name: 'เสื้อผ้า',
    icon: 'shirt',
    color: '#14b8a6',
    subcategories: ['เสื้อผ้า / เครื่องแต่งกาย'],
  },
  {
    name: 'สาธารณูปโภค',
    icon: 'zap',
    color: '#eab308',
    subcategories: ['ค่าไฟฟ้า', 'ค่าน้ำประปา', 'ค่าอินเทอร์เน็ต / โทรศัพท์'],
  },
  {
    name: 'ออมทรัพย์/ลงทุน',
    icon: 'piggy-bank',
    color: '#10b981',
    subcategories: ['เงินออมฉุกเฉิน', 'กองทุน / หุ้น'],
  },
  {
    name: 'อื่นๆ',
    icon: 'more-horizontal',
    color: '#64748b',
    subcategories: ['เบ็ดเตล็ด'],
  },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'เงินจากครอบครัว / ค่าขนม', icon: 'gift', color: '#f59e0b' },
  { name: 'งานพาร์ทไทม์ / สอนพิเศษ', icon: 'coffee', color: '#06b6d4' },
  { name: 'เงินเดือน', icon: 'briefcase', color: '#10b981' },
  { name: 'งานฟรีแลนซ์ / รายได้เสริม', icon: 'laptop', color: '#3b82f6' },
  { name: 'ผลตอบแทนจากการลงทุน', icon: 'trending-up', color: '#8b5cf6' },
  { name: 'ทุนการศึกษา / เงินรางวัล', icon: 'graduation-cap', color: '#10b981' },
  { name: 'รายได้อื่นๆ', icon: 'more-horizontal', color: '#64748b' },
];
