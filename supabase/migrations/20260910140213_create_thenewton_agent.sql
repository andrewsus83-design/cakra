
-- Auth account (passwordless: random hash → owner sets a real password via reset).
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous)
values ('a1b2c3d4-0000-4000-8000-000000000101','00000000-0000-0000-0000-000000000000','authenticated','authenticated','thenewton@cakra.xyz',
        crypt(gen_random_uuid()::text, gen_salt('bf')), now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('name','Tim Pemasaran The Newton','brand','The Newton by Ciputra'), false, false)
on conflict (id) do nothing;

-- Profile (the trigger may seed a row; upsert fills the real Newton data).
insert into public.profiles (id, email, name, brand, tagline, whatsapp, city, areas, specializations, price_band, target, audience, language, tone, subdomain, plan, onboarding, updated_at)
values (
  'a1b2c3d4-0000-4000-8000-000000000101', 'thenewton@cakra.xyz',
  'Tim Pemasaran The Newton', 'The Newton by Ciputra',
  'Hunian siap huni di jantung CBD Kuningan — Ciputra World 2.',
  '6285782060033', 'Jakarta',
  array['Kuningan','Setiabudi','SCBD','Jakarta Selatan'],
  array['Apartemen'], 'Rp 1–3 M',
  'Profesional muda, ekspatriat & investor', 'Profesional muda, ekspatriat, investor sewa',
  'Keduanya (ID + EN)', 'lux', 'thenewton', 'pro',
  jsonb_build_object(
    'nama','Tim Pemasaran The Newton',
    'brand','The Newton by Ciputra',
    'kota','Jakarta',
    'area','Kuningan, Setiabudi, SCBD',
    'harga','Mulai Rp 1,1 miliar',
    'target','Profesional muda, ekspatriat & investor',
    'bahasa','Keduanya (ID + EN)',
    'domain','thenewton',
    'positioning','Agen pemasaran independen',
    'tagline','Hunian siap huni di jantung CBD Kuningan — Ciputra World 2.',
    'proyek','The Newton — apartemen di Ciputra World Jakarta 2 oleh Ciputra Group, Jl. Prof. Dr. Satrio, Kuningan, Jakarta Selatan (CBD).',
    'layanan', jsonb_build_array('Penjualan unit (primary & secondary)','Sewa & manajemen sewa','Konsultasi investasi & ROI','Pendampingan KPA & legalitas','Bantuan pembeli asing (Hak Pakai/PT PMA)'),
    'keunggulan', jsonb_build_array('Lokasi CBD Kuningan','Dekat MRT Bendungan Hilir & akses tol','Unit fully furnished','Developer Ciputra tepercaya','Potensi sewa & capital gain tinggi','Pendampingan end-to-end'),
    'spesialisasi', jsonb_build_array('Apartemen'),
    'pembeli_asing','Ya',
    'bahasa_lisan', jsonb_build_array('Indonesia','English'),
    'units', jsonb_build_array(
       jsonb_build_object('tipe','Studio','luas','±24 m²','harga','mulai ±Rp 1,1 M (indikatif)'),
       jsonb_build_object('tipe','1 Kamar','luas','±41–44 m²','harga','mulai ±Rp 1,6 M (indikatif)'),
       jsonb_build_object('tipe','2 Kamar','luas','±61–64 m²','harga','mulai ±Rp 2,4 M (indikatif)')),
    'bio_cerita','The Newton adalah apartemen premium di dalam superblok Ciputra World Jakarta 2 (±4,6 ha) di jantung CBD Kuningan, Jl. Prof. Dr. Satrio, Jakarta Selatan, dikembangkan Ciputra Group. Terdiri dari dua menara (The Newton 1 & The Newton 2, ±40 lantai, 1.000+ unit) dengan tipe Studio (±24 m²), 1 Kamar (±41–44 m²), dan 2 Kamar (±61–64 m²), umumnya fully furnished. Harga indikatif mulai ±Rp 1,1–1,3 miliar. Fasilitas: kolam renang, gym, jogging track, taman bernuansa Jepang, area bermain anak, minimarket, restoran, laundry, keamanan 24 jam, dan parkir podium. Akses: ±9 menit ke MRT Bendungan Hilir, dekat LRT/TransJakarta, Lotte Shopping Avenue, Plaza Semanggi, Kuningan City, Citywalk Sudirman, RS MRCCC Siloam, serta kawasan kedutaan dan perkantoran Sudirman/SCBD/Mega Kuningan. Cocok untuk profesional muda, ekspatriat, dan investor sewa. Kami adalah agen pemasaran independen yang membantu pembeli dan investor memilih, menegosiasikan, dan menuntaskan pembelian atau penyewaan unit di The Newton.',
    'disclaimer','Agen pemasaran independen; bukan situs resmi Ciputra. Harga & ketersediaan indikatif dan dapat berubah.'
  ),
  now()
)
on conflict (id) do update set
  email=excluded.email, name=excluded.name, brand=excluded.brand, tagline=excluded.tagline, whatsapp=excluded.whatsapp,
  city=excluded.city, areas=excluded.areas, specializations=excluded.specializations, price_band=excluded.price_band,
  target=excluded.target, audience=excluded.audience, language=excluded.language, tone=excluded.tone,
  subdomain=excluded.subdomain, plan=excluded.plan, onboarding=excluded.onboarding, updated_at=now();
;
