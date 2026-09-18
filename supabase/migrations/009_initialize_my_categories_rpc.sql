-- 009_initialize_my_categories_rpc.sql
-- Safe RPC callable by authenticated users to self-seed default categories
-- Seeds only if the caller currently has 0 categories (idempotent)

create or replace function public.initialize_my_categories()
returns text as $$
declare
  cat_count integer;
begin
  -- Count how many categories the current user already has
  select count(*) into cat_count
  from public.categories
  where user_id = auth.uid();

  if cat_count > 0 then
    return 'already_exists';
  end if;

  -- Seed the full default category tree
  perform public.seed_default_categories_for_user(auth.uid());
  return 'seeded';
end;
$$ language plpgsql security definer set search_path = '';

-- Grant execution ONLY to authenticated users
grant execute on function public.initialize_my_categories() to authenticated;
