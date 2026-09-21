# Checklist: Quick & Easy Transaction Recording Enhancements

เป้าหมาย: ใช้งานง่ายและบันทึกข้อมูลได้ไว ไม่เสีย context

---

## 1. Requirement Summary (สรุปความต้องการ)

- [x] **1. รายละเอียดรายการ (Transaction Description)**
  - [x] ไม่บังคับกรอก (Optional): หากผู้ใช้ไม่กรอก ให้บันทึกเป็น `"อื่นๆ"` อัตโนมัติ และไม่มี validation error สีแดง
  - [x] จดจำคำที่เคยใส่ไว้ (Description Memory): บันทึกประวัติคำอธิบายรายการจากประวัติการทำรายการ (และจำหมวดหมู่ที่คู่กันด้วย)
  - [x] แนะนำคำอัตโนมัติ (Autocomplete & Quick Select): เมื่อพิมพ์หรือโฟกัสช่องรายละเอียด สามารถกดเลือกคำที่เคยบันทึกไว้ได้ทันที โดยไม่ต้องพิมพ์ใหม่
  - [x] เลือกแล้วจำหมวดหมู่คู่กัน: เมื่อกดเลือกคำแนะนำ ระบบจะเลือกหมวดหมู่ (`category_id`) ที่เคยคู่กับคำนั้นให้โดยอัตโนมัติ

- [x] **2. จัดเรียงหมวดหมู่ตามโครงสร้าง (Category Hierarchy Sorting)**
  - [x] เรียงลำดับรายการหมวดหมู่ใน `CategoryPicker` ให้ตรงตาม `โครงสร้างหมวดหมู่รายจ่าย` และ `โครงสร้างหมวดหมู่รายรับ` (ตาม `CategoryTree` / Screenshot 132702)
  - [x] เรียงแบบ Depth-First Traversal ตาม `sort_order` (หมวดหมู่หลัก -> หมวดหมู่ย่อย -> หมวดหมู่ย่อยระดับถัดไป) ทั้งรายจ่ายและรายรับ
  - [x] แสดงผลระดับชั้น (Hierarchy indentation / visual tree) ใน `CategoryPicker` ให้ดูง่าย ชัดเจน เลือกได้รวดเร็ว

- [x] **3. Quality & Architecture Guardrails**
  - [x] Deep Module Pattern: ฟังก์ชัน validation และ suggestion อยู่ใน `transaction-draft` package
  - [x] Seams & Boundaries: ตรวจสอบด้วย `npm run lint:boundaries` (0 violations)
  - [x] Automated Testing (TDD): เขียนและอัปเดตชุดทดสอบ Vitest ใน `src/packages/transaction-draft/tests/` และ `src/hooks/useCategories.test.ts`
  - [x] ทดสอบทั้งระบบด้วย `npm test` ให้ผ่าน 100% (36/36 tests passed)
  - [x] Build ผ่านสมบูรณ์ด้วย `npm run build` (tsc -b && vite build)

---

## 2. Implementation Steps (ขั้นตอนการดำเนินงาน)

### Phase 1: Deep Module `transaction-draft` Updates & TDD

- [x] อัปเดต `transactionDraftSchema` ให้ `description` เป็น optional (trim แล้วถ้าว่างให้แปลงเป็น `"อื่นๆ"`)
- [x] อัปเดต `buildTransactionPayload` ให้ default เป็น `'อื่นๆ'` หาก `description` ว่าง
- [x] สร้างฟังก์ชัน `extractDescriptionSuggestions` ใน `transaction-draft` เพื่อวิเคราะห์ประวัติรายการและจับคู่คำกับหมวดหมู่ (`category_id`) ที่ใช้บ่อย/ล่าสุด พร้อมจัดอันดับ prefix match
- [x] เขียน Unit Tests ตรวจสอบ:
  - Validation ผ่านเมื่อ description ว่าง
  - Payload ได้รับค่า `'อื่นๆ'` เมื่อ description ว่าง
  - Suggestions สามารถดึงคำที่เคยใช้พร้อมหมวดหมู่ที่ตรงกัน
- [x] ทดสอบ vitest ใน `src/packages/transaction-draft` ผ่าน 15/15 tests

### Phase 2: Category Tree Hierarchy Ordering in `useCategories` & `CategoryPicker`

- [x] เพิ่มฟังก์ชัน `buildCategoryTree`, `flattenCategoryTree`, `getOrderedCategories` ใน `useCategories` ที่ traverse ต้นไม้แบบ depth-first ตาม `sort_order` พร้อมคำนวณ `depth` (ระดับความลึก 0, 1, 2)
- [x] อัปเดต `CategoryPicker.tsx`:
  - ดึงรายการหมวดหมู่ที่เรียงตามโครงสร้างหมวดหมู่ทั้งรายจ่าย (`expense`) และรายรับ (`income`)
  - แสดงผลใน Dropdown โดยมี visual indentation พร้อมเส้นเชื่อม `└─` ตามระดับชั้น
  - รองรับการค้นหา (search) และแสดง full breadcrumb path ได้อย่างถูกต้อง
- [x] เขียน Unit Tests ตรวจสอบการเรียงลำดับหมวดหมู่ตามโครงสร้างใน `src/hooks/useCategories.test.ts`

### Phase 3: TransactionForm & Quick Description UI Integration

- [x] อัปเดต `TransactionForm.tsx`:
  - ลบ error บังคับกรอกรายละเอียดรายการ (แสดงคำอธิบาย "(ไม่บังคับ - เริ่มต้น 'อื่นๆ')")
  - เปลี่ยน placeholder ให้สื่อสารชัดเจน: `"เช่น ค่าข้าวมันไก่, เงินเดือน, กาแฟ (ถ้าไม่ระบุจะเป็น อื่นๆ)"`
  - เพิ่ม Autocomplete Dropdown แสดงคำที่เคยบันทึกพร้อมแท็กหมวดหมู่
  - เพิ่ม Quick Suggestion Chips ใต้ช่องรายละเอียดสำหรับการแตะเลือกครั้งเดียว (1-tap fill)
  - เมื่อผู้ใช้กดเลือกคำแนะนำ:
    1. กรอกข้อความในช่องรายละเอียด
    2. เปลี่ยนหมวดหมู่ (`category_id`) เป็นหมวดหมู่ที่จำไว้โดยอัตโนมัติ
- [x] ทดสอบการทำงานร่วมกันใน `DashboardPage` (Modal บันทึกรายการด่วน) และ `TransactionsPage`

### Phase 4: Verification & Boundary Linting

- [x] รัน `npm test` เพื่อตรวจสอบ unit tests ทั้งหมด (36/36 tests ผ่านทั้งหมด)
- [x] รัน `npm run lint:boundaries` เพื่อตรวจเช็คความถูกต้องของ architectural boundaries (0 violations)
- [x] รัน `npm run build` ตรวจสอบ Type safety และการคอมไพล์สำหรับ Production (ผ่าน 100%)
- [x] ตรวจสอบความถูกต้องตามภาพ Screenshot ทั้ง 3 ภาพและเกณฑ์ที่ผู้ใช้กำหนด
