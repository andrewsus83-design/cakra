-- Security hardening (from get_advisors + policy review).
-- 1) The outbound TRIGGER functions must NOT be callable from the API roles — only pg_cron /
--    service_role (postgres) should fire them. Anon could otherwise trigger paid Perplexity/Claude jobs.
revoke execute on function public.run_discover_prospects() from anon, authenticated;
revoke execute on function public.run_prospect_tick(uuid) from anon, authenticated;

-- 2) Admin-only prospect RPCs were granted to anon by default; align to the existing pattern
--    (authenticated only, still internally gated by is_admin_caller). Anon has no business calling them.
revoke execute on function public.admin_list_prospects(text, integer) from anon;
revoke execute on function public.admin_prospect_stats() from anon;
revoke execute on function public.admin_set_prospect_status(uuid, text) from anon;

-- preview_prospect / public_agent_site / public_all_listings / subdomain_available intentionally
-- stay anon-callable (public site render, marketplace, token preview, signup subdomain check).;
