"use client";

import Script from "next/script";
import React from "react";
import { useCookieConsent } from "@/hooks";

const MicrosoftClarityAnalytics = () => {
  const hasConsent = useCookieConsent();

  if (!hasConsent || !process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_ID) {
    return null;
  }

  return (
    <Script id="microsoft-clarity-analytics" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_MICROSOFT_CLARITY_ID}");
      `}
    </Script>
  );
};

export { MicrosoftClarityAnalytics };
