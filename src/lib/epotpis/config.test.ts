/** @jest-environment node */
import { baseUrl } from "./config";
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
