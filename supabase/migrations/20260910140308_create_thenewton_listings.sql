
insert into public.listings (agent_id, title, slug, status, price, price_label, currency, location, area, beds, baths, size_m2, description, images, public_featured, created_at, updated_at)
values
('a1b2c3d4-0000-4000-8000-000000000101','The Newton — Studio (±24 m²)','the-newton-studio','dijual',1100000000,'Mulai Rp 1,1 M (indikatif)','IDR','Ciputra World 2, Kuningan, Jakarta Selatan','Kuningan',0,1,24,
 'Studio ±24 m² fully furnished di The Newton, Ciputra World Jakarta 2 — jantung CBD Kuningan. Praktis dan efisien untuk profesional muda atau disewakan (potensi yield tinggi). ±9 menit ke MRT Bendungan Hilir, dekat Sudirman, SCBD & Mega Kuningan. Fasilitas: kolam renang, gym, taman, keamanan 24 jam.',
 jsonb_build_array(
   (select storage_path from public.assets where id='a82e012e-4746-46ad-9e10-028a18151ed9'),
   (select storage_path from public.assets where id='d08c2bd1-36cd-4318-be5d-bb971c29d779'),
   (select storage_path from public.assets where id='27e93d47-d9c8-46b4-9834-24b1f8a86891')),
 false, now(), now()),

('a1b2c3d4-0000-4000-8000-000000000101','The Newton — 1 Kamar (±41–44 m²)','the-newton-1br','dijual',1600000000,'Mulai Rp 1,6 M (indikatif)','IDR','Ciputra World 2, Kuningan, Jakarta Selatan','Kuningan',1,1,44,
 'Unit 1 kamar ±41–44 m² fully furnished di The Newton, Ciputra World 2 Kuningan. Cocok untuk pasangan muda, ekspatriat, atau investasi sewa jangka panjang di kawasan CBD. Terhubung ke mal & perkantoran Sudirman/SCBD; akses MRT, LRT & TransJakarta. Developer Ciputra tepercaya.',
 jsonb_build_array(
   (select storage_path from public.assets where id='5194404a-9214-46f1-b011-0c77fd48b211'),
   (select storage_path from public.assets where id='5b2219da-c4dc-4ea5-8764-3497c227484e'),
   (select storage_path from public.assets where id='9b86bf11-5d11-4fb9-baca-db85dc4922dd')),
 false, now(), now()),

('a1b2c3d4-0000-4000-8000-000000000101','The Newton — 2 Kamar (±61–64 m²)','the-newton-2br','dijual',2400000000,'Mulai Rp 2,4 M (indikatif)','IDR','Ciputra World 2, Kuningan, Jakarta Selatan','Kuningan',2,2,64,
 'Unit 2 kamar ±61–64 m² fully furnished di The Newton, Ciputra World Jakarta 2 — hunian keluarga di jantung CBD Kuningan. Ruang lega, pemandangan kota, dan akses langsung ke fasilitas superblok Ciputra World: mal, hotel, perkantoran. Ideal untuk end-user maupun investor.',
 jsonb_build_array(
   (select storage_path from public.assets where id='56322ba9-25af-410a-a502-0dc7cf2c19e8'),
   (select storage_path from public.assets where id='666d38a8-52da-41ed-bf1e-9a6e964b2f50'),
   (select storage_path from public.assets where id='7b016f16-9d43-4dc1-8ce4-6f0d17bfa03a')),
 false, now(), now());
;
