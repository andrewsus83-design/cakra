-- ── Clean slate: drop the shelved RIVL backend (empty, 0 rows) ───────────────
-- Founder decision 2026-06-19: RIVL is shelved; this project is repurposed for The Tinsel.
-- Dynamic drop catches every public.rivl_* table (CASCADE clears FKs/indexes).
do $$
declare r record;
begin
  for r in
    select tablename from pg_tables
    where schemaname = 'public' and tablename like 'rivl_%'
  loop
    execute format('drop table if exists public.%I cascade;', r.tablename);
  end loop;
end $$;
-- The Tinsel — content/config backend schema
-- Supabase project: gexprynjrnfmnadbgglk
--
-- ROLE: serve app content/config INTO the device + collect anonymous analytics.
-- INVARIANT: NO user photos, faces, or rendered video EVER. Data flows to the device;
--            user media never flows out. This preserves the "nothing leaves your phone" promise.
--
-- SECURITY (enforce from day 1 — do NOT repeat the Pascua "RLS-off + hardcoded keys" mistake):
--   * RLS ON for every table.
--   * Catalog/config: anon SELECT only. Writes via service_role (dashboard/admin) only.
--   * tinsel_events: anon INSERT only, no SELECT.
--   * Ship ONLY the anon/publishable key in the app. service_role never leaves the server.
--
-- Apply: run in the Supabase SQL editor for gexprynjrnfmnadbgglk, or connect the project
--        as an MCP server and have Claude apply it.

-- ──────────────────────────────────────────────────────────────────────────
-- Catalog (read-only to the app)
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.tinsel_formats (
  id          text primary key,                 -- 'unwrap' | 'ebook' | 'roast' | 'highlight'
  label       text not null,
  icon        text not null,                     -- emoji glyph
  tone        text not null,                     -- 'Heartfelt' | 'Funny' | 'Smart'
  badge       text,                              -- 'Signature' | 'Premium' | 'New' | null
  accent      text,                              -- hex accent
  tier        text not null default 'free'       -- 'free' | 'premium'
              check (tier in ('free','premium')),
  sort        int  not null default 0,
  enabled     boolean not null default true,
  updated_at  timestamptz not null default now()
);
create table if not exists public.tinsel_music_tracks (
  id          text primary key,
  name        text not null,
  mood        text,
  icon        text,                              -- emoji
  asset_path  text,                              -- Storage path in 'tinsel-music' (null = bundled/none)
  premium     boolean not null default false,
  sort        int not null default 0,
  enabled     boolean not null default true,
  updated_at  timestamptz not null default now()
);
create table if not exists public.tinsel_sticker_packs (
  id          text primary key,                  -- 'free' | 'premium' | future packs
  name        text not null,
  premium     boolean not null default false,
  sort        int not null default 0
);
create table if not exists public.tinsel_stickers (
  id          text primary key,
  pack_id     text not null references public.tinsel_sticker_packs(id) on delete cascade,
  glyph       text,                              -- emoji fallback
  name        text not null,
  asset_path  text,                              -- Lottie JSON in 'tinsel-stickers' (null = emoji only)
  sort        int not null default 0
);
create table if not exists public.tinsel_looks (
  id          text primary key,                  -- 'original' | 'bw' | 'sepia' | 'grain' | 'vintage'
  name        text not null,
  params      jsonb not null default '{}'::jsonb,
  premium     boolean not null default false,
  sort        int not null default 0
);
create table if not exists public.tinsel_durations (
  secs        int primary key,                   -- 10,15,20,30,45,60,90,120,180,240,300,450,600,900
  label       text not null,                     -- '0:30'
  name        text,                              -- 'Classic'
  sub         text,                              -- 'The sweet spot'
  premium     boolean not null default false,    -- true when secs > 60
  sort        int not null default 0
);
create table if not exists public.tinsel_samples (
  id            text primary key,
  title         text not null,
  format_id     text references public.tinsel_formats(id),
  category      text,                            -- 'For You' | 'Birthday' | 'Roast' | 'Love' | 'Hype' | 'Pets'
  badge         text,
  preview_path  text,                            -- Storage path in 'tinsel-samples' (optional)
  rec_lo        int,                             -- recommended photo count low
  rec_hi        int,                             -- recommended photo count high
  length_label  text,                            -- '≈ 0:24' | 'You pick the length' | '8 pages'
  premium       boolean not null default false,
  sort          int not null default 0
);
create table if not exists public.tinsel_config (
  key         text primary key,                  -- e.g. 'price_display', 'free_premium_dial', 'watermark_text'
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
-- Optional: convenience mirror of the $15 unlock. RevenueCat remains SOURCE OF TRUTH.
create table if not exists public.tinsel_entitlements (
  rc_app_user_id  text primary key,              -- RevenueCat app user id (anonymous)
  unlocked        boolean not null default false,
  source          text,                          -- 'revenuecat'
  updated_at      timestamptz not null default now()
);
-- ──────────────────────────────────────────────────────────────────────────
-- Anonymous analytics (insert-only from the app)
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.tinsel_events (
  id           bigint generated always as identity primary key,
  device_id    uuid not null,                    -- random per-install UUID; NOT a user identity, NO PII
  event        text not null,                    -- 'reveal_played' | 'export' | 'unlock' | 'remix' | ...
  props        jsonb not null default '{}'::jsonb,
  app_version  text,
  platform     text,                             -- 'ios' | 'android'
  created_at   timestamptz not null default now()
);
create index if not exists tinsel_events_event_idx on public.tinsel_events (event, created_at);
-- ──────────────────────────────────────────────────────────────────────────
-- RLS — lock everything down
-- ──────────────────────────────────────────────────────────────────────────

alter table public.tinsel_formats        enable row level security;
alter table public.tinsel_music_tracks   enable row level security;
alter table public.tinsel_sticker_packs  enable row level security;
alter table public.tinsel_stickers       enable row level security;
alter table public.tinsel_looks          enable row level security;
alter table public.tinsel_durations      enable row level security;
alter table public.tinsel_samples        enable row level security;
alter table public.tinsel_config         enable row level security;
alter table public.tinsel_entitlements   enable row level security;
alter table public.tinsel_events         enable row level security;
-- Catalog/config: anon + authenticated may READ only. (Writes: service_role, which bypasses RLS.)
do $$
declare t text;
begin
  foreach t in array array[
    'tinsel_formats','tinsel_music_tracks','tinsel_sticker_packs','tinsel_stickers',
    'tinsel_looks','tinsel_durations','tinsel_samples','tinsel_config'
  ] loop
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true);',
      t || '_read', t);
  end loop;
end $$;
-- Analytics: anon may INSERT only; nobody (anon) may read.
create policy tinsel_events_insert on public.tinsel_events
  for insert to anon, authenticated with check (true);
-- Entitlements: no anon access at all (managed server-side via Edge Function + RevenueCat webhook).
-- (No policies created => RLS denies all anon access by default. service_role bypasses RLS.)

-- ──────────────────────────────────────────────────────────────────────────
-- Storage buckets (run in dashboard or via storage API; public read)
--   tinsel-music     — music tracks (free + premium)
--   tinsel-stickers  — Lottie sticker assets
--   tinsel-samples   — optional sample-feed preview media
-- Assets are downloaded TO the device. Optional hardening: gate premium downloads
-- behind an Edge Function that checks the RevenueCat receipt and returns a signed URL.
-- ──────────────────────────────────────────────────────────────────────────
-- The Tinsel — content/config seed (run AFTER backend/schema.sql)
-- Project: gexprynjrnfmnadbgglk
-- Mirrors the reference prototype's lib.jsx (fmtMeta, TRACKS, STICKERS, DURATIONS, SAMPLES, looks).
-- Idempotent: safe to re-run (upserts). No user data — catalog/config only.

-- ── Formats ───────────────────────────────────────────────────────────────
insert into public.tinsel_formats (id, label, icon, tone, badge, accent, tier, sort) values
  ('highlight','Highlight','🎬','Smart','New','#F4C95D','free',10),
  ('unwrap','Unwrap','🎁','Heartfelt','Signature','#F4C95D','free',20),
  ('roast','Roast','😆','Funny',null,'#FF6F91','free',30),
  ('ebook','Ebook','📖','Heartfelt','Premium','#C9A0FF','premium',40)
on conflict (id) do update set
  label=excluded.label, icon=excluded.icon, tone=excluded.tone, badge=excluded.badge,
  accent=excluded.accent, tier=excluded.tier, sort=excluded.sort, updated_at=now();
-- ── Music ─────────────────────────────────────────────────────────────────
insert into public.tinsel_music_tracks (id, name, mood, icon, premium, sort) values
  ('warm-piano','Warm piano','Tender · slow build','🎹',false,10),
  ('bouncy-pop','Bouncy pop','Upbeat · playful','🎈',false,20),
  ('lofi-chill','Lo-fi chill','Mellow · cozy','🌫️',false,30),
  ('festival-drop','Festival drop','Big · beat-synced','🎆',true,40),
  ('orchestral-swell','Orchestral swell','Cinematic · grand','🎻',true,50),
  ('no-music','No music','Just sound effects','🔇',false,60)
on conflict (id) do update set
  name=excluded.name, mood=excluded.mood, icon=excluded.icon,
  premium=excluded.premium, sort=excluded.sort, updated_at=now();
-- ── Sticker packs + stickers ────────────────────────────────────────────────
insert into public.tinsel_sticker_packs (id, name, premium, sort) values
  ('free','Free pack',false,10),
  ('premium','Premium pack',true,20)
on conflict (id) do update set name=excluded.name, premium=excluded.premium, sort=excluded.sort;
insert into public.tinsel_stickers (id, pack_id, glyph, name, sort) values
  ('spk-sparkles','free','✨','Sparkles',10),
  ('spk-heart','free','❤️','Heart',20),
  ('spk-confetti','free','🎉','Confetti',30),
  ('spk-laugh','free','😂','Crying laugh',40),
  ('spk-eyes','free','👀','Googly eyes',50),
  ('spk-fire','free','🔥','Fire',60),
  ('spk-star','free','⭐','Star',70),
  ('spk-100','free','💯','100',80),
  ('spk-crown','premium','👑','Crown',90),
  ('spk-disco','premium','🪩','Disco',100),
  ('spk-teary','premium','🥹','Teary',110),
  ('spk-bullseye','premium','🎯','Bullseye',120),
  ('spk-dizzy','premium','💫','Dizzy',130),
  ('spk-trophy','premium','🏆','Trophy',140)
on conflict (id) do update set
  pack_id=excluded.pack_id, glyph=excluded.glyph, name=excluded.name, sort=excluded.sort;
-- ── Looks (filters; applied to the photo layer only) ─────────────────────────
insert into public.tinsel_looks (id, name, params, premium, sort) values
  ('original','Original','{"filter":"none"}'::jsonb,false,10),
  ('bw','B&W','{"filter":"grayscale(1) contrast(1.05)"}'::jsonb,false,20),
  ('sepia','Sepia','{"filter":"sepia(0.7) contrast(1.05)"}'::jsonb,false,30),
  ('grain','Film grain','{"filter":"contrast(1.08) brightness(1.03)","noise":true}'::jsonb,false,40),
  ('vintage','Vintage','{"filter":"sepia(0.35) contrast(1.1)","noise":true,"edgeTint":"warm"}'::jsonb,false,50)
on conflict (id) do update set
  name=excluded.name, params=excluded.params, premium=excluded.premium, sort=excluded.sort;
-- ── Highlight durations (slider stops; premium when > 60s) ───────────────────
insert into public.tinsel_durations (secs, label, name, sub, premium, sort) values
  (10,'0:10',null,null,false,10),
  (15,'0:15','Quick','Punchy & shareable',false,20),
  (20,'0:20',null,null,false,30),
  (30,'0:30','Classic','The sweet spot (default)',false,40),
  (45,'0:45',null,null,false,50),
  (60,'1:00','Story','Room to breathe',false,60),
  (90,'1:30','Extended','The full sweep',true,70),
  (120,'2:00',null,null,true,80),
  (180,'3:00',null,null,true,90),
  (240,'4:00',null,null,true,100),
  (300,'5:00',null,null,true,110),
  (450,'7:30',null,null,true,120),
  (600,'10:00',null,null,true,130),
  (900,'15:00',null,null,true,140)
on conflict (secs) do update set
  label=excluded.label, name=excluded.name, sub=excluded.sub,
  premium=excluded.premium, sort=excluded.sort;
-- ── Sample feed ──────────────────────────────────────────────────────────────
insert into public.tinsel_samples
  (id, title, format_id, category, badge, rec_lo, rec_hi, length_label, premium, sort) values
  ('highlight','A Year in 30 Seconds','highlight','For You','New',6,30,'You pick the length',false,10),
  ('mom','Happy 30th, Mom','unwrap','Birthday','Signature',12,20,'≈ 0:24',false,20),
  ('dad','Roast of Dad','roast','Roast',null,10,15,'≈ 0:18',false,30),
  ('lina','The Story of Lina','ebook','Love','Premium',8,12,'8 pages',true,40),
  ('hype','Maya Turns Pro','roast','Hype','Premium',16,24,'≈ 0:30',true,50),   -- Roast engine, Hype category tab
  ('pet','Biscuit''s First Year','unwrap','Pets',null,12,18,'≈ 0:22',false,60)
on conflict (id) do update set
  title=excluded.title, format_id=excluded.format_id, category=excluded.category,
  badge=excluded.badge, rec_lo=excluded.rec_lo, rec_hi=excluded.rec_hi,
  length_label=excluded.length_label, premium=excluded.premium, sort=excluded.sort;
-- ── Remote config (the conversion dial + display strings) ────────────────────
insert into public.tinsel_config (key, value) values
  ('price_display','{"usd":"$15","caption":"One-time. No subscription, ever."}'::jsonb),
  ('watermark','{"text":"✦ thetinsel.fun","corner":"top-right"}'::jsonb),
  ('free_premium_dial','{"premium_formats":["ebook"],"premium_tracks":["festival-drop","orchestral-swell"],"premium_sticker_packs":["premium"],"highlight_premium_over_secs":60,"free_resolution":"720p","paid_resolution":"1080p/4K"}'::jsonb)
on conflict (key) do update set value=excluded.value, updated_at=now();
