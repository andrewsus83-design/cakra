-- Archive the pre-existing tinsel_* backend out of `public`. Non-destructive: data + indexes +
-- sequence + RLS policies move intact into the `archive` schema (not exposed by the API).
-- Restore any table with:  alter table archive.<name> set schema public;
create schema if not exists archive;
comment on schema archive is 'Archived tinsel_* backend, moved out of public 2026-09-09 so this project serves cakra.xyz alone. Non-destructive; restore with: alter table archive.<name> set schema public;';

alter table public.tinsel_config        set schema archive;
alter table public.tinsel_durations     set schema archive;
alter table public.tinsel_entitlements  set schema archive;
alter table public.tinsel_events        set schema archive;
alter table public.tinsel_formats       set schema archive;
alter table public.tinsel_looks         set schema archive;
alter table public.tinsel_music_tracks  set schema archive;
alter table public.tinsel_samples       set schema archive;
alter table public.tinsel_sticker_packs set schema archive;
alter table public.tinsel_stickers      set schema archive;;
