/**
 * seo-packages.ts
 * SEO packages decide SEARCH behavior: metadata, canonical base, robots.
 * Domain packages decide RENDERING behavior and only point here by key.
 *
 * All domains/copy below are placeholders. Replace with your real values.
 */

export type RobotsDirective = 'index,follow' | 'noindex,nofollow';

export interface SeoPackage {
  key: string;
  siteName: string;
  /** Default <title> when a route doesn't supply one. */
  defaultTitle: string;
  /** "%s" is replaced with the route title. */
  titleTemplate: string;
  defaultDescription: string;
  /** Owning origin for canonical URLs, no trailing slash. */
  canonicalBase: string;
  robots: RobotsDirective;
  ogImage?: string;
}

export const SEO_PACKAGES = {
  primary: {
    key: 'primary',
    siteName: 'Primary Brand',
    defaultTitle: 'Primary Brand',
    titleTemplate: '%s | Primary Brand',
    defaultDescription: 'Primary Brand storefront.',
    canonicalBase: 'https://ecombio.com',
    robots: 'index,follow',
    ogImage: '/assets/primary/og.jpg',
  },
  aliasA: {
    key: 'aliasA',
    siteName: 'Alias A',
    defaultTitle: 'Alias A',
    titleTemplate: '%s | Alias A',
    defaultDescription: 'Alias A landing experience.',
    canonicalBase: 'https://bicyclebio.com',
    robots: 'index,follow',
    ogImage: '/assets/alias-a/og.jpg',
  },
  aliasB: {
    key: 'aliasB',
    siteName: 'Alias B',
    defaultTitle: 'Alias B',
    titleTemplate: '%s | Alias B',
    defaultDescription: 'Alias B landing experience.',
    canonicalBase: 'https://skaterbio.com',
    robots: 'index,follow',
    ogImage: '/assets/alias-b/og.jpg',
  },
  aliasC: {
    key: 'aliasC',
    siteName: 'Alias C',
    defaultTitle: 'Alias C',
    titleTemplate: '%s | Alias C',
    defaultDescription: 'Alias C landing experience.',
    canonicalBase: 'https://alias-c.com',
    robots: 'index,follow',
    ogImage: '/assets/alias-c/og.jpg',
  },
  /** Staging, preview, localhost, unknown hosts: never indexable. */
  nonProduction: {
    key: 'nonProduction',
    siteName: 'Preview',
    defaultTitle: 'Preview',
    titleTemplate: '%s | Preview',
    defaultDescription: 'Non-production preview.',
    canonicalBase: 'https://ecombio.com',
    robots: 'noindex,nofollow',
  },
} as const satisfies Record<string, SeoPackage>;

export type SeoPackageKey = keyof typeof SEO_PACKAGES;

export function getSeoPackage(key: SeoPackageKey): SeoPackage {
  return SEO_PACKAGES[key];
}

/** Canonical URL always points at the package's owning origin. */
export function buildCanonicalUrl(seo: SeoPackage, pathname: string): string {
  const path = pathname === '' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${seo.canonicalBase}${path}`;
}

export function shouldNoindex(seo: SeoPackage): boolean {
  return seo.robots === 'noindex,nofollow';
}

export interface RouteSeoInput {
  title?: string;
  description?: string;
  pathname: string;
}

/** Output shaped for Hydrogen's getSeoMeta(). Call only AFTER route is allowed. */
export function resolveSeo(seo: SeoPackage, input: RouteSeoInput) {
  return {
    title: input.title
      ? seo.titleTemplate.replace('%s', input.title)
      : seo.defaultTitle,
    description: input.description ?? seo.defaultDescription,
    url: buildCanonicalUrl(seo, input.pathname),
    robots: seo.robots,
    media: seo.ogImage
      ? { url: `${seo.canonicalBase}${seo.ogImage}`, type: 'image' as const }
      : undefined,
  };
}
