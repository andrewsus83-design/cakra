-- Versioned prompt store (prompts are data, never hardcoded in edge functions) + bootstrap recipe v1
-- so the Editorial Studio can generate BEFORE the learning corpus exists. v1 is expert-authored via
-- Claude-MCP (CMO + Art Director + Prompt Engineer lenses); learned v2 replaces it after ingestion.

create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  step_key text not null,
  route_key text not null,
  model text not null,
  version int not null default 1,
  system_prompt text not null,
  user_template text not null,
  output_schema jsonb not null default '{}'::jsonb,
  variables text[] not null default '{}',
  author_experts text[] not null default '{}',
  status text not null default 'active' check (status in ('draft','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (route_key, model, version)
);
alter table public.prompt_templates enable row level security;
create policy prompt_templates_admin on public.prompt_templates for all using (public.is_admin_caller()) with check (public.is_admin_caller());
revoke all on public.prompt_templates from anon, authenticated;
create trigger trg_touch_prompt_templates before update on public.prompt_templates for each row execute function public.learn_touch_updated_at();

-- P6a — Step 6 compose (Claude Sonnet default; same template serves Opus premium).
insert into public.prompt_templates (step_key, route_key, model, version, system_prompt, user_template, output_schema, variables, author_experts) values
('6_generate', '6_7_compose', 'claude-sonnet-5', 1,
$sys$Anda adalah tim editorial cakra untuk konten properti Indonesia — tiga lensa bekerja bersamaan:
- CMO: hook yang berhenti-scroll, pesan yang menjual, CTA yang jelas.
- Creative + Art Director: urutan scene yang sinematik, overlay teks rapi, komposisi premium.
- Prompt Engineer: keluaran presisi sesuai schema, tanpa isian kosong.

TUGAS: susun SATU konten video pendek 9:16 (Reels/TikTok/Shorts) + caption untuk SATU properti, dengan MENGIKUTI RESEP yang diberikan (pola hook, template scene, gaya overlay, template caption, pustaka CTA, profil musik & suara). Pilih pola hook yang paling cocok dengan fakta properti.

ATURAN KERAS:
1. Gunakan HANYA fakta yang diberikan di FAKTA LISTING dan GEO. Jangan mengarang harga, angka, fasilitas, jarak, atau nama. Jika sebuah fakta tidak ada, jangan disebut.
2. Harga selalu berlabel "indikatif" bila disebut.
3. Jika agen adalah pemasar independen, jangan klaim afiliasi resmi pengembang.
4. Bahasa: sesuai LANG (id = Bahasa Indonesia natural, code-switching ringan seperti "fully furnished" boleh; en = English). Tanpa "halo semua".
5. Hook <= 12 kata, tayang 0–3 detik. on_screen_text <= 6 kata per scene. Total durasi sesuai duration_p50_p90 resep.
6. Hormati daftar do_not di resep.
7. Keluaran HARUS satu objek JSON valid yang dimulai '{' dan diakhiri '}', tanpa markdown, tanpa teks lain, persis sesuai OUTPUT SCHEMA.$sys$,
$usr$RESEP (ikuti):
{{recipe_json}}

PROFIL AGEN:
{{agent_profile}}

FAKTA LISTING (satu-satunya sumber fakta):
{{listing_facts}}

GEO / KAWASAN:
{{geo}}

ASET VISUAL TERSEDIA (ringkasan gambar/video yang diunggah agen — gunakan sebagai asset_ref):
{{images_summary}}

LANG: {{lang}}

OUTPUT SCHEMA (isi semua field):
{{output_schema}}$usr$,
$schema${
  "hook": "string, <=12 kata",
  "hook_pattern": "salah satu pattern dari recipe.hook_patterns",
  "script": [{"scene_no": 1, "t0": 0, "t1": 3, "voiceover": "string", "on_screen_text": "string <=6 kata", "shot_instruction": "string", "asset_ref": "nama/indeks aset atau null"}],
  "caption": {"id": "string 350-700 char", "en": "string atau null"},
  "hashtags": ["6-10 item"],
  "thumbnail_text": "string <=5 kata",
  "cta": {"type": "comment_keyword|dm|wa|save_share", "text": "string"},
  "tts_text": "narasi lengkap untuk TTS, satu paragraf",
  "edit_plan": {"duration_s": 0, "aspect": "9:16", "music": {"genre": "string", "bpm": 0, "energy": "string"}, "transitions": "string", "pacing": "string"}
}$schema$::jsonb,
array['recipe_json','agent_profile','listing_facts','geo','images_summary','lang','output_schema'],
array['cmo','art_director','prompt_engineer']);

-- Bootstrap recipe v1 (active). Real, expert-authored parameters — not dummy. Replaced by learned v2.
insert into public.content_recipes (name, persona, scope, version, level, params, status, meta) values
('Bootstrap v1 — properti Indonesia short-form', 'blend', '{"sources":[],"note":"expert-authored bootstrap"}'::jsonb, 1, 1,
$p${
  "schema_version": 1,
  "format_mix": {"reel_9x16": 0.7, "carousel": 0.2, "story": 0.1},
  "duration_p50_p90": {"p50": 32, "p90": 45},
  "hook_patterns": [
    {"pattern": "price_reveal_location", "freq": 0.25, "template": "{unit} {harga indikatif} di {kawasan} — {kejutan}", "example": "Studio Rp1,1 M di jantung CBD Kuningan — dan ini yang nggak diceritakan brosur."},
    {"pattern": "pov_walkthrough", "freq": 0.2, "template": "POV: {situasi} di {kawasan}", "example": "POV: 9 menit dari MRT, kamu sudah di rumah."},
    {"pattern": "question_objection", "freq": 0.2, "template": "{keberatan}? {jawaban}", "example": "Beli apartemen CBD harus Rp3 M? Nggak harus."},
    {"pattern": "number_hook", "freq": 0.2, "template": "{angka} {hal} yang bikin {unit} ini beda", "example": "3 alasan unit ini disewa dalam seminggu."},
    {"pattern": "before_after", "freq": 0.15, "template": "Kosong → siap huni: {unit}", "example": "Dari unit kosong jadi siap huni — lihat bedanya."}
  ],
  "scene_templates": [
    {"name": "exterior_hook", "t": "0-3", "shot": "eksterior/tower golden hour atau drone", "overlay": "brand + hook", "motion": "slow push-in"},
    {"name": "access_proof", "t": "3-9", "shot": "jalan ke MRT/landmark, overlay timer atau peta", "overlay": "'{x} menit ke {landmark}'", "motion": "handheld walk"},
    {"name": "interior_reveal", "t": "9-20", "shot": "pintu buka → wide pan → 2 detail (dapur, view jendela)", "overlay": "'{luas} m² · fully furnished'", "motion": "smooth pan"},
    {"name": "amenities", "t": "20-28", "shot": "kolam/gym/taman quick cuts 1.5 dtk", "overlay": "nama fasilitas", "motion": "fast cuts"},
    {"name": "numbers", "t": "28-35", "shot": "interior statis + angka besar", "overlay": "harga indikatif + potensi sewa", "motion": "hold"},
    {"name": "cta_agent", "t": "35-42", "shot": "agen ke kamera atau brand card", "overlay": "CTA + WA", "motion": "hold"}
  ],
  "overlay_style": {"font": "bold sans (Manrope/Inter)", "case": "sentence", "position": "lower-third atau center-safe", "max_words": 6, "color": "putih di atas scrim gelap, emas untuk angka", "animation": "pop-in 200ms, tanpa bounce"},
  "caption_template": {"structure": ["hook 1 baris", "3-5 fakta kunci", "angka penting (harga indikatif, potensi sewa)", "disclaimer independen bila perlu", "CTA + keyword komen"], "length_chars": [350, 700], "emoji_density": "rendah", "language": "id, EN opsional", "hashtags": {"count": [6, 10], "tiers": ["brand", "kawasan", "kategori", "niat beli"]}},
  "cta_library": [
    {"type": "comment_keyword", "text": "Komen '{KEYWORD}' untuk shortlist unit"},
    {"type": "dm", "text": "DM untuk unit tersedia & simulasi KPA"},
    {"type": "wa", "text": "WhatsApp {first} — link di bio"},
    {"type": "save_share", "text": "Simpan dulu, share ke partner"}
  ],
  "music_profile": {"energy": "medium-high", "genre": "lofi-house / cinematic pop", "bpm": [90, 118], "trending_ok": true, "vo_ducking": true},
  "voice_profile": {"register": "santai-profesional, orang pertama", "wpm": [140, 165], "sentence_len": "pendek", "opening": "langsung ke hook", "closing": "CTA satu kalimat", "language": "id dengan istilah EN ringan (fully furnished, turnkey)"},
  "do_not": ["jangan karang harga/angka/fasilitas di luar fakta listing", "jangan klaim afiliasi resmi pengembang jika agen independen", "jangan janji ROI pasti", "jangan pakai foto vila/Bali untuk apartemen Jakarta", "caption > 900 karakter", "lebih dari 10 hashtag", "musik berhak cipta tanpa lisensi"],
  "evidence": {"source": "bootstrap expert-authored (CMO + Art Director + Prompt Engineer via Claude-MCP)", "learned_from_media": 0, "note": "digantikan resep v2 hasil pembelajaran setelah ingestion + analisis"}
}$p$::jsonb,
'active', '{"bootstrap": true, "authored_by": "claude-mcp"}'::jsonb);;
