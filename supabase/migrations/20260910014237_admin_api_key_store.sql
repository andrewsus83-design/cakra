-- Admin-managed API key store. Secret keys are encrypted in Supabase Vault; public keys are also
-- mirrored to public_config (anon-readable) so the static frontend can read them at runtime.
-- Only an admin with 2FA (JWT aal=aal2 + email in admin_emails) may write — enforced inside the
-- SECURITY DEFINER functions via the caller's JWT. No values are ever returned to clients.

create table if not exists public.admin_emails (email text primary key);
insert into public.admin_emails(email) values ('andrewsus83@gmail.com') on conflict do nothing;
alter table public.admin_emails enable row level security;              -- no policies → not API-readable

create table if not exists public.public_config (key text primary key, value text, updated_at timestamptz default now());
alter table public.public_config enable row level security;
drop policy if exists "public read config" on public.public_config;
create policy "public read config" on public.public_config for select using (true);  -- public values only

create table if not exists public.app_secret_names (name text primary key, label text, is_public boolean default false);
insert into public.app_secret_names(name, label, is_public) values
  ('ANTHROPIC_API_KEY','Anthropic (Claude)',false),
  ('OPENAI_API_KEY','OpenAI (GPT)',false),
  ('GEMINI_API_KEY','Gemini / Nano Banana / Kling',false),
  ('PERPLEXITY_API_KEY','Perplexity',false),
  ('RESEND_API_KEY','Resend',false),
  ('ELEVENLABS_API_KEY','ElevenLabs',false),
  ('SERPAPI_API_KEY','SerpAPI',false),
  ('FIRECRAWL_API_KEY','Firecrawl',false),
  ('KLING_API_KEY','Kling',false),
  ('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY','Google Maps Places',true),
  ('NEXT_PUBLIC_GA_ID','GA4 Measurement ID',true)
on conflict (name) do update set label = excluded.label, is_public = excluded.is_public;
alter table public.app_secret_names enable row level security;         -- managed server-side only

create or replace function public.is_admin_caller() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt()->>'aal','') = 'aal2'
     and exists (select 1 from public.admin_emails a where a.email = lower(coalesce(auth.jwt()->>'email','')));
$$;

create or replace function public.admin_set_secret(p_name text, p_value text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_is_public boolean;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  select is_public into v_is_public from public.app_secret_names where name = p_name;
  if v_is_public is null then raise exception 'unknown key: %', p_name; end if;
  if coalesce(btrim(p_value),'') = '' then raise exception 'empty value'; end if;
  select id into v_id from vault.secrets where name = p_name;
  if v_id is null then perform vault.create_secret(p_value, p_name, 'cakra managed api key');
  else perform vault.update_secret(v_id, p_value); end if;
  if v_is_public then
    insert into public.public_config(key, value, updated_at) values (p_name, p_value, now())
    on conflict (key) do update set value = excluded.value, updated_at = now();
  end if;
end; $$;

create or replace function public.admin_secret_status()
returns table(name text, label text, is_set boolean, is_public boolean)
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  return query
    select n.name, n.label,
           exists(select 1 from vault.secrets s where s.name = n.name) as is_set,
           n.is_public
    from public.app_secret_names n order by n.is_public, n.name;
end; $$;

revoke all on function public.is_admin_caller() from public;
revoke all on function public.admin_set_secret(text,text) from public;
revoke all on function public.admin_secret_status() from public;
grant execute on function public.admin_set_secret(text,text) to authenticated;
grant execute on function public.admin_secret_status() to authenticated;;
