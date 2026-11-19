import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { baseOptions } from "./src/options";

export const auth = betterAuth({
  ...baseOptions,
  secret: "cli-only-placeholder-secret-not-used-at-runtime",
  database: drizzleAdapter({} as never, { provider: "sqlite" }),
});
