/** Public URLs share the existing /ugovori route tree on the contracts host. */
export const CONTRACTS_HOST = "ugovori.metnekretnine.hr";
export const WEBSITE_ORIGIN = "https://metnekretnine.hr";

export function isContractsHost(host: string) {
  const hostname = host.toLowerCase().split(":")[0];
  return hostname === CONTRACTS_HOST
    || (process.env.NODE_ENV === "development" && hostname === "ugovori.localhost");
}

export function isContractPath(path: string) {
  return path === "/ugovori" || path.startsWith("/ugovori/");
}

export function shortContractPath(path: string) {
  return isContractPath(path) ? path.slice("/ugovori".length) || "/" : path;
}

export function internalContractPath(path: string) {
  if (path === "/") return "/ugovori";
  if (["/novi", "/postavke", "/profil", "/potpis"].some(route => path === route || path.startsWith(`${route}/`))) return `/ugovori${path}`;
  return null;
}

export function contractPaths(host: string) {
  const prefix = isContractsHost(host) ? "" : "/ugovori";
  return { home: prefix || "/", create: `${prefix}/novi`, settings: `${prefix}/postavke`, profile: `${prefix}/profil` };
}
export type ContractPaths = ReturnType<typeof contractPaths>;

export function signingUrl(origin: string, token: string) {
  const prefix = isContractsHost(new URL(origin).host) ? "" : "/ugovori";
  return `${origin}${prefix}/potpis/${encodeURIComponent(token)}`;
}
