"use client";
import { SignIn, SignOutButton } from "@clerk/nextjs";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, ExternalLink, LogOut, Plus, Settings2, UserRound } from "lucide-react";
import type { EPotpisTexts } from "@/lib/epotpis/texts";
import type { AdminContract } from "@/lib/epotpis/types";
import { api } from "@/lib/epotpis/browser";
import { LogoCompany as EPotpisLogo } from "@/components/Icons/LogoCompany";
import { EPotpisLoader } from "../EPotpisLoader/EPotpisLoader";

interface AdminState {
  cms: EPotpisTexts; contracts: AdminContract[]; hasSignature: boolean; signatureUrl: string; busy: boolean;
  createdLink: string; refresh: () => Promise<void>; run: (action: () => Promise<void>) => Promise<void>;
  setError: (value: string) => void; setNotice: (value: string) => void; setCreatedLink: (value: string) => void;
  showCreated: (link: string) => void; copy: (link: string) => Promise<void>;
}
const AdminContext = createContext<AdminState | null>(null);
export function useEPotpisAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("Missing ePotpis admin layout");
  return value;
}
interface Props { cmsData: EPotpisTexts; authenticated: boolean; authMode: "clerk" | "test" | "unconfigured"; children: ReactNode }
interface Feedback { path: string; error: string; notice: string; link: string }
const emptyFeedback = { path: "", error: "", notice: "", link: "" };

// The persistent layout shares authentication and server data. Each route owns its form state.
export function EPotpisAdmin({ cmsData: c, authenticated, authMode, children }: Props) {
  const pathname = usePathname(), router = useRouter();
  const [loggedIn, setLoggedIn] = useState(authenticated);
  useEffect(() => { setLoggedIn(authenticated); }, [authenticated]);
  const [contracts, setContracts] = useState<AdminContract[]>([]);
  const [dataReady, setDataReady] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(emptyFeedback);
  const current = feedback.path === pathname ? feedback : emptyFeedback;
  const setField = (key: "error" | "notice" | "link", value: string) => setFeedback(previous => ({ ...(previous.path === pathname ? previous : emptyFeedback), path: pathname, [key]: value }));
  const setError = (value: string) => setField("error", value);
  const setNotice = (value: string) => setField("notice", value);
  const setCreatedLink = (value: string) => setField("link", value);
  const refresh = useCallback(async () => {
    const data = await api<{ contracts: AdminContract[]; hasSignature: boolean }>("/api/ugovori/contracts");
    setContracts(data.contracts); setHasSignature(data.hasSignature);
    setSignatureUrl(data.hasSignature ? `/api/ugovori/settings/signature?t=${Date.now()}` : "");
    setDataReady(true);
  }, []);
  useEffect(() => {
    if (!loggedIn) return;
    void refresh().catch(error => {
      if (error instanceof Error && error.message === "authError") { setLoggedIn(false); setContracts([]); setDataReady(false); if (authMode !== "test") router.refresh(); }
      else setFeedback({ path: pathname, error: c.error, notice: "", link: "" });
    });
  }, [loggedIn, pathname, refresh, c.error, authMode, router]);
  useEffect(() => { setFeedback(previous => previous.path === pathname ? previous : emptyFeedback); }, [pathname]);
  async function run(action: () => Promise<void>) {
    setBusy(true); setFeedback(emptyFeedback);
    try { await action(); }
    catch (error) {
      const key = error instanceof Error ? error.message : "error";
      setError(c[key as keyof typeof c] || c.error);
    } finally { setBusy(false); }
  }
  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const password = String(new FormData(event.currentTarget).get("password"));
    await run(async () => { await api("/api/ugovori/session", { password }); setDataReady(false); setLoggedIn(true); });
  }
  async function logout() {
    setLoggingOut(true);
    await run(async () => {
      await api("/api/ugovori/session", { logout: true });
      setLoggedIn(false); setDataReady(false); setContracts([]); setHasSignature(false); setSignatureUrl("");
      router.replace("/ugovori"); router.refresh();
    });
    setLoggingOut(false);
  }
  async function copy(link: string) { try { await navigator.clipboard.writeText(link); setNotice(c.copied); } catch { setCreatedLink(link); } }
  function showCreated(link: string) { setFeedback({ path: "/ugovori", error: "", notice: c.createdNotice, link }); }
  const state: AdminState = { cms: c, contracts, hasSignature, signatureUrl, busy, createdLink: current.link, refresh, run, setError, setNotice, setCreatedLink, copy, showCreated };
  const title = pathname === "/ugovori/novi" ? c.newContract : pathname === "/ugovori/postavke" ? c.settings : pathname === "/ugovori/profil" ? c.myProfile : c.title;
  return <AdminContext.Provider value={state}><div className="ep-root">
    {loggedIn && <header className="ep-header"><Link href="/ugovori" className="ep-brand"><EPotpisLogo aria-label={c.brand} /></Link>
      <nav><Link href="/ugovori/postavke" title={c.settings} aria-label={c.settings} aria-current={pathname === "/ugovori/postavke" ? "page" : undefined}
        aria-disabled={busy} onClick={event => { if (busy) event.preventDefault(); }}><Settings2 size={19} /><span>{c.settings}</span></Link>
        {authMode !== "test" && <Link href="/ugovori/profil" title={c.myProfile} aria-label={c.myProfile}><UserRound size={19} /><span>{c.myProfile}</span></Link>}
        {authMode === "test" ? <button title={c.logout} aria-label={c.logout} disabled={busy} onClick={() => void logout()}>{loggingOut ? <span className="ep-loader-spinner" /> : <LogOut size={19} />}</button>
          : <SignOutButton redirectUrl="/ugovori"><button title={c.logout} aria-label={c.logout} disabled={busy}><LogOut size={19} /></button></SignOutButton>}</nav>
    </header>}
    <main className={`ep-main ${!loggedIn ? "ep-login-main" : ""}`}>
      {!loggedIn ? authMode === "unconfigured" ? <section className="ep-panel ep-login"><EPotpisLogo className="ep-login-logo" aria-label={c.brand} /><h1>{c.loginTitle}</h1><p role="alert">{c.authNotConfigured}</p></section>
        : authMode === "clerk" ? <section className="ep-clerk-login"><header className="ep-clerk-brand"><EPotpisLogo className="ep-login-logo" aria-label={c.brand} /><h1>{c.loginTitle}</h1></header><SignIn routing="hash" forceRedirectUrl={pathname} withSignUp={false} transferable={false} fallback={<EPotpisLoader label={c.loading} />} /></section>
        : <form className="ep-panel ep-login" onSubmit={login}><EPotpisLogo className="ep-login-logo" aria-label={c.brand} /><h1>{c.loginTitle}</h1>
        <label className="ep-field">{c.password}<input name="password" type="password" defaultValue="met-demo-2026" placeholder={c.passwordPlaceholder} required autoComplete="current-password" minLength={8} /></label>
        {current.error && <p role="alert" className="ep-error">{current.error}</p>}<button className="ep-button" disabled={busy} aria-busy={busy}>{busy ? <EPotpisLoader variant="inline" label={c.loading} /> : c.login}</button>
      </form> : <>
        {pathname !== "/ugovori" && <Link className="ep-back" href="/ugovori" aria-disabled={busy} onClick={event => { if (busy) event.preventDefault(); }}><ArrowLeft size={17} />{c.back}</Link>}
        <div className="ep-heading"><h1 id="ep-heading" tabIndex={-1}>{title}</h1>
          {pathname === "/ugovori" && <Link className="ep-button" href="/ugovori/novi" aria-disabled={busy || !dataReady}
            onClick={event => { if (busy || !dataReady) event.preventDefault(); }}><Plus size={18} />{c.newContract}</Link>}
        </div>
        {current.error && <p className="ep-error" role="alert">{current.error}</p>}{current.notice && <p className="ep-notice" role="status"><Check size={17} />{current.notice}</p>}
        {current.link && <div className="ep-share"><input aria-label={c.copyLink} readOnly value={current.link} onFocus={e => e.target.select()} /><button className="ep-button" onClick={() => void copy(current.link)}><Copy size={17} />{c.copyLink}</button><a aria-label={c.viewDocument} href={current.link} target="_blank" rel="noreferrer"><ExternalLink size={20} /></a></div>}
        {dataReady || pathname === "/ugovori/profil" ? children : !current.error ? <EPotpisLoader label={c.loading} /> : null}
      </>}
    </main>
  </div></AdminContext.Provider>;
}
