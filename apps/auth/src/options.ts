import type { BetterAuthOptions } from "better-auth";

export const baseOptions = {
  baseURL: {
    allowedHosts: ["localhost:8788"],
    protocol: "http",
  },
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: { enabled: true },
  advanced: {
    ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
  },
} satisfies BetterAuthOptions;
