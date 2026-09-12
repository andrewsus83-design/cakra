# Graph Report - cakra  (2026-09-12)

## Corpus Check
- 67 files · ~227,454 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 469 nodes · 691 edges · 41 communities (27 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5f1edf15`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- supabase.ts
- admin/page.tsx
- demo/page.tsx
- app/page.tsx
- StaffAdmin.tsx
- package.json
- AuthGate.tsx
- compilerOptions
- [slug]/page.tsx
- app/layout.tsx
- react
- onboarding/page.tsx
- listing/page.tsx
- privacy/page.tsx
- MemberDashboard
- contact/page.tsx
- vercel.json
- opengraph-image.tsx
- next
- WelcomeTour.tsx
- hub/page.tsx
- slides.ts
- about/page.tsx
- faq/page.tsx
- CakraWheel.tsx
- sitemap.ts
- README.md
- isAdmin
- LocationInput.tsx
- contact/layout.tsx
- hub/layout.tsx
- listing/layout.tsx
- login/layout.tsx
- manifest.ts
- onboarding/layout.tsx
- robots.ts
- signup/layout.tsx
- AGENTS.md
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `react` - 29 edges
2. `next` - 21 edges
3. `compilerOptions` - 16 edges
4. `db()` - 13 edges
5. `MemberDashboard()` - 11 edges
6. `uploadAsset()` - 11 edges
7. `CakraMark()` - 10 edges
8. `EditorStudio()` - 9 edges
9. `AssetLibrary()` - 8 edges
10. `toWaE164()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `AuthGate()` --calls--> `currentAAL()`  [EXTRACTED]
  app/admin/AuthGate.tsx → lib/supabase.ts
- `StaffAdmin()` --calls--> `rpc()`  [EXTRACTED]
  app/admin/StaffAdmin.tsx → lib/supabase.ts
- `imagesFor()` --calls--> `renderSlides()`  [EXTRACTED]
  app/admin/page.tsx → lib/slides.ts
- `MemberDashboard()` --calls--> `db()`  [EXTRACTED]
  app/admin/page.tsx → lib/supabase.ts
- `MemberDashboard()` --calls--> `invokeFn()`  [EXTRACTED]
  app/admin/page.tsx → lib/supabase.ts

## Import Cycles
- None detected.

## Communities (41 total, 12 thin omitted)

### Community 0 - "supabase.ts"
Cohesion: 0.07
Nodes (45): Onboarding(), ARS, AssetLibrary(), AUD_FACETS, cap(), CAT_COLOR, DUR_BANDS, fmtDur() (+37 more)

### Community 1 - "admin/page.tsx"
Cohesion: 0.04
Nodes (47): AI_QUESTIONS, ASSETS, B_BGS, B_DECOR, B_DENSITIES, B_FONTS, B_PALETTES, B_RADII (+39 more)

### Community 2 - "demo/page.tsx"
Cohesion: 0.07
Nodes (32): LangToggle(), T, L, ListingGrid(), AREAS, ARTICLES, body, display (+24 more)

### Community 3 - "app/page.tsx"
Cohesion: 0.08
Nodes (23): COMPARE, metadata, PILLARS, TIERS, metadata, CENTRES, FEAT_ICONS, FEATURES (+15 more)

### Community 4 - "StaffAdmin.tsx"
Cohesion: 0.10
Nodes (21): API_KEYS, ApiItem, contentText(), NAV, Section, SLOT_LABEL, StaffAdmin(), whereColor() (+13 more)

### Community 5 - "package.json"
Cohesion: 0.07
Nodes (26): dependencies, next, react, react-dom, devDependencies, tailwindcss, @tailwindcss/postcss, @types/node (+18 more)

### Community 6 - "AuthGate.tsx"
Cohesion: 0.16
Nodes (13): Phase, Accent(), AuthShell(), Banner(), BTN_CLASS, Button(), ButtonProps, CodeInput() (+5 more)

### Community 7 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "[slug]/page.tsx"
Cohesion: 0.14
Nodes (11): Area, AreaPage(), AREAS, body, display, dynamicParams, Listing, ORDER (+3 more)

### Community 9 - "app/layout.tsx"
Cohesion: 0.17
Nodes (10): display, hand, JSON_LD, metadata, mono, sans, viewport, COLS (+2 more)

### Community 10 - "react"
Cohesion: 0.24
Nodes (6): CakraMark(), P, HERO_PAGES, LINKS, SiteNav(), react

### Community 11 - "onboarding/page.tsx"
Cohesion: 0.18
Nodes (9): Field, FONTS, FType, GEN_STEPS, Page, PAGES, PALETTES, CITIES (+1 more)

### Community 12 - "listing/page.tsx"
Cohesion: 0.31
Nodes (7): Listing, Page(), PRICE_BANDS, rp(), SEED, statusColor(), publicAllListings()

### Community 13 - "privacy/page.tsx"
Cohesion: 0.28
Nodes (4): metadata, metadata, LegalDoc(), LegalSection

### Community 14 - "MemberDashboard"
Cohesion: 0.29
Nodes (8): arCss(), btn(), dlImg(), draftLabel(), imagesFor(), listingFromRow(), MemberDashboard(), ProducedCard()

### Community 15 - "contact/page.tsx"
Cohesion: 0.25
Nodes (5): BIZ_STEPS, inputStyle, SOCIALS, Step, WHO

### Community 16 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, cleanUrls, framework, outputDirectory, redirects, $schema, trailingSlash

### Community 17 - "opengraph-image.tsx"
Cohesion: 0.29
Nodes (5): alt, CHAKRA, contentType, dynamic, size

### Community 18 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 19 - "WelcomeTour.tsx"
Cohesion: 0.40
Nodes (5): GLOSSARY, Step, STEPS, visibleTarget(), WelcomeTour()

### Community 20 - "hub/page.tsx"
Cohesion: 0.33
Nodes (3): Article, ARTICLES, CATS

### Community 21 - "slides.ts"
Cohesion: 0.60
Nodes (5): drawWrapped(), renderOne(), renderSlides(), Slide, wrapLines()

### Community 22 - "about/page.tsx"
Cohesion: 0.40
Nodes (3): coverAbs, jsonLd, metadata

### Community 23 - "faq/page.tsx"
Cohesion: 0.40
Nodes (3): FAQ_SECTIONS, faqJsonLd, metadata

### Community 24 - "CakraWheel.tsx"
Cohesion: 0.50
Nodes (4): CakraWheel(), draw(), ring(), CENTRES

### Community 26 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 27 - "isAdmin"
Cohesion: 0.67
Nodes (3): AuthGate(), Admin(), isAdmin()

## Knowledge Gaps
- **231 isolated node(s):** `metadata`, `jsonLd`, `coverAbs`, `Phase`, `Section` (+226 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 295 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `supabase.ts`, `admin/page.tsx`, `demo/page.tsx`, `app/page.tsx`, `StaffAdmin.tsx`, `package.json`, `AuthGate.tsx`, `onboarding/page.tsx`, `listing/page.tsx`, `contact/page.tsx`, `WelcomeTour.tsx`, `hub/page.tsx`, `CakraWheel.tsx`, `LocationInput.tsx`?**
  _High betweenness centrality (0.390) - this node is a cross-community bridge._
- **Why does `next` connect `next` to `login/layout.tsx`, `manifest.ts`, `demo/page.tsx`, `app/page.tsx`, `onboarding/layout.tsx`, `robots.ts`, `signup/layout.tsx`, `package.json`, `[slug]/page.tsx`, `app/layout.tsx`, `privacy/page.tsx`, `about/page.tsx`, `faq/page.tsx`, `sitemap.ts`, `contact/layout.tsx`, `hub/layout.tsx`, `listing/layout.tsx`?**
  _High betweenness centrality (0.264) - this node is a cross-community bridge._
- **Why does `Decor()` connect `demo/page.tsx` to `admin/page.tsx`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `metadata`, `jsonLd`, `coverAbs` to the rest of the system?**
  _231 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `supabase.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06708595387840671 - nodes in this community are weakly interconnected._
- **Should `admin/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.03773584905660377 - nodes in this community are weakly interconnected._
- **Should `demo/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06755260243632337 - nodes in this community are weakly interconnected._