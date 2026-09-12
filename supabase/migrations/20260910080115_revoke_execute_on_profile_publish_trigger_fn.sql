-- on_profile_publish() is a trigger function; it must not be invocable via PostgREST RPC.
-- Trigger execution runs as the table owner and is unaffected by these EXECUTE grants.
revoke execute on function public.on_profile_publish() from anon, authenticated, public;;
