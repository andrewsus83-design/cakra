-- cakra platform — initial schema (v1). Additive: coexists with the pre-existing tinsel_* backend.

-- ---------- enums ----------
create type plan_t           as enum ('trial','pro','business','studio');
create type listing_status_t as enum ('draft','dijual','disewa','terjual','tersewa','diarsipkan');
create type content_type_t   as enum ('artikel','reels','post','youtube','story');
create type content_status_t as enum ('draft','ready','scheduled','published','rejected');
create type job_status_t     as enum ('queued','researching','composing','rendering','done','error');
create type lead_status_t    as enum ('baru','dihubungi','viewing','nego','closing','batal');
create type asset_type_t     as enum ('image','video','audio','voice');

-- ---------- profiles (one row per agent, keyed to auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  brand text,
  tagline text,
  whatsapp text,
  city text,
  areas text[] default '{}',
  specializations text[] default '{}',
  price_band text,
  target text,
  audience text,
  language text default 'id',
  tone text,
  theme text default 'light',
  palette text,
  font text,
  subdomain text unique,
  custom_domain text,
  plan plan_t default 'trial',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- listings ----------
create table listings (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  slug text,
  status listing_status_t default 'draft',
  price numeric,
  price_label text,
  currency text default 'IDR',
  location text,
  area text,
  beds int, baths int, size_m2 numeric,
  description text,
  images jsonb default '[]',
  rating numeric,
  views int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on listings(agent_id);

-- ---------- assets (global library + agent-owned) ----------
create table assets (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references profiles(id) on delete cascade,
  type asset_type_t not null,
  format text,
  storage_path text not null,
  title text,
  area text,
  source text,
  duration_s numeric,
  meta jsonb default '{}',
  created_at timestamptz default now()
);
create index on assets(agent_id);
create index on assets(area);

-- ---------- content pipeline ----------
create table content_jobs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references profiles(id) on delete cascade,
  status job_status_t default 'queued',
  topic text,
  angle text,
  research jsonb default '{}',
  result_content_id uuid,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on content_jobs(agent_id);

create table content_pieces (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references profiles(id) on delete cascade,
  job_id uuid references content_jobs(id) on delete set null,
  type content_type_t default 'artikel',
  title text,
  body text,
  status content_status_t default 'draft',
  platform text,
  fivew1h jsonb default '{}',
  kpi jsonb default '{}',
  seo_score int, geo_score int, social_score int,
  source_url text,
  scheduled_at timestamptz,
  published_at timestamptz,
  shared boolean default false,
  downloaded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on content_pieces(agent_id);

-- ---------- video render jobs ----------
create table video_jobs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references profiles(id) on delete cascade,
  listing_id uuid references listings(id) on delete set null,
  orient text default '9:16',
  status job_status_t default 'queued',
  progress int default 0,
  scene_plan jsonb default '{}',
  output_path text,
  duration_s numeric,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on video_jobs(agent_id);

-- ---------- voices (3 permanent per agent, ElevenLabs) ----------
create table voices (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references profiles(id) on delete cascade,
  name text,
  description text,
  provider text default 'elevenlabs',
  provider_voice_id text,
  locked boolean default true,
  created_at timestamptz default now()
);
create index on voices(agent_id);

-- ---------- leads / prospek ----------
create table leads (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references profiles(id) on delete cascade,
  name text,
  source text,
  listing_id uuid references listings(id) on delete set null,
  message text,
  contact jsonb default '{}',
  status lead_status_t default 'baru',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on leads(agent_id);

-- ---------- presence score history (Skor Cakra) ----------
create table presence_scores (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references profiles(id) on delete cascade,
  website int, listing int, konten int, seo int, geo int, social int, reputasi int,
  total int,
  computed_at timestamptz default now()
);
create index on presence_scores(agent_id);

-- ---------- subscriptions / billing ----------
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references profiles(id) on delete cascade,
  plan plan_t default 'trial',
  status text default 'trialing',
  current_period_end timestamptz,
  provider text,
  provider_ref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on subscriptions(agent_id);

-- ---------- newsletter subscribers ----------
create table newsletter (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  created_at timestamptz default now()
);

-- ---------- updated_at trigger (namespaced fn to stay clear of any future tinsel fn) ----------
create or replace function cakra_set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
do $$ declare t text;
begin
  foreach t in array array['profiles','listings','content_jobs','content_pieces','video_jobs','leads','subscriptions']
  loop execute format('create trigger trg_%s_updated before update on %I for each row execute function cakra_set_updated_at();', t, t);
  end loop;
end $$;

-- ---------- auto-create a profile row when a user signs up ----------
create or replace function cakra_handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created_cakra after insert on auth.users
  for each row execute function cakra_handle_new_user();

-- ---------- Row Level Security ----------
alter table profiles         enable row level security;
alter table listings         enable row level security;
alter table assets           enable row level security;
alter table content_jobs     enable row level security;
alter table content_pieces   enable row level security;
alter table video_jobs       enable row level security;
alter table voices           enable row level security;
alter table leads            enable row level security;
alter table presence_scores  enable row level security;
alter table subscriptions    enable row level security;
alter table newsletter       enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own listings"      on listings        for all using (auth.uid() = agent_id) with check (auth.uid() = agent_id);
create policy "own content_jobs"  on content_jobs    for all using (auth.uid() = agent_id) with check (auth.uid() = agent_id);
create policy "own content"       on content_pieces  for all using (auth.uid() = agent_id) with check (auth.uid() = agent_id);
create policy "own video_jobs"    on video_jobs      for all using (auth.uid() = agent_id) with check (auth.uid() = agent_id);
create policy "own voices"        on voices          for all using (auth.uid() = agent_id) with check (auth.uid() = agent_id);
create policy "own leads"         on leads           for all using (auth.uid() = agent_id) with check (auth.uid() = agent_id);
create policy "own scores"        on presence_scores for all using (auth.uid() = agent_id) with check (auth.uid() = agent_id);
create policy "own subs"          on subscriptions   for select using (auth.uid() = agent_id);

create policy "read assets"        on assets for select using (agent_id is null or auth.uid() = agent_id);
create policy "insert own assets"  on assets for insert with check (auth.uid() = agent_id);
create policy "update own assets"  on assets for update using (auth.uid() = agent_id);
create policy "delete own assets"  on assets for delete using (auth.uid() = agent_id);

create policy "public listings"    on listings       for select using (status in ('dijual','disewa'));
create policy "public content"     on content_pieces for select using (status = 'published');

create policy "public subscribe"   on newsletter for insert with check (true);;
