# Multi-Domain Setup: Shopify / Hydrogen / Oxygen Storefronts

Legend: NOT STARTED ❌ | DONE ✅ | IN PROGRESS ⚠️
Last updated: 2026-11-17

## Goal
Serve each brand (BicycleBio, ScooterBio, SkaterBio) on its own domain from one Hydrogen codebase hosted on Oxygen, with auth.<brand>.com staying on Cloudflare.

## Plan: how and why

**Chosen model: one codebase, one Oxygen storefront per brand, deployed once per brand.**
- Why: an Oxygen storefront belongs to one Shopify shop, and domains are attached to the storefront in that shop's admin. Per-brand shops (per-brand .env files) therefore mean per-brand storefronts.
- How: shared code in `Storefronts\Site`; per-brand `.env.<brand>`, Oxygen deployment token and `--shop` flag at deploy time; custom domain added per shop after first deploy.
- Alternative (hydrogen-markets, `type: "domain"`): one shop serving several hostnames. Only valid if all brands share ONE Shopify store. **Decision needed: confirm brands are separate stores.**
- auth.<brand>.com (Better Auth on Cloudflare Workers) is unchanged. Decide whether the storefront account page uses Shopify Customer Account API or hands off to auth.<brand>.com.

## Requirements

| | Minimum | Recommended |
|---|---|---|
| Shopify | Hydrogen channel installed on each brand's shop | Separate Oxygen environments (production, preview) per brand |
| Tooling | Node, pnpm, Shopify CLI via @shopify/hydrogen | Pinned Node version, pnpm 12, CI runner |
| Build | Oxygen-compatible module Worker (server.ts), single server bundle, client assets dir | MiniOxygen dev and preview verified locally |
| Config | Per brand: PUBLIC_STORE_DOMAIN, PUBLIC_STOREFRONT_API_TOKEN, private token, SESSION_SECRET, Customer Account API vars | Secrets only in GitHub environments / Oxygen env vars, `.env.example` committed |
| Deploy | Oxygen deployment token per storefront | GitHub Actions matrix, one job per brand, preview deploys on PRs |
| DNS | Control of each brand's domain | Cloudflare DNS, www to apex redirect, hreflang and robots per host |
| Quality | typecheck and build pass | hydrogen-smoke-test and step 11 verify pass before each prod deploy |

## Roadmap

### Foundation
- ✅ Run `npx @shopify/hydrogen setup`, packaged skills copied into app
- ✅ Convert Site to pnpm (`pnpm import`, remove package-lock.json)
- ✅ Approve @shopify/hydrogen agent skills
- ✅ `pnpm run build` passes (react-router build)
- ⚠️ Approve build scripts: esbuild and workerd were set to `false`, must be `true` for MiniOxygen
- ⚠️ `pnpm run typecheck`: tsc passes, `hydrogen gql check` fails with network fetch error (needs Storefront credentials, retest after env pull)

### Hydrogen app (hydrogen-setup steps 1-11)
- ⚠️ Routes exist: home, collection(s), product, search, cart, account, robots.txt (steps 3-6, 9 partly)
- ❌ Verify/finish step 7 Shopify runtime scripts
- ❌ Verify/finish step 8 cart drawer and navbar
- ❌ Verify/finish step 10 analytics
- ❌ Step 11 verify (typecheck, build, smoke tests)

### Oxygen compatibility (hydrogen-oxygen skill)
- ❌ Add `server.ts` Worker entry
- ❌ Add `oxygen()` Vite plugin, @shopify/oxygen-workers-types
- ❌ Replace @react-router/serve start path with Worker build
- ❌ Confirm build output dirs (`build\client`, `build\server`) or pass `--assets-dir` / `--worker-dir`
- ❌ MiniOxygen dev and preview smoke test

### Per-brand Shopify wiring
- ❌ Hydrogen channel installed on each shop
- ❌ `hydrogen list` / `link` per brand (create storefront if missing)
- ❌ Oxygen deployment token per brand
- ❌ `.env.bicyclebio`, `.env.scooterbio`, `.env.skaterbio` populated via `env pull`
- ❌ Customer Account API settings per brand (callback URLs per domain)

### Deploy and domains
- ❌ `scripts\deploy-oxygen.ps1` created and tested with `--preview`
- ❌ First production deploy per brand
- ❌ Custom domain added per shop, DNS records set
- ❌ GitHub Actions matrix deploy
- ❌ hreflang / robots / sitemap per host

### Auth integration (separate repo ecombio-com/headless)
- ✅ auth.<brand>.com Workers deployed (PR #3 merged)
- ❌ Decide and wire storefront sign-in handoff to auth.<brand>.com
