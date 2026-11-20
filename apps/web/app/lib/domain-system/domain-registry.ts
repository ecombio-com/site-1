/**
 * domain-registry.ts
 * hostname -> domain package key -> (domain package, SEO package)
 *
 * This is the only file that knows which hostnames exist. Placeholders
 * below must be replaced with your real domains.
 *
 * Intended use in Hydrogen (e.g. in your server/load-context or root loader):
 *
 *   const resolved = resolveRequest(request);
 *   if (resolved.kind === 'unknown') throw new Response('Not found', {status: 404});
 *   const decision = decideRoute(resolved.domain, new URL(request.url).pathname);
 *   ...then resolveSeo(resolved.seo, {...}) only when decision.action === 'render'.
 */

import {
  DOMAIN_PACKAGES,
  type DomainPackage,
  type DomainPackageKey,
} from './domain-packages';
import {SEO_PACKAGES, type SeoPackage} from './seo-packages';

/** Normalized hostname (no www, no port, lowercase) -> package key. */
export const DOMAIN_REGISTRY: Record<string, DomainPackageKey> = {
  'ecombio.com': 'primary',
  'bicyclebio.com': 'aliasA',
  'skaterbio.com': 'aliasB',
  'alias-c.com': 'aliasC',

  // Staging / preview hosts reuse the noindex fallback package.
  'staging.ecombio.com': 'fallback',
};

/**
 * Checkout hosts are a separate class: Shopify serves these, Hydrogen
 * should never try to render storefront routes for them.
 */
export const CHECKOUT_HOSTS: ReadonlySet<string> = new Set([
  'checkout.ecombio.com',
]);

/** Hosts treated as local dev; they get the fallback package. */
const LOCAL_HOST_PATTERNS = [/^localhost$/, /^127\.0\.0\.1$/, /\.tryhydrogen\.dev$/, /\.myshopify\.dev$/];

/** What to do when a host is in none of the lists above. */
export const UNKNOWN_HOST_POLICY: 'fallback' | '404' = '404';

export function normalizeHost(rawHost: string): string {
  return rawHost
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
    .replace(/\.$/, '')
    .replace(/^www\./, '');
}

export type ResolvedRequest =
  | {
      kind: 'storefront';
      host: string;
      domainKey: DomainPackageKey;
      domain: DomainPackage;
      seo: SeoPackage;
      usedFallback: boolean;
    }
  | {kind: 'checkout'; host: string}
  | {kind: 'unknown'; host: string};

export function resolveHost(rawHost: string): ResolvedRequest {
  const host = normalizeHost(rawHost);

  if (CHECKOUT_HOSTS.has(host)) return {kind: 'checkout', host};

  const registered = DOMAIN_REGISTRY[host];
  if (registered) return build(host, registered, false);

  if (LOCAL_HOST_PATTERNS.some((p) => p.test(host))) {
    return build(host, 'fallback', true);
  }

  logUnknownHost(host);
  return UNKNOWN_HOST_POLICY === 'fallback'
    ? build(host, 'fallback', true)
    : {kind: 'unknown', host};
}

export function resolveRequest(request: Request): ResolvedRequest {
  // Prefer the forwarded host if a proxy sits in front (e.g. Cloudflare Worker).
  // Only trust this header if your own proxy sets it, never a client.
  const url = new URL(request.url);
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(url.host);
  const forwarded = isLocal ? request.headers.get('x-forwarded-host') : null;
  const host = forwarded ?? url.host;
  return resolveHost(host);
}

function build(
  host: string,
  domainKey: DomainPackageKey,
  usedFallback: boolean,
): ResolvedRequest {
  const domain = DOMAIN_PACKAGES[domainKey] as DomainPackage;
  const seo = SEO_PACKAGES[domain.seoPackage] as SeoPackage;
  if (usedFallback) console.warn(`[domain-registry] fallback package used for host "${host}"`);
  return {kind: 'storefront', host, domainKey, domain, seo, usedFallback};
}

function logUnknownHost(host: string): void {
  console.warn(`[domain-registry] unknown host "${host}"`);
}
