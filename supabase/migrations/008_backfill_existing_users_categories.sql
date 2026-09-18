-- 008_backfill_existing_users_categories.sql
-- Backfill default categories for existing users who have zero categories
-- (users who registered before migration 006 was applied)

do $$
declare
  target_profile record;
begin
  for target_profile in
    select p.id
    from public.profiles p
    left join public.categories c on c.user_id = p.id
    where c.id is null
    group by p.id
  loop
    perform public.seed_default_categories_for_user(target_profile.id);
  end loop;
end;
$$;
