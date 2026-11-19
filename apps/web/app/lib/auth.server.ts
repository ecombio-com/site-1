export type AuthUser = { id: string; email: string; name: string; role?: string };

export async function getAuthUser(request: Request, env: Env): Promise<AuthUser | null> {
  const base = env.AUTH_URL;
  const cookie = request.headers.get("Cookie");
  if (!base || !cookie) return null;
  try {
    const res = await fetch(base + "/api/auth/get-session", { headers: { Cookie: cookie, Origin: new URL(request.url).origin } });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: AuthUser } | null;
    return data?.user ?? null;
  } catch {
    return null;
  }
}
