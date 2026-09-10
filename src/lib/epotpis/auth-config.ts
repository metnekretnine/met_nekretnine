/** Server / middleware authentication configuration. */
export const clerkConfigured = () => Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
export const isolatedAuthTest = () => process.env.NODE_ENV === "development"
  && process.env.EPOTPIS_AUTH_TEST_MODE === "true"
  && /^http:\/\/127\.0\.0\.1:\d+$/.test(process.env.EPOTPIS_SANITY_TEST_URL || "");
