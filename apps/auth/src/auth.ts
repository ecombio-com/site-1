import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { baseOptions } from "./options";
import * as schema from "./db/schema";

export interface Env {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  ALLOW_SIGNUP?: string;
}

export function createAuth(env: Env) {
  return betterAuth({
    ...baseOptions,
    emailAndPassword: { ...baseOptions.emailAndPassword, disableSignUp: env.ALLOW_SIGNUP !== "true" },
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(drizzle(env.DB, { schema }), { provider: "sqlite" }),
  });
}
