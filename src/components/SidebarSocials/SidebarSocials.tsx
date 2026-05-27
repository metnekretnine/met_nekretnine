"use client";

import React from "react";
import { Phone, Mail, Facebook, Instagram } from "lucide-react";
import { useScrollDetection } from "@/hooks";
import { SidebarSocialsCMS } from "@/sanity/queries/sidebarSocials";

interface SidebarSocialsProps {
  cmsData: SidebarSocialsCMS;
}

export const SidebarSocials = ({ cmsData }: SidebarSocialsProps) => {
  const isScrolled = useScrollDetection();

  const socials = [
    {
      icon: <Phone className="size-4.5 md:size-5" />,
      href: `tel:${cmsData.phone}`,
      label: "Phone",
      color: "hover:bg-brand-primary",
    },
    {
      icon: <Mail className="size-4.5 md:size-5" />,
      href: `mailto:${cmsData.email}`,
      label: "Email",
      color: "hover:bg-brand-primary",
    },
    {
      icon: <Facebook className="size-4.5 md:size-5" />,
      href: cmsData.facebook,
      label: "Facebook",
      color: "hover:bg-[#1877F2]",
    },
    {
      icon: <Instagram className="size-4.5 md:size-5" />,
      href: cmsData.instagram,
      label: "Instagram",
      color: "hover:bg-[#E4405F]",
    },
  ];

  if (!isScrolled) return null;

  return (
    <div className="fixed right-0 top-[70%] md:top-1/2 -translate-y-1/2 z-50 flex flex-col border-l border-y border-white/20 rounded-l-sm overflow-hidden animate-in fade-in slide-in-from-right-5 duration-500">
      {socials.map((social, index) => (
        <a
          key={index}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            bg-brand-primary text-white p-2.5 md:p-3 transition-all duration-300 
            flex items-center justify-center
            hover:pl-5 hover:brightness-110
          `}
          aria-label={social.label}
        >
          {social.icon}
        </a>
      ))}
    </div>
  );
};
