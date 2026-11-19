import type { BetterAuthOptions } from "better-auth";
import { admin } from "better-auth/plugins";

export const baseOptions = {
  baseURL: {
    allowedHosts: ["localhost:8788"],
    protocol: "http",
  },
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: { enabled: true },
  plugins: [admin()],
  advanced: {
    ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
  },
} satisfies BetterAuthOptions;
