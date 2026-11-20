/**
 * domain-packages.ts
 * Domain packages decide RENDERING behavior: brand, allowed routes,
 * navigation, features, checkout eligibility. Search behavior lives in
 * seo-packages.ts and is linked by `seoPackage`.
 *
 * Rule: allowlists only. A path not listed here does not render.
 * All paths/handles below are placeholders from the planning chat.
 */

import type {SeoPackageKey} from './seo-packages';

export type EnvironmentType = 'production' | 'alias' | 'staging' | 'fallback';

export interface DomainPackage {
  key: string;
  environment: EnvironmentType;

  brand: {
    name: string;
    logo: string;
    favicon: string;
    colors?: {primary?: string; accent?: string};
  };

  routing: {
    /** Exact pathnames that may render. */
    allowedPaths: readonly string[];
    /** Prefix matches, e.g. '/products/'. Use a trailing slash. */
    allowedPrefixes: readonly string[];
    /** Old path -> new path (same domain). Checked before allow rules. */
    redirects?: Record<string, string>;
    /** What to do with a path this domain does not own. */
    notFoundMode: '404' | 'redirect-to-owner';
    /** Used when notFoundMode is 'redirect-to-owner'. */
    ownerOrigin?: string;
  };

  navigation: {
    headerMenuHandle?: string;
    footerMenuHandle?: string;
    announcementBar?: string;
  };

  features: {
    reviews: boolean;
    chat: boolean;
    promos: boolean;
  };

  checkout: {
    /** Can customers start checkout from this domain? */
    allowCheckout: boolean;
    /** Shopify-hosted checkout host (informational; Shopify owns it). */
    checkoutDomain?: string;
  };

  seoPackage: SeoPackageKey;
}

const COMMERCE_PATHS = ['/cart', '/shipping', '/payment', '/confirmation'];

export const DOMAIN_PACKAGES = {
  primary: {
    key: 'primary',
    environment: 'production',
    brand: {
      name: 'Primary Brand',
      logo: '/assets/primary/logo.svg',
      favicon: '/assets/primary/favicon.ico',
      colors: {primary: '#111111', accent: '#C9A227'},
    },
    routing: {
      allowedPaths: [
        '/',
        '/about',
        '/pages/brand-story',
        '/collections/main',
        '/collections', '/search', '/policies', '/blogs', '/account', '/internal',
        ...COMMERCE_PATHS,
      ],
      allowedPrefixes: ['/products/', '/collections/', '/pages/', '/blogs/', '/policies/', '/account/', '/cart/', '/discount/', '/api/', '/internal/'], // primary = full site; tighten with ownership maps later
      redirects: {'/home': '/'},
      notFoundMode: '404',
    },
    navigation: {
      headerMenuHandle: 'primary-main-menu',
      footerMenuHandle: 'primary-footer-menu',
    },
    features: {reviews: true, chat: false, promos: true},
    checkout: {allowCheckout: true, checkoutDomain: 'checkout.ecombio.com'},
    seoPackage: 'primary',
  },

  aliasA: {
    key: 'aliasA',
    environment: 'alias',
    brand: {
      name: 'Alias A',
      logo: '/assets/alias-a/logo.svg',
      favicon: '/assets/alias-a/favicon.ico',
    },
    routing: {
      allowedPaths: ['/', '/pages/alias-a-landing', '/collections/alias-a'],
      allowedPrefixes: [],
      notFoundMode: '404',
    },
    navigation: {headerMenuHandle: 'alias-a-main-menu'},
    features: {reviews: false, chat: false, promos: false},
    checkout: {allowCheckout: false},
    seoPackage: 'aliasA',
  },

  aliasB: {
    key: 'aliasB',
    environment: 'alias',
    brand: {
      name: 'Alias B',
      logo: '/assets/alias-b/logo.svg',
      favicon: '/assets/alias-b/favicon.ico',
    },
    routing: {
      allowedPaths: ['/', '/pages/alias-b-landing'],
      allowedPrefixes: [],
      notFoundMode: '404',
    },
    navigation: {},
    features: {reviews: false, chat: false, promos: false},
    checkout: {allowCheckout: false},
    seoPackage: 'aliasB',
  },

  aliasC: {
    key: 'aliasC',
    environment: 'alias',
    brand: {
      name: 'Alias C',
      logo: '/assets/alias-c/logo.svg',
      favicon: '/assets/alias-c/favicon.ico',
    },
    routing: {
      allowedPaths: ['/', '/pages/alias-c-landing'],
      allowedPrefixes: [],
      notFoundMode: '404',
    },
    navigation: {},
    features: {reviews: false, chat: false, promos: false},
    checkout: {allowCheckout: false},
    seoPackage: 'aliasC',
  },

  /** Staging, preview, localhost, and (optionally) unknown hosts. */
  fallback: {
    key: 'fallback',
    environment: 'fallback',
    brand: {
      name: 'Preview',
      logo: '/assets/primary/logo.svg',
      favicon: '/assets/primary/favicon.ico',
    },
    routing: {
      allowedPaths: ['/', ...COMMERCE_PATHS],
      allowedPrefixes: ['/'], // non-production: render everything, noindex via SEO package
      notFoundMode: '404',
    },
    navigation: {},
    features: {reviews: false, chat: false, promos: false},
    checkout: {allowCheckout: true},
    seoPackage: 'nonProduction',
  },
} as const satisfies Record<string, DomainPackage>;

export type DomainPackageKey = keyof typeof DOMAIN_PACKAGES;

export function getDomainPackage(key: DomainPackageKey): DomainPackage {
  return DOMAIN_PACKAGES[key];
}

export type RouteDecision =
  | {action: 'render'}
  | {action: 'redirect'; location: string; status: 301 | 302}
  | {action: 'not-found'};

/**
 * Decide render / redirect / 404 for a pathname on a given domain.
 * Pure function: no request or env access, easy to unit test.
 */
export function decideRoute(pkg: DomainPackage, pathname: string): RouteDecision {
  const path = normalizePath(pathname);
  const r = pkg.routing;

  const moved = r.redirects?.[path];
  if (moved) return {action: 'redirect', location: moved, status: 301};

  const allowed =
    r.allowedPaths.includes(path) ||
    r.allowedPrefixes.some((prefix) => path.startsWith(prefix));
  if (allowed) return {action: 'render'};

  if (r.notFoundMode === 'redirect-to-owner' && r.ownerOrigin) {
    return {action: 'redirect', location: `${r.ownerOrigin}${path}`, status: 301};
  }
  return {action: 'not-found'};
}

/** Strip trailing slash (except root) so '/about/' matches '/about'. */
export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname || '/';
}

export function canStartCheckout(pkg: DomainPackage): boolean {
  return pkg.checkout.allowCheckout;
}
