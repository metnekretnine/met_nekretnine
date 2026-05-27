"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import React from "react";

const EXCLUDED_PATHS = ["/admin/"];

interface HubSpotChatbotProps {
  isEnabled: boolean;
}

const HubSpotChatbot: React.FC<HubSpotChatbotProps> = ({ isEnabled }) => {
  const pathname = usePathname();
  const hubspotChatbotId = process.env.NEXT_PUBLIC_HUBSPOT_CHATBOT_ID;

  if (
    EXCLUDED_PATHS.some((path) => pathname.includes(path)) ||
    !isEnabled ||
    !hubspotChatbotId
  ) {
    return null;
  }

  return (
    <Script
      id="hs-script-loader"
      strategy="afterInteractive"
      src={`//js.hs-scripts.com/${hubspotChatbotId}.js`}
    />
  );
};

export { HubSpotChatbot };
