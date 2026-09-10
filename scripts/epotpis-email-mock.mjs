// Loaded only by the isolated E2E server, before Next.js installs its fetch wrapper.
const testUrl = process.env.EPOTPIS_SANITY_TEST_URL;
if (process.env.NODE_ENV !== "development" || !/^http:\/\/127\.0\.0\.1:\d+$/.test(testUrl || "") || process.env.EPOTPIS_RESEND_API_KEY !== "local-test-resend-key") {
  throw new Error("Email mock requires the isolated test server");
}

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input);
  if (url.hostname !== "api.resend.com") return realFetch(input, init);
  if (url.pathname !== "/emails") throw new Error("Unexpected Resend test request");
  return realFetch(new Request(`${testUrl}/__emails`, new Request(input, init)));
};
