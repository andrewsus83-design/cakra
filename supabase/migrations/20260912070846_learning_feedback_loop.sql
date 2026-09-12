-- Step 8-9: when an agent thumbs a generation, roll the count into its recipe; every 20 downs or
-- 100 ups since the last relearn, flag a level-2 learning cycle (meta.relearn_due).
create or replace function public.content_feedback_apply() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r public.content_recipes%rowtype;
  since_up int;
  since_down int;
begin
  if new.recipe_id is null then return new; end if;
  -- only act when feedback newly set or changed
  if tg_op = 'UPDATE' and coalesce(old.feedback,'') = coalesce(new.feedback,'') then return new; end if;
  if new.feedback is null then return new; end if;

  update public.content_recipes
    set up_count   = up_count   + (case when new.feedback = 'up'   then 1 else 0 end),
        down_count = down_count + (case when new.feedback = 'down' then 1 else 0 end)
    where id = new.recipe_id
    returning * into r;

  if r.id is null then return new; end if;

  since_up   := r.up_count   - coalesce((r.meta->>'relearn_up_at')::int, 0);
  since_down := r.down_count - coalesce((r.meta->>'relearn_down_at')::int, 0);

  if since_down >= 20 or since_up >= 100 then
    update public.content_recipes
      set meta = r.meta
        || jsonb_build_object('relearn_due', true)
        || jsonb_build_object('relearn_reason', case when since_down >= 20 then 'down_threshold' else 'up_threshold' end)
        || jsonb_build_object('relearn_up_at', r.up_count)
        || jsonb_build_object('relearn_down_at', r.down_count)
        || jsonb_build_object('relearn_flagged_at', now())
      where id = r.id;
  end if;
  return new;
end; $$;

create trigger trg_content_feedback after update of feedback on public.content_generations
  for each row execute function public.content_feedback_apply();

-- Admin dashboard rollup for the Learning UI.
create or replace function public.admin_learning_overview() returns jsonb
language plpgsql security definer set search_path = public as $$
declare out jsonb;
begin
  if not public.is_admin_caller() then raise exception 'not authorized'; end if;
  select jsonb_build_object(
    'sources', (select coalesce(jsonb_agg(to_jsonb(s) order by s.created_at), '[]'::jsonb) from public.learning_sources s),
    'media_total', (select count(*) from public.learning_media),
    'media_analyzed', (select count(*) from public.learning_media where status = 'analyzed'),
    'frames_total', (select count(*) from public.learning_frames),
    'recipes', (select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'persona',persona,'version',version,'level',level,'status',status,'up',up_count,'down',down_count,'relearn_due',coalesce((meta->>'relearn_due')::boolean,false)) order by created_at desc), '[]'::jsonb) from public.content_recipes),
    'generations_total', (select count(*) from public.content_generations),
    'generations_up', (select count(*) from public.content_generations where feedback = 'up'),
    'generations_down', (select count(*) from public.content_generations where feedback = 'down')
  ) into out;
  return out;
end; $$;

revoke all on function public.admin_learning_overview() from anon, authenticated;
grant execute on function public.admin_learning_overview() to authenticated;;
