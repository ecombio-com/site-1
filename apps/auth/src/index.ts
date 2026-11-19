import { Hono } from "hono";
import { createAuth, type Env } from "./auth";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("auth ok"));
app.all("/api/auth/*", (c) => createAuth(c.env).handler(c.req.raw));

export default app;
