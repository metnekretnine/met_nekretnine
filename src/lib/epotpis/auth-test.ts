/** Only imported after the isolated development-test guard in auth.ts. */
import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { baseUrl, EPotpisError } from "./config";

const COOKIE = "met_epotpis_test_session";
const adminPassword = () => "met-demo-2026";
const digest = (value: string) => createHash("sha256").update(value).digest();
function mac(value: string) {
  const secret = "isolated-epotpis-tests-only";
  if (!secret) throw new EPotpisError("notConfigured", 503);
  return createHmac("sha256", secret).update(adminPassword()).update(value).digest("hex");
}
export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  try {
    const [expires, signature] = value.split(".");
    return Number(expires) > Date.now() && timingSafeEqual(digest(signature || ""), digest(mac(expires)));
  } catch { return false; }
}
export async function requireAdmin() { if (!await isAdmin()) throw new EPotpisError("authError", 401); }
export async function login(password: string, request: Request) {
  if (!timingSafeEqual(digest(password), digest(adminPassword()))) throw new EPotpisError("authError", 401);
  const expires = Date.now() + 8 * 60 * 60 * 1000;
  // Public signing links can use HTTPS while the local development server uses HTTP.
  // The API validates the request origin before calling login; production stays secure.
  const secure = process.env.NODE_ENV === "development" ? new URL(request.url).protocol === "https:" : baseUrl().startsWith("https:");
  (await cookies()).set(COOKIE, `${expires}.${mac(String(expires))}`, { httpOnly: true, secure, sameSite: "strict", path: "/", expires: new Date(expires) });
}
export async function logout() { (await cookies()).delete(COOKIE); }
