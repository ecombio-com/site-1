import type { BetterAuthOptions } from "better-auth";
import { admin } from "better-auth/plugins";

export const baseOptions = {
  baseURL: {
    allowedHosts: ["localhost:8788", "auth-dev.ecombiology.workers.dev", "staff.ecombio.com"],
    protocol: "auto",
  },
  trustedOrigins: ["http://localhost:3000", "https://www.ecombio.com", "https://staff.ecombio.com"],
  emailAndPassword: { enabled: true, disableSignUp: true },
  plugins: [admin()],
  advanced: {
    useSecureCookies: true,
    ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
  },
} satisfies BetterAuthOptions;
