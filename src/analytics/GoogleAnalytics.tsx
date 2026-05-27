"use client";

import Script from "next/script";
import React from "react";
import { useCookieConsent } from "@/hooks";

const GoogleAnalytics = () => {
  const hasConsent = useCookieConsent();

  if (!hasConsent || !process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
        `}
      </Script>
    </>
  );
};

export { GoogleAnalytics };
