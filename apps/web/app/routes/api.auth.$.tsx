import type { Route } from "./+types/api.auth.$";

async function proxy({ request, context }: Route.LoaderArgs) {
  const base = context.env.AUTH_URL;
  if (!base) return new Response("Auth not configured", { status: 503 });
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/auth/sign-up")) return new Response("Not found", { status: 404 });
  const headers = new Headers(request.headers);
  headers.delete("host");
  const init: RequestInit = { method: request.method, headers, redirect: "manual" };
  if (request.method !== "GET" && request.method !== "HEAD") init.body = await request.arrayBuffer();
  const res = await fetch(base + url.pathname + url.search, init);
  const out = new Headers(res.headers);
  out.delete("content-encoding");
  out.delete("content-length");
  return new Response(res.body, { status: res.status, headers: out });
}

export const loader = proxy;
export const action = proxy;
