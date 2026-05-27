"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { IconWhatsApp } from "../Icons/IconWhatsApp/IconWhatsApp";
import { WhatsAppButtonSectionCMS } from "@/sanity/queries";

const EXCLUDED_PATHS = ["/admin/"];

interface WhatsAppButtonProps {
  cmsData: WhatsAppButtonSectionCMS;
  isEnabled: boolean;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  cmsData,
  isEnabled,
}) => {
  const pathname = usePathname();

  if (EXCLUDED_PATHS.some((path) => pathname.includes(path)) || !isEnabled) {
    return null;
  }

  const whatsappLink = `https://wa.me/${
    cmsData.whatsappNumber
  }?text=${encodeURIComponent(cmsData.whatsappMessage)}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-2 md:bottom-3 left-4 z-40 bg-green-500 text-white p-2.5 rounded-full  hover:bg-green-600 transition-colors duration-300"
      aria-label="Chat on WhatsApp"
    >
      <IconWhatsApp width={40} height={40} />
    </a>
  );
};

export { WhatsAppButton };
