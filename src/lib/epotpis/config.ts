
export class EPotpisError extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}
export function baseUrl() {
  const value = process.env.EPOTPIS_BASE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
  if (!value) throw new EPotpisError("notConfigured", 503);
  const url = new URL(value);
  if (url.username || url.password || !["http:", "https:"].includes(url.protocol)) throw new EPotpisError("notConfigured", 503);
  if (process.env.NODE_ENV !== "development" && url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) throw new EPotpisError("notConfigured", 503);
  return url.origin;
}
export const resendApiKey = () => process.env.EPOTPIS_RESEND_API_KEY || process.env.RESEND_API_KEY;

export function emailSender() {
  const configured = process.env.EPOTPIS_EMAIL_FROM?.trim() || "";
  const address = configured.match(/<([^<>]+)>$/)?.[1]?.trim() || configured;
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(address)) throw new EPotpisError("notConfigured", 503);
  return `Maja Mara | MET d.o.o. <${address}>`;
}
