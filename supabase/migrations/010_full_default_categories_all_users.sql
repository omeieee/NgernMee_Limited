-- 010_full_default_categories_all_users.sql
-- Seed the complete 36 categories matching Demo mode for all users (10 parent expense + 21 sub expense + 5 income)

create or replace function public.seed_default_categories_for_user(target_user_id uuid)
returns void as $$
declare
  -- Parent Expense IDs
  cat_food uuid;
  cat_transport uuid;
  cat_housing uuid;
  cat_health uuid;
  cat_education uuid;
  cat_entertainment uuid;
  cat_clothing uuid;
  cat_utilities uuid;
  cat_savings uuid;
  cat_other_exp uuid;
begin
  -- 1. EXPENSE CATEGORIES (Top-level)
  insert into public.categories (user_id, name, icon, color, type, sort_order)
  values (target_user_id, 'อาหาร', 'utensils', '#f97316', 'expense', 1)
  returning id into cat_food;

  insert into public.categories (user_id, name, icon, color, type, sort_order)
  values (target_user_id, 'เดินทาง', 'car', '#3b82f6', 'expense', 2)
  returning id into cat_transport;

  insert into public.categories (user_id, name, icon, color, type, sort_order)
  values (target_user_id, 'ที่อยู่อาศัย', 'home', '#8b5cf6', 'expense', 3)
  returning id into cat_housing;

  insert into public.categories (user_id, name, icon, color, type, sort_order)
  values (target_user_id, 'สุขภาพ', 'heart-pulse', '#ef4444', 'expense', 4)
  returning id into cat_health;

  insert into public.categories (user_id, name, icon, color, type, sort_order)
  values (target_user_id, 'การศึกษา', 'graduation-cap', '#06b6d4', 'expense', 5)
  returning id into cat_education;

  insert into public.categories (user_id, name, icon, color, type, sort_order)
  values (target_user_id, 'บันเทิง', 'gamepad-2', '#ec4899', 'expense', 6)
  returning id into cat_entertainment;

  insert into public.categories (user_id, name, icon, color, type, sort_order)
  values (target_user_id, 'เสื้อผ้า', 'shirt', '#14b8a6', 'expense', 7)
  returning id into cat_clothing;

  insert into public.categories (user_id, name, icon, color, type, sort_order)
  values (target_user_id, 'สาธารณูปโภค', 'zap', '#eab308', 'expense', 8)
  returning id into cat_utilities;

  insert into public.categories (user_id, name, icon, color, type, sort_order)
  values (target_user_id, 'ออมทรัพย์/ลงทุน', 'piggy-bank', '#10b981', 'expense', 9)
  returning id into cat_savings;

  insert into public.categories (user_id, name, icon, color, type, sort_order)
  values (target_user_id, 'อื่นๆ', 'more-horizontal', '#64748b', 'expense', 10)
  returning id into cat_other_exp;

  -- 1.1 Expense Subcategories (Full set of 21 subcategories)
  insert into public.categories (user_id, parent_id, name, icon, color, type, sort_order) values
    -- Food (3)
    (target_user_id, cat_food, 'อาหารประจำวัน', 'utensils', '#f97316', 'expense', 1),
    (target_user_id, cat_food, 'ของว่าง / เครื่องดื่ม', 'coffee', '#f97316', 'expense', 2),
    (target_user_id, cat_food, 'มื้อพิเศษ / บุฟเฟต์', 'party-popper', '#f97316', 'expense', 3),

    -- Transport (3)
    (target_user_id, cat_transport, 'ค่าน้ำมันรถ', 'fuel', '#3b82f6', 'expense', 1),
    (target_user_id, cat_transport, 'รถไฟฟ้า / ขนส่งสาธารณะ', 'train', '#3b82f6', 'expense', 2),
    (target_user_id, cat_transport, 'ที่จอดรถ / ค่าทางด่วน', 'navigation', '#3b82f6', 'expense', 3),

    -- Housing (2)
    (target_user_id, cat_housing, 'ค่าเช่าห้อง / ผ่อนบ้าน', 'home', '#8b5cf6', 'expense', 1),
    (target_user_id, cat_housing, 'ค่าส่วนกลาง / ซ่อมบำรุง', 'wrench', '#8b5cf6', 'expense', 2),

    -- Health (2)
    (target_user_id, cat_health, 'ค่ายา / พบแพทย์', 'stethoscope', '#ef4444', 'expense', 1),
    (target_user_id, cat_health, 'เบี้ยประกันสุขภาพ', 'shield-check', '#ef4444', 'expense', 2),

    -- Education (2)
    (target_user_id, cat_education, 'หนังสือ / สื่อการเรียน', 'graduation-cap', '#06b6d4', 'expense', 1),
    (target_user_id, cat_education, 'คอร์สเรียน / อบรม', 'graduation-cap', '#06b6d4', 'expense', 2),

    -- Entertainment (2)
    (target_user_id, cat_entertainment, 'สตรีมมิ่ง / ดูหนัง', 'gamepad-2', '#ec4899', 'expense', 1),
    (target_user_id, cat_entertainment, 'ท่องเที่ยว / พักผ่อน', 'gamepad-2', '#ec4899', 'expense', 2),

    -- Clothing (1)
    (target_user_id, cat_clothing, 'เสื้อผ้า / เครื่องแต่งกาย', 'shirt', '#14b8a6', 'expense', 1),

    -- Utilities (3)
    (target_user_id, cat_utilities, 'ค่าไฟฟ้า', 'zap', '#eab308', 'expense', 1),
    (target_user_id, cat_utilities, 'ค่าน้ำประปา', 'droplets', '#eab308', 'expense', 2),
    (target_user_id, cat_utilities, 'ค่าอินเทอร์เน็ต / โทรศัพท์', 'wifi', '#eab308', 'expense', 3),

    -- Savings / Investments (2)
    (target_user_id, cat_savings, 'เงินออมฉุกเฉิน', 'piggy-bank', '#10b981', 'expense', 1),
    (target_user_id, cat_savings, 'กองทุน / หุ้น', 'trending-up', '#10b981', 'expense', 2),

    -- Other (1)
    (target_user_id, cat_other_exp, 'เบ็ดเตล็ด', 'more-horizontal', '#64748b', 'expense', 1);

  -- 2. INCOME CATEGORIES (5 Top-level)
  insert into public.categories (user_id, name, icon, color, type, sort_order) values
    (target_user_id, 'เงินเดือน', 'briefcase', '#10b981', 'income', 1),
    (target_user_id, 'งานฟรีแลนซ์ / รายได้เสริม', 'laptop', '#06b6d4', 'income', 2),
    (target_user_id, 'ผลตอบแทนจากการลงทุน', 'trending-up', '#8b5cf6', 'income', 3),
    (target_user_id, 'ของขวัญ / โบนัส', 'gift', '#ec4899', 'income', 4),
    (target_user_id, 'รายได้อื่นๆ', 'more-horizontal', '#64748b', 'income', 5);
end;
$$ language plpgsql security definer set search_path = '';

-- Trigger update on profiles
create or replace function public.on_new_profile_seed_categories()
returns trigger as $$
begin
  perform public.seed_default_categories_for_user(new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- RPC for self-initializing or upgrading categories
create or replace function public.initialize_my_categories()
returns text as $$
declare
  cat_count integer;
  tx_count integer;
begin
  select count(*) into cat_count
  from public.categories
  where user_id = auth.uid();

  select count(*) into tx_count
  from public.transactions
  where user_id = auth.uid();

  -- If user has 0 categories, seed immediately
  if cat_count = 0 then
    perform public.seed_default_categories_for_user(auth.uid());
    return 'seeded';
  end if;

  -- If user has partial categories (< 30) and no transactions, upgrade to full set
  if cat_count < 30 and tx_count = 0 then
    delete from public.categories where user_id = auth.uid();
    perform public.seed_default_categories_for_user(auth.uid());
    return 'upgraded_to_full';
  end if;

  return 'already_exists';
end;
$$ language plpgsql security definer set search_path = '';

grant execute on function public.initialize_my_categories() to authenticated;
grant execute on function public.initialize_my_categories() to anon;

-- Apply to all existing profiles that have no transactions
do $$
declare
  prof record;
  tx_cnt integer;
begin
  for prof in select id from public.profiles loop
    select count(*) into tx_cnt from public.transactions where user_id = prof.id;
    if tx_cnt = 0 then
      delete from public.categories where user_id = prof.id;
      perform public.seed_default_categories_for_user(prof.id);
    end if;
  end loop;
end;
$$;
