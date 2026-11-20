# WBS: Multi-Domain Shopify / Hydrogen / Oxygen Storefront

Legend: NOT STARTED ❌ | DONE ✅ | IN PROGRESS ⚠️
Start: 2026-11-17 | Target go-live: 2026-12-18 | Updated: 2026-11-17 12:55
Model: one Shopify store, one Hydrogen storefront on Oxygen, brand resolved from Host header.
Domains: bicyclebio.com, scooterbio.com, skaterbio.com, ecombio.com (role TBD)

## Milestones

| ID | Milestone | Gate (exit criteria) | Target |
|---|---|---|---|
| M1 | Decisions locked | Domain-serving spike passed; checkout, accounts, catalog-to-brand and ecombio.com decided | 2026-11-20 |
| M2 | Oxygen-ready app | typecheck + build pass; MiniOxygen dev and preview serve /, product, collection, search, cart | 2026-11-25 |
| M3 | Brand layer complete | Each brand host renders its own catalog, nav, SEO; wrong-brand product 404s; tests pass | 2026-12-04 |
| M4 | Preview verified | Preview deploy passes smoke test per host, including cart and checkout handoff | 2026-12-09 |
| M5 | Domains connected | All domains target the storefront, DNS verified, no unwanted redirects | 2026-12-11 |
| M6 | Production live | Prod deploy, checkout + account callbacks verified, monitoring on | 2026-12-18 |

## 1. Project management and decisions (2026-11-17 to 2026-11-20)

| ID | Task / sub-task | Depends on | Status |
|---|---|---|---|
| 1.1 | Confirm architecture: single store, single storefront | none | ⚠️ |
| 1.1.1 | Confirm Shopify plan tier and public-environment limits | none | ❌ |
| 1.1.2 | Confirm Hydrogen channel installed, sales channel assignment (react-router) | none | ⚠️ |
| 1.2 | Domain-serving spike | 1.1 | ❌ |
| 1.2.1 | Point two domains at one Oxygen target in Shopify admin | 1.1.2 | ❌ |
| 1.2.2 | Verify both serve content (no redirect to primary) | 1.2.1 | ❌ |
| 1.2.3 | Record result and fallback plan if redirected | 1.2.2 | ❌ |
| 1.3 | Decide checkout approach (single checkout subdomain vs per-brand) | 1.2 | ❌ |
| 1.4 | Decide customer sign-in (Customer Account API vs auth.<brand>.com handoff) | none | ❌ |
| 1.5 | Decide product-to-brand mapping (collection, tag or metafield) | none | ❌ |
| 1.6 | Decide ecombio.com role (hub page, redirect, or own catalog) | none | ❌ |
| 1.7 | Maintain docs\MULTI-DOMAIN-ROADMAP.md and this WBS | none | ⚠️ |

## 2. Local foundation (2026-11-17 to 2026-11-20)

| ID | Task / sub-task | Depends on | Status |
|---|---|---|---|
| 2.1 | Install and tooling | none | ✅ |
| 2.1.1 | Run hydrogen setup, skills copied | none | ✅ |
| 2.1.2 | Convert to pnpm, remove package-lock.json | 2.1.1 | ✅ |
| 2.1.3 | Approve agent skills; enable esbuild and workerd builds | 2.1.2 | ✅ |
| 2.1.4 | pnpm run build passes | 2.1.3 | ✅ |
| 2.2 | Shopify link and env | 1.1.2 | ❌ |
| 2.2.1 | hydrogen login, list, link the storefront | 1.1.2 | ❌ |
| 2.2.2 | hydrogen env pull to .env; confirm .env is gitignored | 2.2.1 | ❌ |
| 2.2.3 | pnpm run typecheck passes (gql check online) | 2.2.2 | ❌ |
| 2.3 | Finish hydrogen-setup steps | 2.2 | ⚠️ |
| 2.3.1 | Step 7 Shopify runtime scripts | 2.2.3 | ❌ |
| 2.3.2 | Step 8 cart drawer and navbar | 2.3.1 | ❌ |
| 2.3.3 | Step 9 account page review | 2.3.2 | ❌ |
| 2.3.4 | Step 10 consent-gated analytics | 2.3.3 | ❌ |
| 2.3.5 | Step 11 verify | 2.3.4 | ❌ |

## 3. Oxygen compatibility (2026-11-23 to 2026-11-25; US holiday 2026-11-26)

| ID | Task / sub-task | Depends on | Status |
|---|---|---|---|
| 3.1 | Add server.ts Worker entry (env, cache, waitUntil per request) | 2.2.3 | ❌ |
| 3.2 | Add oxygen() Vite plugin and @shopify/oxygen-workers-types | 3.1 | ❌ |
| 3.3 | Single server bundle; confirm build\client and build\server (or --assets-dir / --worker-dir) | 3.2 | ❌ |
| 3.4 | Create per-request clients (storefront, customer account, cart) | 3.1 | ❌ |
| 3.5 | Remove Node-only assumptions (process.env, node:*) | 3.4 | ❌ |
| 3.6 | MiniOxygen dev and preview smoke test | 3.3, 3.5 | ❌ |

## 4. Brand-by-host layer (2026-11-25 to 2026-12-04)

| ID | Task / sub-task | Depends on | Status |
|---|---|---|---|
| 4.1 | app\lib\brands.ts: hostname to brand config | 1.5, 1.6 | ❌ |
| 4.1.1 | Fields: name, slug, collection scope, nav, theme tokens, SEO, contact | 1.5 | ❌ |
| 4.1.2 | Host normalization (case, port, www, apex) | 4.1.1 | ❌ |
| 4.1.3 | Fallback for localhost and *.myoxygen.dev preview hosts | 4.1.2 | ❌ |
| 4.2 | Resolve brand once per request in storefront-context.ts | 3.4, 4.1 | ❌ |
| 4.3 | Brand-scoped data | 4.2 | ❌ |
| 4.3.1 | Home, collections, collection | 4.2 | ❌ |
| 4.3.2 | Search and predictive search | 4.3.1 | ❌ |
| 4.3.3 | Product page; wrong-brand product returns 404 | 4.3.1 | ❌ |
| 4.4 | Brand-aware UI: navbar, footer, theme tokens, logo | 4.2 | ❌ |
| 4.5 | SEO per host | 4.2 | ❌ |
| 4.5.1 | Canonical links, titles, Open Graph from request host | 4.2 | ❌ |
| 4.5.2 | robots.txt and sitemap per host | 4.5.1 | ❌ |
| 4.6 | Account and auth handoff per decision 1.4 | 1.4, 4.2 | ❌ |
| 4.7 | ecombio.com behavior per decision 1.6 | 1.6, 4.2 | ❌ |
| 4.8 | Tests: host to brand resolution, scoped queries, 404s | 4.3 | ❌ |

## 5. Deploy and domains (2026-12-07 to 2026-12-11)

| ID | Task / sub-task | Depends on | Status |
|---|---|---|---|
| 5.1 | Preview deploy: hydrogen deploy --preview | 3.6, 4.8 | ❌ |
| 5.2 | Per-host smoke test (header override or temporary domain) | 5.1 | ❌ |
| 5.2.1 | Browse, search, cart, add to cart per brand | 5.1 | ❌ |
| 5.2.2 | Checkout handoff per brand | 5.2.1 | ❌ |
| 5.3 | Customer Account API callback, JS origin, logout URIs for all hosts | 1.4 | ❌ |
| 5.4 | Cloudflare DNS and Shopify domain connection, one domain at a time | 5.2 | ❌ |
| 5.4.1 | Add domain in Shopify, set Target to Hydrogen storefront | 5.2 | ❌ |
| 5.4.2 | Create DNS records in Cloudflare (verify proxy setting) | 5.4.1 | ❌ |
| 5.4.3 | Verify domain serves content, SSL active | 5.4.2 | ❌ |
| 5.4.4 | www to apex redirect | 5.4.3 | ❌ |
| 5.5 | GitHub Actions deploy workflow (single deploy job) | 5.1 | ⚠️ |

## 6. Cutover and hardening (2026-12-14 to 2026-12-18)

| ID | Task / sub-task | Depends on | Status |
|---|---|---|---|
| 6.1 | Go/no-go review against M1-M5 gates | 5.4 | ❌ |
| 6.2 | Production deploy | 6.1 | ❌ |
| 6.3 | Set primary domain; redirect old online-store pages | 6.2 | ❌ |
| 6.4 | Post-launch checks: checkout, accounts, analytics, sitemaps submitted | 6.3 | ❌ |
| 6.5 | Rollback plan documented and rehearsed | 6.1 | ❌ |
| 6.6 | Monitoring and error review for 48 hours | 6.4 | ❌ |

## 7. Repository and CI (2026-11-17 to 2026-12-04)

| ID | Task / sub-task | Depends on | Status |
|---|---|---|---|
| 7.1 | Repo ecombio-com/site connected and main pushed | none | ✅ |
| 7.1.1 | Commit local setup (188 files, pnpm, Oxygen prep, docs) | none | ✅ |
| 7.1.2 | Rebase onto remote main (picked up Shopify PR #5 workflow) | 7.1.1 | ✅ |
| 7.1.3 | Fix conflict markers in .gitignore and README (commit f35620f) | 7.1.2 | ✅ |
| 7.1.4 | Verify no secrets tracked; .env ignored, .env.example tracked | 7.1.3 | ✅ |
| 7.2 | Review Shopify-generated workflow .github\workflows\oxygen-deployment-1000185750.yml | 7.1 | ❌ |
| 7.2.1 | Check Actions tab: first run on main expected to fail until server.ts exists (3.1) | 7.1 | ❌ |
| 7.2.2 | Confirm workflow uses pnpm and the right token secret | 7.2 | ❌ |
| 7.3 | Delete stale remote branches shopify-setup-oxygen-workflow-bks4 and shopify-remove-oxygen-workflow-l9lq | 7.2 | ❌ |
| 7.4 | Decide whether to track duplicated .agents and .claude skills folders | none | ❌ |
| 7.5 | Add .gitattributes to normalize line endings (CRLF warnings) | none | ❌ |
| 7.6 | Branch protection and PR flow on main | 7.2 | ❌ |

## Progress snapshot (2026-11-17 12:55)

| Measure | Count |
|---|---|
| Total tasks and sub-tasks | 78 |
| DONE ✅ | 10 (13%) |
| IN PROGRESS ⚠️ | 5 |
| NOT STARTED ❌ | 63 |

| Milestone | Status | Note |
|---|---|---|
| M1 Decisions locked | ⚠️ | Single store confirmed (ecombio-store). Spike, plan tier, checkout, accounts, brand mapping, ecombio.com still open |
| M2 Oxygen-ready app | ⚠️ | Build passes. gql check needs link and env pull. server.ts not started |
| M3 Brand layer complete | ❌ | Blocked on M1 decisions |
| M4 Preview verified | ❌ | |
| M5 Domains connected | ❌ | |
| M6 Production live | ❌ | |

## Critical path
1.2 domain-serving spike -> 1.3 checkout decision -> 4.1 brand config -> 4.3 scoped data -> 5.1 preview -> 5.4 domains -> 6.2 production.

## Schedule risks
- 1.2 may show Shopify redirects non-primary domains; the fallback adds work to 5.4 and 6.3.
- Black Friday and Cyber Monday (2026-11-27 and 2026-11-30) fall inside the build window; no production changes to the live store until 6.2.
- Single checkout subdomain means one brand's hostname shows at payment unless 1.3 finds a per-brand option.
