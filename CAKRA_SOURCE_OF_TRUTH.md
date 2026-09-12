# cakra.xyz — Source of Truth

> Canonical reference for cakra: business, product, architecture, security, marketing/GTM, risks, and roadmap.
> Keep this file current — it is the one doc a new engineer, operator, or AI agent should read first.
> Last updated: 2026-09-12 · Repo: `/Users/drew83/cakra` · Supabase project: `gexprynjrnfmnadbgglk` (PASCUA) · Host: Vercel

---

## 0. TL;DR

cakra is a **digital-presence platform for Indonesian real-estate agents**: it builds each agent a personalized website, keeps it filled with AI-generated content and video, and measures their online presence in one score — optimized to get the agent **found and cited by Google + AI search engines (GEO)** and by social search. Positioning is deliberately narrow ("specialist for property agents") to win before expanding to creators generally.

- **Who pays:** independent property agents. **Price:** Pro **Rp 300rb/bulan** (~$18). Business/Agency = "coming soon".
- **Core promise:** "You are found and trusted before you ever pick up the phone" — website + content + Skor Cakra (SEO/GEO/social).
- **Deeper thesis:** cakra is the agent's **central kitchen** — it stores content as reusable *recipes* (structured text + assets + metadata), not disposable posts, so the agent **owns** it and can re-plate it to any platform, forever (the "don't lose your work when TikTok becomes the next Path" argument).
- **Stage:** pre-launch. Two real accounts today: `andrewsus83@gmail.com` (operator/admin) and The Newton (`thenewton.cakra.xyz`, real client).
- **Biggest pre-launch risk (see §8):** the GEO-optimized content is injected **client-side**, so AI crawlers (which don't run JS) currently see an empty template — the core GEO promise is not yet delivered at the infrastructure layer.

---

## 1. Business

### 1.1 Value proposition
One platform that gives a property agent: a professional **website** on their own domain, **listing management** (each unit gets its own page + local GEO score), **AI content + video** (photos → 45–90s property films; market articles; carousels), a **royalty-free asset + voice library**, and **Skor Cakra** — a single presence score across seven "centres" (website, listing, content, SEO, GEO, social, reputation) that tells them exactly what to do next.

### 1.2 Ideal customer profile (ICP)
- **Primary:** independent Indonesian real-estate agents / small local brands who **already have listings** (active on Instagram, rumah123, 99.co, OLX) **but have no professional website and thin/inconsistent social content**. Biggest gap = easiest sell + most value added.
- **Secondary / expansion:** established agencies (upsell website + lead capture), then eventually creators broadly (same recipe engine, different "final dish"). **Expansion is deferred on purpose** — win property first.

### 1.3 Pricing & revenue model
- **Pro — Rp 300rb/bulan:** website + AI optimization (SEO/GEO/social), 12 live listings, Editor Studio (10 builds/mo), daily content (2/day), asset library + 3 voices, Skor Cakra.
- **Business / Agency — coming soon:** 100 listings, unified inbox, social analytics, calendar, lead pipeline, multi-seat.
- **Revenue:** subscription. **⚠️ No billing/payment integration exists yet** — `plan` is a column; nothing collects money or enforces limits (see §8).

### 1.4 Unit economics & cost model
- **"Anything with Claude → via MCP"**: the expensive LLM composition is done by Claude Code (the operator's subscription) via the Supabase MCP = **$0 API cost** for the outbound prospecting pipeline and any operator-run generation.
- **Free-mode content** (per signed-up agent, automated): 2-layer **Gemini 2.5 Flash-Lite (research) → GPT-5 Mini (compose)**, ~Rp 130/site.
- **Paid site builder** (`build-site-pro`): SerpAPI×5 → Firecrawl×10 → Perplexity sonar-pro → Gemini index → Claude sonnet-5, ~$0.20–0.50/site.
- **⚠️ Watch:** daily content × 30 + videos + voice per agent must stay well under Rp 300k/mo. **Per-agent cost tracking + hard caps are not yet built** (see §8).

### 1.5 Competitive position & moat
- **vs Linktree/Beacons (link-in-bio):** cakra is a real SEO/GEO site + content engine, not a link page. Staying narrow ("property agents") avoids their red ocean.
- **vs Ahrefs/SEO tools:** they scrape; cakra is *given* the data when an agent connects — clean, live, consented ("permission arbitrage").
- **vs portals (rumah123/99.co):** the agent's listings there are anonymized among thousands; cakra gives them a branded, AI-citable presence they own.
- **Moat thesis:** a **consent + connection data layer** (agents connect their accounts → cakra reads live activity with clean permission) + **recipe storage** (own, portable, re-platable content). Network effects + clean data Ahrefs can't get.

---

## 2. Product / Features

| Area | What it does | State |
|---|---|---|
| **Web Builder** | Cosmetic-only editor (palette/font/radius/bg/decor/density/style/tone + content fields) over ONE shared structure (The Newton's). No add/remove sections. | Live (localStorage; DB sync pending) |
| **Listing management** | Per-agent CRUD; each listing → page + local GEO score; status jual/sewa/terjual. | Live (real Supabase, RLS) |
| **Content engine** | Daily "Draft by Cakra" → blog / carousel / 9:16 video from recommendations; 30-day content plan. 2-layer gen. | Live |
| **Editor Studio / Video** | Photos → property film; Full-Auto & Semi-Auto; canvas composer. ffmpeg motion-video render = "segera hadir". | Partial |
| **Media library** | Shared royalty-free images (OpenART) + BGM (ElevenLabs Music) + covers. | Live |
| **Voice** | ElevenLabs; agent given curated 8F+8M shortlist, picks 1F+1M, changeable 1×/30d. | Live (UI + TTS) |
| **Skor Cakra** | Presence score; MarketingScore grader (PageSpeed web + social). Backend deep-scan pending. | Partial |
| **Marketing (admin)** | Scoring engine + **outbound prospecting engine** (see §7). | New (this build) |

---

## 3. Architecture

### 3.1 Stack
- **Frontend:** Next.js 16 **static export** (`output: export`, `out/`, **no SSR / no middleware**), deployed to **Vercel**. Wildcard subdomains via `vercel.json` redirects. Everything renders **client-side**.
- **Backend:** **Supabase** (`gexprynjrnfmnadbgglk`) — Postgres + RLS, Edge Functions (Deno), Vault secrets, RPCs, `pg_cron`, `pg_net`.
- **Auth:** Supabase auth; admin gated by `is_admin_caller()` = admin email in `admin_emails` **+ aal2 (2FA)**.

### 3.2 The personalization pipeline (how an agent's site renders)
`/demo` (`app/demo/page.tsx`) is ONE fixed template with `data-site="…"` scaffold markers. `app/demo/SiteSkin.tsx` runs **client-side**: resolves the agent from the subdomain (`<sub>.cakra.xyz`) or defaults to **The Newton** (canonical reference; Kirana demo persona removed), calls `public_agent_site(key)` RPC, and fills the markers + swaps images + injects JSON-LD. **⚠️ This is client-side only → not in the served HTML (see §8 GEO risk).** Prospect previews use `preview_prospect(token)` at a token-gated, `noindex` `/pitch` route (private).

### 3.3 Client → backend surface (from Graphify code graph)
All client data access funnels through three functions in **`lib/supabase.ts`** — the security choke points:
- **`db()`** — REST/PostgREST access, **13 callers** (MemberDashboard, uploadAsset, EditorStudio, AssetLibrary, VoiceLibrary, Onboarding…). Top "god node".
- **`rpc()`** — Postgres RPC calls, **8 callers** (StaffAdmin, onboarding, publicAgentSite, publicAllListings…).
- **`invokeFn()`** — Edge Function invocation, **4 callers** (MemberDashboard).
All use the **browser anon key** → **RLS + RPC gating are the only multi-tenant security** (see §6, §8).

### 3.4 Edge Functions (Deno; CRON_SECRET-gated; secrets via `get_secret` RPC / Vault)
`build-site` (free 2-layer), `build-site-pro` (paid SOP), `content-plan`, `generate-content`, `generate-asset`, `generate-music` (ElevenLabs, queue via `bgm_queue`), `voice` (catalog/speak), `tag-clip` (Claude vision), `discover-prospects` (Perplexity+SerpAPI+Gemini), `prospect-pipeline` (TODO), `send-reset` (Resend, noreply@cakra.xyz). Long jobs use **`EdgeRuntime.waitUntil()`** to outlive the 110s pg_net cap; status stored on the row. Triggered by SECURITY DEFINER RPCs using `net.http_post`.

### 3.5 Code health (Graphify: 67 files, 469 nodes, 691 edges, 41 communities, 0 import cycles)
- **God nodes:** `db()`(13), `MemberDashboard()`(11), `uploadAsset()`(11), `CakraMark()`(10), `EditorStudio()`(9), `AssetLibrary()`(8), `toWaE164()`(8).
- **Split candidates (low cohesion):** `app/admin/page.tsx` **0.04** (1,900 lines, mixes member+staff+all consts), `lib/supabase.ts` 0.067, `app/demo/page.tsx` 0.068.
- **~231 weakly-connected nodes** = candidate dead code.
- **Graphify usage:** `graphify explain/path/query` from repo (PATH `~/.local/bin`); refresh `graphify update .`; also GitHub-connected (hosted, auto-reindex) + MCP (connects on restart).

---

## 4. Data model (key tables, all in `public`)
`profiles` (agent identity + `onboarding` jsonb incl. `advertorial`), `listings` (agent_id, images jsonb, public_featured), `content_masters` (global daily topic seeds), `content_pieces` (per-agent generated; content jsonb; plan/produced flags), `assets` (shared library, agent_id NULL = global), `bgm_queue`, `clips` (recycling), `leads`, `subscriptions`, `voices` (agent_id, gender, changed_at), `prospects` (outbound engine — admin-only), `app_secret_names` (which keys the admin UI shows/saves), `admin_emails`, `public_config`, `presence_scores`, `newsletter`, `video_jobs`, `content_jobs`.

---

## 5. Content = "recipe" (the ownership thesis, and its design constraint)
Store the **idea + raw ingredients** (script/text, key points, source photos/clips, structure, metadata) separately from the **finished dish** (9:16 video, carousel, article). One recipe → many dishes, re-platable to any platform, forever = true portability + agent ownership. **Design rule:** never store only the final output; store rich raw + structure. `content_masters` + `content_pieces` already keep structured text/slides/scenes (not just MP4s) — keep it that way. This is what makes the "portable / masak-ulang" promise honest.

---

## 6. Security model
- **Multi-tenant isolation = RLS only.** Static export + browser anon key means Postgres RLS is the sole barrier between agents. Every table `db()`/`rpc()` touches must be owner-scoped for read AND write.
- **Admin gating:** `is_admin_caller()` (admin email + aal2/2FA) gates all `admin_*` RPCs. Only `andrewsus83@gmail.com` is admin today.
- **Secrets:** Vault + `get_secret` (service-role in edge fns); admin UI writes via `admin_set_secret` (name must be in `app_secret_names`). Never echo decrypted secrets; never hand-set `SUPABASE_SERVICE_ROLE_KEY`.
- **Prospects:** admin-only RLS; sales intel never exposed. Private preview via `preview_prospect(token)` (site-only, 72-bit token, `noindex`, robots-blocked, no public subdomain).

---

## 7. Marketing / Go-to-market — the outbound "cakra outbound" engine
**Loop:** research a big pool of easy-sell agents → **finalize 1/day at 08:00 WIB** into a full pitch package → operator pitches with a private live demo.

- **Discover** (Perplexity + SerpAPI + Gemini, or Claude-via-MCP): find independent agents with listings but no website/weak social; rank by `value_score` (sellability). **Pool today: 50 discovered + 1 ready.**
- **Finalize** (Claude via MCP, ~$0.10–0.15/agent): scrape their real listings (portals + own site) → build private demo site → score current presence + gaps → tips → 30-day content plan → pitch slides. Skip-tolerant (misses resume next day).
- **Pitch:** send the agent a private `cakra.xyz/pitch?t=<token>` link ("here's YOUR site — sign up to claim it"). Never public, never indexed, no impersonation.
- **Morning routine:** a **scheduled Claude agent** at 08:00 WIB (skip-tolerant).
- **GTM narrative:** (1) "You've already lost Path — don't repeat it with TikTok" (ownership/loss aversion); (2) "Get cited by AI search, not just Google" (GEO) — **conditional on fixing §8**; (3) recipe/central-kitchen (own + re-plate your content).

---

## 8. Known risks / CTO findings (prioritized)

### 🔴 Tier 0 — launch blockers
1. **GEO content invisible to AI crawlers.** Raw `/demo` HTML fetched as GPTBot = 211 KB but **0** occurrences of the agent's content ("Bendungan Hilir", "Ciputra World", "Kuningan", "The Newton"), only empty `data-site` markers + generic title. All advertorial/FAQ/JSON-LD is injected by client JS; GPTBot/Perplexity/Claude/CCBot don't run JS → they index a blank template. **The core GEO promise is undelivered.** Fix: pre-render each agent's page to static HTML (advertorial + JSON-LD baked in) at build/onboarding, or SSR/ISR.
2. **Multi-tenant RLS audit.** RLS is the only isolation; must prove every table blocks cross-agent read + write before onboarding paying strangers. Run Supabase security advisors + explicit "agent A can't touch agent B" tests.
3. **Billing absent.** No payment integration; nothing collects money or enforces plan. Need Midtrans/Xendit + subscription lifecycle + plan-gating before charging.

### 🟠 Tier 1 — before scaling
4. **Pipeline resilience + cost caps + observability** — 6+ paid APIs in background jobs; need visible failures, retries/fallbacks, per-agent cost caps, alerting.
5. **Onboarding hardening + smoke tests + staging** — no automated tests today; first-run is the whole funnel.

### 🟡 Tier 2 — tech debt (plan, don't block)
6. **Split `app/admin/page.tsx`** (cohesion 0.04) + prune ~231 dead nodes (Graphify). Same for `lib/supabase.ts`.
7. **Sentry + uptime + verified Supabase backups + incident runbook.**

---

## 9. Roadmap / sequencing
**Now → launch:** GEO pre-render spike → RLS audit + fixes → billing (Midtrans/Xendit). **Then:** pipeline resilience + cost caps + smoke tests + staging. **Then:** `/pitch` UI + Marketing Prospects queue + scheduled 08:00 routine (go-to-market). **Post-launch:** split admin/page.tsx, dead-code prune, monitoring.

---

## 10. Ops / runbooks & gotchas
- **Deploy:** `vercel deploy --prod --yes` from `/Users/drew83/cakra` (auth as `andrewsus83-5642`; "Not authorized" is usually transient — retry).
- **Supabase MCP (`supabase-cakra`):** was timing out on `npx @latest` cold-start; fixed by installing to a stable prefix (`~/.cakra-mcp`) + direct-node command in `~/.claude.json` (0.19s start). DB writes / MCP-command edits are gated by the bash auto-mode classifier — do DB work through native `mcp__supabase-cakra__*` tools.
- **Claude API quirks (claude-sonnet-5):** no `temperature`, no assistant prefill, scan `content[]` for the `type==="text"` block (thinking block comes first); org key needs workspace scope or `anthropic-workspace-id`.
- **pg_net 110s cap:** long edge jobs use `EdgeRuntime.waitUntil()` + a status field.
- **Adding an API key to admin:** register the env name in `app_secret_names` (else no input box / save rejected), not just the frontend array.
- **Graphify:** `export PATH="$HOME/.local/bin:$PATH"`; `graphify explain "<sym>"` before editing tangled files; `graphify update .` after changes.

---

## 11. Related detailed notes (Claude memory)
`cakra-supabase-backend`, `cakra-design-system`, `cakra-content-pipeline`, `cakra-paid-site-builder-sop`, `cakra-media-and-render`, `cakra-password-reset`, `cakra-admin-api-keys`, `cakra-outbound-prospecting`, `cakra-graphify-codegraph`.
