/** @jest-environment node */
import { baseUrl } from "./config";
import { signingUrl } from "./routes";
import { namespace, recordId } from "./store";
const original = process.env;
beforeEach(() => { process.env = { NODE_ENV: "production" }; });
afterEach(() => { process.env = original; });
test("new installations use one namespace, while existing archives retain their IDs", () => {
  expect(recordId("contract", "123")).toBe("epotpis.contract.123");
  process.env.EPOTPIS_STORAGE_NAMESPACE = "epotpisDemo";
  expect(recordId("contract", "123")).toBe("epotpisDemo.contract.123");
  process.env.EPOTPIS_STORAGE_NAMESPACE = "epotpis.*";
  expect(namespace).toThrow();
});
test("production requires a configured secure URL", () => {
  expect(baseUrl).toThrow();
  process.env.EPOTPIS_BASE_URL = "http://contracts.example.com";
  expect(baseUrl).toThrow();
  process.env.EPOTPIS_BASE_URL = "https://contracts.example.com";
  expect(baseUrl()).toBe("https://contracts.example.com");
});

test.each([
  ["https://ugovori.metnekretnine.hr/", "https://ugovori.metnekretnine.hr/potpis/"],
  ["http://localhost:3000", "http://localhost:3000/ugovori/potpis/"],
])("signing links use the configured host and preserve the token: %s", (origin, prefix) => {
  process.env.EPOTPIS_BASE_URL = origin;
  const token = "a".repeat(64);
  expect(signingUrl(baseUrl(), token)).toBe(`${prefix}${token}`);
});
