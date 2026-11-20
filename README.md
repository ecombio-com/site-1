# ecombio-com/site

Monorepo for the ECOMBIO multi-brand storefront (Shopify Hydrogen on Oxygen), the brand auth worker (Cloudflare), and related apps.

Last updated: 2026-11-20. Everything below was verified from terminal output unless marked UNVERIFIED or OPEN. Re-verify before relying on anything marked that way.

## Goal

One Hydrogen storefront on one public Oxygen deployment, serving several brand domains as alias domains (not redirects), with per-domain branding, SEO and route ownership. Shopify-hosted checkout stays underneath. Each brand eventually gets its own auth.<brand> login host.

## Repository layout

pnpm workspace (pnpm-workspace.yaml: apps/*, packages/*).

    apps/web     Hydrogen storefront (@shopify/hydrogen 2026.4.8, @shopify/cli 3.93.2, React Router)
    apps/auth    Better Auth worker on Cloudflare (worker auth-dev, D1 binding DB)
    apps/studio  In the initial import. Not reviewed.
    .github/workflows/oxygen-deployment-1000185970.yml   Oxygen deploy workflow

Tooling: pnpm 12.14.0 (CI), Node LTS (CI), wrangler 4.165.0 for the auth worker.

## Branches (as of last check)

- main: deploys via GitHub Actions. Includes PR 22 (deploy fix, c031787). Does NOT contain the domain guard.
- domain-guard: original guard work. Not merged.
- guard-preview: domain-guard + main merged + test hosts, locale stripping, guard-check script (9c3369a). Pushed, not merged.
- auth-brands: no commits. Auth edits (brands.ts, options.ts, wrangler.jsonc) are uncommitted working-tree changes.
- backup/old-remote-main, main-backup: saved history of the old remote main. Do not delete.
- shopify-setup-oxygen-workflow-*, shopify-remove-oxygen-workflow-*, feat/oxygen-worker: leftovers. Do not merge.

## Deploy pipeline (apps/web to Oxygen)

- Workflow "Storefront 1000185970" runs on push to any branch.
- Steps: install pnpm, pnpm install --frozen-lockfile at the repo root, then in apps/web: pnpm exec shopify hydrogen deploy --no-lockfile-check
- Secret: OXYGEN_DEPLOYMENT_TOKEN_1000185970 (the only repo secret).
- Why: the Shopify CLI is a dependency of apps/web and the lockfile lives at the repo root, so the lockfile check is skipped.
- Duplicate workflow 1000185863 was deleted (it used npm and a secret that does not exist).
- Run 44653122872 (main deploy for c031787) succeeded.
- OPEN: which storefront/environment this workflow publishes to is not confirmed. The GitHub deployments API returned no records for this repo.

## Domains

Shopify store admin handle: ecombio-store.

Attached to Site (Production), all alias type:
- site-4f18851d6ef40de010df.o2.myshopify.dev (primary)
- ecombio.com, bicyclebio.com, skaterbio.com and the www variants of those three
- hydrogen-test.ecombio.com, hydrogen-test.bicyclebio.com, hydrogen-test.skaterbio.com (test hosts, DNS only in Cloudflare)

Verified: all three hydrogen-test hosts return "powered-by: Shopify, Oxygen" and end in 200 (via a redirect to /en-us).

Not served by Hydrogen today:
- Apex and www of bicyclebio.com, skaterbio.com, scooterbio.com are answered by Cloudflare Workers (headless-bicyclebio, headless-skaterbio, headless-scooterbio; Next.js). Shopify showing them as Connected does not move traffic. Removing those Workers or repointing DNS takes the live brand sites offline. Do not do it until a Hydrogen replacement exists.
- scooterbio.com is not in Shopify.
- auth.ecombio.com is Shopify's customer-account domain (primary). Shopify allows one per store. Do not use it for the auth worker.

## Domain system (apps/web/app/lib/domain-system)

    seo-packages.ts      SEO behavior per package (metadata, canonical, robots, noindex)
    domain-packages.ts   Rendering behavior per package (brand, allowedPaths/Prefixes, redirects, features, checkout flag)
    domain-registry.ts   hostname to package key; local/preview patterns; checkout hosts; unknown-host policy
    guard.ts             guardRequest(): resolve host, allowlist check, 404/redirect before rendering

apps/web/server.ts calls guardRequest first and sets X-Robots-Tag noindex, nofollow when the SEO package says so.

Rules as implemented:
- Unknown host: 404 (UNKNOWN_HOST_POLICY = 404).
- checkout.ecombio.com is a separate class and is never rendered as storefront.
- localhost, 127.0.0.1, *.tryhydrogen.dev, *.myshopify.dev use the fallback package (renders everything, noindex).
- primary uses an explicit allowlist plus prefixes.
- Registry on guard-preview: ecombio.com = primary, bicyclebio.com = aliasA, skaterbio.com = aliasB, alias-c.com = aliasC (placeholder), staging.ecombio.com and the three hydrogen-test hosts = fallback.
- aliasA/B/C packages still hold placeholder paths. Real per-brand content and ownership are not built.
- stripLocale() (guard-preview only) removes a leading /xx-xx segment before the allowlist check.

Test the guard logic directly, from apps/web on guard-preview:

    pnpm dlx tsx scripts/guard-check.ts

Last run: 18 cases, ALL PASSED. Do not test with an x-forwarded-host header against pnpm dev. The dev server ignores it and every host looks like localhost.

## Planned, not built: page ownership

Each page, blog, article, product and collection gets a custom.sites metafield (list of site keys). Loaders for single items return 404 when the current site is not listed. Listings and sitemaps filter by it. Unassigned items belong to no domain. The first listed site is the canonical owner. Product ownership may also be mirrored as a tag (site:<brand>). The metafield needs Storefront API read access.

## Local development (apps/web)

    cd apps/web
    pnpm dev                 (shopify hydrogen dev --codegen, http://localhost:3000)
    pnpm exec tsc --noEmit

Env vars are injected from Oxygen. Names only, never commit values: PUBLIC_STOREFRONT_ID, PUBLIC_STOREFRONT_API_TOKEN, PUBLIC_STORE_DOMAIN, PRIVATE_STOREFRONT_API_TOKEN, PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID, PUBLIC_CUSTOMER_ACCOUNT_API_URL, SHOP_ID, SESSION_SECRET, STRIPE_CHECKOUT_ENABLED, PUBLIC_STRIPE_PUBLISHABLE_KEY, PUBLIC_YOTPO_APP_KEY, STRIPE_SECRET_KEY, SHOPIFY_ADMIN_CLIENT_ID, SHOPIFY_ADMIN_CLIENT_SECRET.

apps/web/*.generated.d.ts are codegen output. Do not commit incidental changes to them.

## Auth worker (apps/auth)

- Deploy: cd apps/auth, then pnpm exec wrangler deploy (worker auth-dev, D1 database auth-dev).
- Custom domains listed by the last deploy: staff.ecombio.com, auth.bicyclebio.com, auth.skaterbio.com, auth.scooterbio.com.
- staff.ecombio.com returned 200 and is untouched.
- OPEN: the three auth.<brand> hosts did not resolve, and the zones' authoritative nameservers returned no record for them, even though Wrangler reported them deployed. The control DNS test was never finished. Check that all three zones are in the same Cloudflare account as the worker, and check Workers & Pages, auth-dev, Domains & Routes.
- Cookies are per host and cannot cross brand domains. All brands share one user table.

## Checkout

Shopify-hosted checkout stays the checkout and payment engine. The storefront owns the pages around it (/cart, optional /shipping, /payment shell, /confirmation). Checkout Kit only changes presentation and does not change payment fees (those depend on the payment provider). UNVERIFIED: whether Checkout Kit supports embedding in a browser-based Hydrogen page. Treat it as a separate spike after the base build.

## Known problems / open items

1. Aliases may not be running this repo's code (OPEN, blocks merging the guard). This repo has no /en-us route, and locally /en-us and /internal return 404. Live, / redirects to /en-us (200) and /internal redirects to /en-us/internal (404). The green main deploy may have published to a different storefront than the one the domains use. Resolve by reading the active Production deployment (commit SHA, environment, URL) in Shopify admin, Hydrogen channel, Site, Deployments.
2. Every alias canonicalizes to itself (canonical built from the request host), so identical pages exist on several hosts until ownership and canonical rules exist.
3. Per-brand content, ownership maps and SEO packages for aliasA/B/C are placeholders.
4. Auth host DNS records are missing (see Auth worker).
5. Auth edits are uncommitted. Commit separately with git add apps/auth after pnpm exec tsc --noEmit.
6. Security: a Cloudflare API token was pasted into a chat earlier and also exposed R2 credentials. Delete it (not just roll it), delete the read-only DNS tokens, and run pnpm exec wrangler logout if the deploy login should not persist.

## Safe-change rules

- Merge to main deploys to Production. Test on a branch (preview deploy) first.
- Do not remove the brand Workers or change apex/www DNS for bicyclebio, skaterbio or scooterbio without a working Hydrogen replacement.
- Keep Shopify-bound DNS records DNS-only (not proxied) unless Shopify's Oxygen domain docs say otherwise for that host.
- If a Production deploy misbehaves, promote the previous deployment from the Hydrogen channel's Deployments list.
- Stage files explicitly (git add <path>). Do not use git add . while unrelated edits are in the working tree.
