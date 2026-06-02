"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Cookie } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { COOKIE_CONSENT_NAME, COOKIE_POLICY_LINK } from "@/lib/constants";
import { cn } from "@/shadcn/lib/utils";
import { CookieConsentSectionCMS } from "@/sanity/queries";

interface CookieConsentProps {
  cmsData: CookieConsentSectionCMS;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ cmsData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hide, setHide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const saveConsent = useCallback((analytics: boolean) => {
    setIsOpen(false);
    Cookies.set(
      COOKIE_CONSENT_NAME,
      JSON.stringify({ necessary: true, analytics }),
      { expires: 365 }
    );
    window.dispatchEvent(new Event("cookie-consent-updated"));
    setTimeout(() => setHide(true), 700);
  }, []);

  useEffect(() => {
    try {
      const consent = Cookies.get(COOKIE_CONSENT_NAME);
      if (!consent) {
        setIsOpen(true);
      } else {
        setHide(true);
      }
    } catch (error) {
      console.warn("Cookie consent error:", error);
    }
  }, []);

  if (hide) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 w-full transition-all duration-500 sm:left-6 sm:bottom-6 sm:max-w-md",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
      )}
    >
      <div className="m-4 rounded-lg border border-foreground/10 bg-white p-6 shadow-[0_18px_60px_rgba(16,17,20,0.14)] sm:m-0">
        <div className="flex items-center gap-3 mb-4">
          <Cookie className="h-4 w-4 shrink-0 text-foreground" />
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
            {cmsData.title}
          </h3>
        </div>

        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          {cmsData.description}
        </p>

        {showSettings && (
          <div className="mb-5 space-y-3 border-y border-foreground/10 py-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked
                disabled
                className="mt-1 h-4 w-4 accent-foreground"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {cmsData.necessaryCookiesLabel}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {cmsData.necessaryCookiesDescription}
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                className="mt-1 h-4 w-4 accent-foreground"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {cmsData.analyticsCookiesLabel}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {cmsData.analyticsCookiesDescription}
                </span>
              </span>
            </label>
          </div>
        )}

        <Link
          href={COOKIE_POLICY_LINK}
          className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:text-foreground/70 hover:decoration-foreground/40"
        >
          {cmsData.learnMoreLinkText}
        </Link>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() =>
              showSettings
                ? saveConsent(analyticsEnabled)
                : setShowSettings(true)
            }
            className="h-11 flex-1 rounded-lg border border-foreground/12 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55 transition-colors hover:border-foreground/25 hover:text-foreground"
          >
            {showSettings
              ? cmsData.saveSettingsButtonText
              : cmsData.settingsButtonText}
          </button>
          <button
            onClick={() => saveConsent(true)}
            className="h-11 flex-1 rounded-lg bg-foreground text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-foreground/90"
          >
            {cmsData.acceptButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export { CookieConsent };
