"use client";

import { Analytics } from "@vercel/analytics/next";
import React from "react";
import { useCookieConsent } from "@/hooks";

const VercelAnalytics = () => {
  const hasConsent = useCookieConsent();

  if (!hasConsent) {
    return null;
  }

  return <Analytics />;
};

export { VercelAnalytics };
