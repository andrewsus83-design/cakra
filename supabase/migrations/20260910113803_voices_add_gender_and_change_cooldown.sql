-- Voice picks: 1 female + 1 male per agent, changeable once per 30 days.
alter table public.voices add column if not exists gender text;
alter table public.voices add column if not exists changed_at timestamptz;  -- null = never changed since initial pick; set on each swap

-- Backfill gender from the description prefix we stored ("female · …" / "male · …") if any rows exist.
update public.voices set gender = case
  when lower(coalesce(description,'')) like 'female%' or lower(coalesce(description,'')) like '%perempuan%' then 'female'
  when lower(coalesce(description,'')) like 'male%'   or lower(coalesce(description,'')) like '%laki%'      then 'male'
  else gender end
where gender is null;

-- At most one voice per gender per agent (the two brand slots).
create unique index if not exists voices_agent_gender_uidx on public.voices (agent_id, gender) where gender is not null;;
