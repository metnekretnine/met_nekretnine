"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { COOKIE_CONSENT_NAME } from "@/lib/constants";

const hasAnalyticsConsent = () => {
  const consent = Cookies.get(COOKIE_CONSENT_NAME);

  if (consent === "true") {
    return true;
  }

  if (!consent || consent === "false") {
    return false;
  }

  try {
    const parsed = JSON.parse(consent) as { analytics?: boolean };
    return parsed.analytics === true;
  } catch {
    return false;
  }
};

export const useCookieConsent = () => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const updateConsent = () => {
      setHasConsent(hasAnalyticsConsent());
    };

    updateConsent();
    window.addEventListener("cookie-consent-updated", updateConsent);

    return () => {
      window.removeEventListener("cookie-consent-updated", updateConsent);
    };
  }, []);

  return hasConsent;
};
