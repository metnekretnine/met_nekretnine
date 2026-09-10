import { auth } from "@clerk/nextjs/server";
import { baseUrl, EPotpisError } from "./config";
import { clerkConfigured, isolatedAuthTest } from "./auth-config";

export async function accountAccess(): Promise<"allowed" | "signedOut" | "unconfigured"> {
  if (isolatedAuthTest()) return await (await import("./auth-test")).isAdmin() ? "allowed" : "signedOut";
  if (!clerkConfigured()) return "unconfigured";
  const { userId } = await auth();
  // Account creation is managed in Clerk with Invite-only access mode.
  return userId ? "allowed" : "signedOut";
}
export async function isAdmin() { return await accountAccess() === "allowed"; }
export async function requireAdmin() {
  const access = await accountAccess();
  if (access === "unconfigured") throw new EPotpisError("notConfigured", 503);
  if (access !== "allowed") throw new EPotpisError("authError", 401);
}
// The old session endpoint exists solely for isolated, non-production tests.
export async function login(password: string, request: Request) {
  if (!isolatedAuthTest()) throw new EPotpisError("authError", 401);
  return (await import("./auth-test")).login(password, request);
}
export async function logout() {
  if (!isolatedAuthTest()) throw new EPotpisError("authError", 401);
  return (await import("./auth-test")).logout();
}

function isLocalDevelopmentRequest(request: Request, origin: string): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  try {
    const url = new URL(origin);
    if (url.origin !== origin || !["http:", "https:"].includes(url.protocol)) return false;
    // Next can use an internal hostname in request.url; Host retains the browser's address.
    const host = request.headers.get("host") || new URL(request.url).host;
    if (url.host !== host.toLowerCase()) return false;
    const hostname = url.hostname;
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) return true;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      const [first, second] = hostname.split(".").map(Number);
      return first === 127 || first === 10 || (first === 192 && second === 168)
        || (first === 172 && second >= 16 && second <= 31)
        || (first === 169 && second === 254);
    }
    // IPv6 loopback, unique-local and link-local addresses.
    return hostname === "[::1]" || /^\[(?:f[cd][0-9a-f]{2}|fe[89ab][0-9a-f]):/.test(hostname);
  } catch { return false; }
}
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || (!isLocalDevelopmentRequest(request, origin) && origin !== baseUrl())) throw new EPotpisError("authError", 403);
}
