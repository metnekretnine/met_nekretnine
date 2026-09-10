"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { EPotpisLoader } from "../EPotpisLoader/EPotpisLoader";

/** Revalidate server authorization when Clerk changes sessions on the same route. */
export function EPotpisSessionSync({ serverSessionId, loadingLabel, children }: {
  serverSessionId: string | null; loadingLabel: string; children: ReactNode;
}) {
  const { isLoaded, sessionId } = useAuth();
  const router = useRouter();
  const requested = useRef<string | null>(null);
  const changed = isLoaded && (sessionId ?? null) !== serverSessionId;
  useEffect(() => {
    if (!changed) { requested.current = null; return; }
    const transition = JSON.stringify([serverSessionId, sessionId ?? null]);
    if (requested.current === transition) return;
    requested.current = transition;
    router.refresh();
    // A refresh can race Clerk's cookie update or its same-route navigation.
    // A full request also discards the stale App Router layout cache.
    const fallback = window.setTimeout(() => window.location.reload(), 2000);
    return () => window.clearTimeout(fallback);
  }, [changed, sessionId, serverSessionId, router]);
  // Never grant access from client session state: wait for server session validation.
  return <>
    {changed && <div className="ep-root"><main className="ep-main"><EPotpisLoader label={loadingLabel} /></main></div>}
    {/* Keep Clerk mounted so activating the session and writing cookies can finish. */}
    <div hidden={changed}>{children}</div>
  </>;
}
