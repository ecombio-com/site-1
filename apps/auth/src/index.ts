import { Hono } from "hono";
import { createAuth, type Env } from "./auth";
import { brandFor, safeReturn } from "./brands";
import { loginPage } from "./login";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("auth ok"));

app.get("/login", (c) => {
  const brand = brandFor(new URL(c.req.url).host);
  if (!brand) return c.text("Unknown host", 404);
  c.header("Cache-Control", "no-store");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "no-referrer");
  return c.html(loginPage(brand, safeReturn(brand, c.req.query("next"))));
});

app.all("/api/auth/*", (c) => createAuth(c.env, new URL(c.req.url).host).handler(c.req.raw));

export default app;
