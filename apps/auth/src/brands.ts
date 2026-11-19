export interface Brand {
  name: string;
  accent: string;
  returnOrigins: string[];
  defaultReturn: string;
}

const ecombio: Brand = {
  name: "EcomBio",
  accent: "#0f766e",
  returnOrigins: ["https://www.ecombio.com", "http://localhost:3000"],
  defaultReturn: "https://www.ecombio.com/internal",
};

const hosts: Record<string, Brand> = {
  "localhost:8788": { ...ecombio, defaultReturn: "http://localhost:3000/internal" },
  "auth-dev.ecombiology.workers.dev": ecombio,
  "auth.ecombio.com": ecombio,
};

export function brandFor(host: string): Brand | undefined {
  return hosts[host.toLowerCase()];
}

export function safeReturn(brand: Brand, next: string | undefined): string {
  if (!next) return brand.defaultReturn;
  try {
    const u = new URL(next);
    if (brand.returnOrigins.includes(u.origin)) return u.toString();
  } catch {}
  return brand.defaultReturn;
}
