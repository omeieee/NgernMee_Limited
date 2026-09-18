-- 007_harden_security_definer_functions.sql
-- Harden SECURITY DEFINER functions: set explicit search_path and revoke public/anon/authenticated execution

alter function public.handle_new_user() set search_path = '';
alter function public.seed_default_categories_for_user(uuid) set search_path = '';
alter function public.on_new_profile_seed_categories() set search_path = '';

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.seed_default_categories_for_user(uuid) from public, anon, authenticated;
revoke execute on function public.on_new_profile_seed_categories() from public, anon, authenticated;
