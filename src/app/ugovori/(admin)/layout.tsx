import { headers } from "next/headers";
import { contractPaths } from "@/lib/epotpis/routes";
import { auth } from "@clerk/nextjs/server";
import { EPotpisSessionSync } from "@/components/EPotpisSessionSync/EPotpisSessionSync";
import { getLang } from "@/lib/utils";
import { getEPotpisTexts } from "@/lib/epotpis/texts";
import { EPotpisAdmin } from "@/components/EPotpisAdmin/EPotpisAdmin";
import { accountAccess } from "@/lib/epotpis/auth";
import { clerkConfigured, isolatedAuthTest } from "@/lib/epotpis/auth-config";
import { ClerkProvider } from "@clerk/nextjs";
import { hrHR } from "@clerk/localizations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export default async function EPotpisLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const paths = contractPaths((await headers()).get("host") || "");
  const [cms, access] = await Promise.all([getEPotpisTexts(lang), accountAccess()]);
  const test = isolatedAuthTest();
  const authMode = test ? "test" : access === "unconfigured" ? "unconfigured" : "clerk";
  const content = <EPotpisAdmin cmsData={cms.app} paths={paths} authenticated={access === "allowed"} authMode={authMode}>{children}</EPotpisAdmin>;
  if (test || !clerkConfigured()) return content;
  const { sessionId } = await auth();
  return <ClerkProvider localization={hrHR} signInUrl={paths.home} signInFallbackRedirectUrl={paths.home} afterSignOutUrl={paths.home}
    appearance={{ variables: { colorPrimary: "#101114", fontFamily: "var(--font-geist-sans), sans-serif", borderRadius: "8px" }, elements: { footerAction: { display: "none" }, card: { boxShadow: "none", border: "1px solid #e3e7ea", padding: "24px" }, formButtonPrimary: { borderRadius: "999px", boxShadow: "none", minHeight: "44px" }, formFieldInput: { minHeight: "44px" } } }}><EPotpisSessionSync serverSessionId={sessionId} loadingLabel={cms.app.loading}>{content}</EPotpisSessionSync></ClerkProvider>;

}
