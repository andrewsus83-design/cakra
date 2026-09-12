-- Daily master contents (2/day, generated centrally). Agents get personalized copies in content_pieces.
create table if not exists public.content_masters (
  id uuid primary key default gen_random_uuid(),
  day date not null default (now() at time zone 'Asia/Jakarta')::date,
  slot int not null,                         -- 1 = feed master, 2 = vertical master
  format text not null,                      -- 'feed' | 'vertical'
  topic text,
  angle text,
  content jsonb not null default '{}',       -- feed: {caption, blog_title, blog_body, hashtags[]} · vertical: {hook, script, caption, hashtags[]}
  created_at timestamptz default now(),
  unique (day, slot)
);
alter table public.content_masters enable row level security;   -- service-role only (no policies); Hub reads via an admin RPC

-- content_pieces already exists (per-agent). Add a mirror-group tag + link to the master it came from.
alter table public.content_pieces add column if not exists mirror text;          -- 'feed' | 'vertical'
alter table public.content_pieces add column if not exists master_id uuid references public.content_masters(id) on delete set null;
alter table public.content_pieces add column if not exists content jsonb default '{}';  -- structured per-platform copy

-- Admin (aal2 + allowlist) reads the masters for the Hub. Returns rows; never secrets.
create or replace function public.admin_content_masters(p_days int default 7)
returns setof public.content_masters
language sql stable security definer set search_path = '' as $$
  select * from public.content_masters
  where public.is_admin_caller()
    and day >= ((now() at time zone 'Asia/Jakarta')::date - make_interval(days => greatest(p_days,1)))
  order by day desc, slot asc;
$$;
revoke all on function public.admin_content_masters(int) from public;
grant execute on function public.admin_content_masters(int) to authenticated;;
