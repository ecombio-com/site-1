import {resolveRequest, type ResolvedRequest} from './domain-registry';
import {decideRoute} from './domain-packages';

type StorefrontRequest = Extract<ResolvedRequest, {kind: 'storefront'}>;

export type GuardResult =
  | {ok: true; resolved: StorefrontRequest}
  | {ok: false; response: Response};

/** Framework/infra paths that domain rules must never block. */
const PASSTHROUGH_PREFIXES = [
  '/assets/',
  '/__manifest',
  '/.well-known/',
  '/favicon',
  '/robots.txt',
  '/sitemap', // TODO: per-domain sitemaps and robots
];

/** React Router single-fetch requests: /about.data -> /about, /_root.data -> / */
export function toRoutePath(pathname: string): string {
  if (pathname === '/_root.data') return '/';
  if (pathname.endsWith('.data')) return pathname.slice(0, -5) || '/';
  return pathname;
}

export function guardRequest(request: Request): GuardResult {
  const resolved = resolveRequest(request);
  if (resolved.kind !== 'storefront') return {ok: false, response: blocked()};

  const url = new URL(request.url);
  if (PASSTHROUGH_PREFIXES.some((p) => url.pathname.startsWith(p))) {
    return {ok: true, resolved};
  }

  const decision = decideRoute(resolved.domain, toRoutePath(url.pathname));
  switch (decision.action) {
    case 'render':
      return {ok: true, resolved};
    case 'redirect':
      return {
        ok: false,
        response: Response.redirect(
          new URL(decision.location, url.origin).toString(),
          decision.status,
        ),
      };
    default:
      return {ok: false, response: blocked()};
  }
}

function blocked(): Response {
  return new Response('Not found', {
    status: 404,
    headers: {'X-Domain-Guard': 'blocked', 'X-Robots-Tag': 'noindex'},
  });
}
