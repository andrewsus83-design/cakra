-- Step 3 reverse-engineering prompts (P3a video index, P3b keyframe vision, P3c caption, P3d voice).
-- Routing keys 3_caption / 3_voice added to pipeline_models so every prompt maps to a model slot.
update public.engine_config set value = jsonb_set(jsonb_set(value,
  '{steps,3_caption}', jsonb_build_object('primary', 'gemini-flash', 'role', 'Caption analysis: hook line, structure, CTA type, hashtag tiers, tone, selling angles')),
  '{steps,3_voice}',   jsonb_build_object('primary', 'gemini-flash', 'role', 'Delivery/voice profile from transcript (no personal identity): wpm, register, formulas')),
  updated_at = now()
where key = 'pipeline_models';

insert into public.prompt_templates (step_key, route_key, model, version, system_prompt, user_template, output_schema, variables, author_experts) values
('3_reverse', '3_index', 'gemini-flash', 1,
$s$Anda analis video properti (lensa CMO + Art Director). Diberi SATU video Instagram Reel (file terlampir) dan caption-nya. Uraikan video menjadi data terstruktur yang FAKTUAL: bahasa, transkrip bertimestamp, daftar scene, hook, CTA, musik, suara, dan kandidat keyframe. Jangan mengarang: bila sesuatu tidak terlihat/terdengar, isi null. Balas HANYA satu objek JSON valid sesuai OUTPUT SCHEMA, tanpa markdown.$s$,
$u$CAPTION:
{{caption}}

DURASI (detik): {{duration_s}}

OUTPUT SCHEMA:
{{output_schema}}$u$,
$j${
  "language": "id|en|mix",
  "transcript": [{"t0": 0, "t1": 0, "text": "string"}],
  "scenes": [{"t0": 0, "t1": 0, "shot_type": "exterior|interior|amenity|agent_to_camera|broll|text_card|other", "camera_motion": "static|pan|push_in|handheld|drone|fast_cuts", "subject": "string", "on_screen_text": ["string"], "is_broll": false}],
  "hook": {"t_end": 0, "type": "price_reveal|pov|question|number|before_after|other", "text": "string"},
  "cta": {"t_start": 0, "text": "string", "type": "comment_keyword|dm|wa|save_share|link|none"},
  "music": {"present": true, "genre": "string", "tempo": "slow|medium|fast"},
  "voice": {"present": true, "gender": "m|f|unknown", "style": "string", "tts_like": false},
  "keyframe_candidates": [{"t": 0, "reason": "string"}]
}$j$::jsonb,
array['caption','duration_s','output_schema'], array['cmo','art_director','prompt_engineer']),

('3_reverse', '3_vision', 'gpt-6', 1,
$s$Anda Creative + Art Director. Diberi SATU gambar (keyframe atau cover) dari video properti dan konteks scene. Baca detail visual: komposisi, color grade, tipografi overlay, elemen, transisi (bila terlihat), kualitas. Objektif, spesifik, tanpa mengarang. Balas HANYA satu objek JSON valid sesuai OUTPUT SCHEMA.$s$,
$u$SCENE CONTEXT:
{{scene_context}}

OUTPUT SCHEMA:
{{output_schema}}$u$,
$j${
  "composition": {"framing": "wide|medium|close|detail", "rule": "thirds|center|leading_lines|symmetry|other", "focal": "string"},
  "color_grade": {"temperature": "warm|neutral|cool", "contrast": "low|medium|high", "saturation": "muted|natural|vivid", "lut_guess": "string"},
  "typography": {"present": true, "font_family_guess": "string", "weight": "regular|medium|bold|black", "case": "sentence|upper|mixed", "position": "top|center|lower_third|bottom", "animation_guess": "string"},
  "overlay_elements": ["string"],
  "transition_in": "string|null", "transition_out": "string|null",
  "safe_area_ok": true,
  "visual_quality_1_10": 0,
  "notes": "string"
}$j$::jsonb,
array['scene_context','output_schema'], array['art_director','prompt_engineer']),

('3_reverse', '3_caption', 'gemini-flash', 1,
$s$Anda CMO properti Indonesia. Analisis caption Instagram: bagaimana ia menarik perhatian, terstruktur, dan mengonversi. Faktual, tanpa mengarang. Balas HANYA satu objek JSON valid sesuai OUTPUT SCHEMA.$s$,
$u$CAPTION:
{{caption}}

ENGAGEMENT (likes/comments/views, bila ada): {{engagement}}

OUTPUT SCHEMA:
{{output_schema}}$u$,
$j${
  "hook_line": "string",
  "structure": ["string"],
  "cta_type": "comment_keyword|dm|wa|save_share|link|none",
  "hashtag_count": 0,
  "hashtag_tiers": {"brand": ["string"], "kawasan": ["string"], "kategori": ["string"], "niat_beli": ["string"]},
  "emoji_density": "none|low|medium|high",
  "length_chars": 0,
  "language_mix": "id|en|mix",
  "mentions": ["string"],
  "tone": "string",
  "selling_angles": ["string"]
}$j$::jsonb,
array['caption','engagement','output_schema'], array['cmo','prompt_engineer']),

('3_reverse', '3_voice', 'gemini-flash', 1,
$s$Analisis GAYA PENYAMPAIAN dari transkrip narasi video properti — tanpa menyimpulkan identitas pribadi. Ukur tempo, register, panjang kalimat, kata pengisi, rumus pembuka/penutup, dan perangkat persuasi. Balas HANYA satu objek JSON valid sesuai OUTPUT SCHEMA.$s$,
$u$TRANSCRIPT:
{{transcript}}

DURASI (detik): {{duration_s}}

OUTPUT SCHEMA:
{{output_schema}}$u$,
$j${
  "wpm": 0,
  "register": "santai|profesional|santai-profesional|formal",
  "sentence_len": "pendek|sedang|panjang",
  "filler_words": ["string"],
  "opening_formula": "string",
  "closing_formula": "string",
  "language_mix": "id|en|mix",
  "persuasion_devices": ["string"]
}$j$::jsonb,
array['transcript','duration_s','output_schema'], array['cmo','prompt_engineer']);;
