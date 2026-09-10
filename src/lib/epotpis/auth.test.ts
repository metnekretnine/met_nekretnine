/** @jest-environment node */
import { accountAccess, requireAdmin, requireSameOrigin, login, logout } from "./auth";
import { isolatedAuthTest } from "./auth-config";
const mockAuth = jest.fn();
jest.mock("@clerk/nextjs/server", () => ({ auth: () => mockAuth() }));
const original = { ...process.env };
beforeEach(() => {
  process.env = { ...original, NODE_ENV: "production", NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_fixture", CLERK_SECRET_KEY: "sk_test_fixture", EPOTPIS_STORAGE_NAMESPACE: "epotpisDemo" };
  mockAuth.mockReset();
});
afterAll(() => { process.env = original; });
test.each(["user_maja", "user_filip", "user_new_from_clerk"])("every authenticated Clerk account has access without extra configuration: %s", async userId => {
  mockAuth.mockResolvedValue({ userId });
  expect(await accountAccess()).toBe("allowed");
  await expect(requireAdmin()).resolves.toBeUndefined();
});
test("signed out sessions cannot read admin data", async () => {
  mockAuth.mockResolvedValue({ userId: null });
  await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
});
test.each(["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"])("missing %s fails closed, regardless of the storage namespace", async key => {
  delete process.env[key];
  expect(await accountAccess()).toBe("unconfigured");
  await expect(requireAdmin()).rejects.toMatchObject({ status: 503 });
  expect(mockAuth).not.toHaveBeenCalled();
});
test("Clerk errors do not grant access", async () => {
  mockAuth.mockRejectedValue(new Error("Unavailable"));
  await expect(requireAdmin()).rejects.toThrow("Unavailable");
});
test("legacy login and test flags cannot bypass production auth", async () => {
  process.env.EPOTPIS_AUTH_TEST_MODE = "true";
  process.env.EPOTPIS_SANITY_TEST_URL = "http://127.0.0.1:3456";
  expect(isolatedAuthTest()).toBe(false);
  await expect(login("met-demo-2026", new Request("https://example.test"))).rejects.toMatchObject({ status: 401 });
  await expect(logout()).rejects.toMatchObject({ status: 401 });
});
test("test mode requires both development and the isolated loopback store", () => {
  Object.assign(process.env, { NODE_ENV: "development", EPOTPIS_AUTH_TEST_MODE: "true", EPOTPIS_SANITY_TEST_URL: "https://real.example" });
  expect(isolatedAuthTest()).toBe(false);
  process.env.EPOTPIS_SANITY_TEST_URL = "http://127.0.0.1:3456";
  expect(isolatedAuthTest()).toBe(true);
  delete process.env.EPOTPIS_AUTH_TEST_MODE;
  expect(isolatedAuthTest()).toBe(false);
});

const localOrigins = [
  "http://localhost:3000", "http://app.localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.2:3002",
  "http://192.168.100.80:3000", "http://10.0.0.5:4000", "https://172.16.0.2:3000", "http://172.31.255.254:3000",
  "http://169.254.1.2:3000", "http://macbook.local:3000", "http://[::1]:3000", "http://[fd12::1]:3000", "http://[fe80::1]:3000",
];
test.each(localOrigins)("local development accepts same-host requests from %s without bypassing login", async origin => {
  Object.assign(process.env, { NODE_ENV: "development", EPOTPIS_BASE_URL: "https://metnekretnine.hr", EPOTPIS_AUTH_TEST_MODE: "false" });
  const request = new Request("http://localhost:3000/api/ugovori/contracts", { headers: { origin, host: new URL(origin).host } });
  expect(() => requireSameOrigin(request)).not.toThrow();
  mockAuth.mockResolvedValue({ userId: null });
  await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
});
test.each(localOrigins)("production rejects additional local origin %s", origin => {
  process.env.EPOTPIS_BASE_URL = "https://metnekretnine.hr";
  expect(() => requireSameOrigin(new Request(`${origin}/api/ugovori/contracts`, { headers: { origin } }))).toThrow();
});
test.each(["http://8.8.8.8:3000", "http://172.15.1.1:3000", "http://172.32.0.1:3000", "http://192.169.0.1:3000", "https://evil.example", "http://localhost.evil.example:3000", "http://[2001:db8::1]:3000"])("development rejects unconfigured public origin %s", origin => {
  Object.assign(process.env, { NODE_ENV: "development", EPOTPIS_BASE_URL: "https://metnekretnine.hr" });
  expect(() => requireSameOrigin(new Request(`${origin}/api/ugovori/contracts`, { headers: { origin } }))).toThrow();
});
test.each(["http://localhost:3001", "http://192.168.100.80:3000", "http://localhost:3000/path", "http://user:pass@localhost:3000", "null", "", "not a URL"])("local requests reject mismatched hosts, ports or invalid origins: %s", origin => {
  Object.assign(process.env, { NODE_ENV: "development", EPOTPIS_BASE_URL: "https://metnekretnine.hr" });
  expect(() => requireSameOrigin(new Request("http://localhost:3000/api/ugovori/contracts", { headers: { origin } }))).toThrow();
});
test.each(["development", "production"])("the configured application origin remains accepted in %s", nodeEnv => {
  Object.assign(process.env, { NODE_ENV: nodeEnv, EPOTPIS_BASE_URL: "https://metnekretnine.hr" });
  expect(() => requireSameOrigin(new Request("http://localhost:3000/api/ugovori/contracts", { headers: { origin: "https://metnekretnine.hr" } }))).not.toThrow();
});
