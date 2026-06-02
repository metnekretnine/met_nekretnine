"use client";

import * as React from "react";
import Link from "next/link";
import { Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { LogoCompany } from "../Icons/LogoCompany";
import { FooterSectionCMS } from "@/sanity/queries";
import { usePathname } from "next/navigation";

const EXCLUDED_PATHS = ["/admin"];

interface Props {
  cmsData: FooterSectionCMS;
}

export const Footer: React.FC<Props> = ({ cmsData }) => {
  const pathname = usePathname();
  const socialIcons: { [key: string]: React.ReactNode } = {
    LinkedIn: <Linkedin className="h-4 w-4" />,
    Instagram: <Instagram className="h-4 w-4" />,
  };

  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return null;
  }

  const phoneHref = `tel:${cmsData.phone.replace(/\s/g, "")}`;

  return (
    <footer className="w-full bg-[#222222] text-background">
      <div className="container mx-auto px-6 py-14 md:py-18 2xl:max-w-[1400px]">
        <div className="flex flex-col justify-between gap-12 lg:flex-row">
          <div className="max-w-md">
            <Link className="flex items-center" href="/">
              <LogoCompany
                width={106}
                height={40}
                primaryColor="currentColor"
                className="text-background"
              />
            </Link>
            <p className="mt-6 text-sm font-semibold leading-relaxed text-background/85">
              {cmsData.specialtyText}
            </p>
            <p className="mt-4 text-sm text-background/70 leading-relaxed">
              {cmsData.tagline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-background/70">
              {cmsData.licenseText}
            </p>
            <div className="mt-5 grid gap-2">
              <Link
                href={`mailto:${cmsData.email}`}
                className="inline-flex items-center gap-3 text-sm text-background/75 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4" />
                {cmsData.email}
              </Link>
              <Link
                href={phoneHref}
                className="inline-flex items-center gap-3 text-sm text-background/75 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4" />
                {cmsData.phone}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={cmsData.linkedin.href}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label={cmsData.linkedin.ariaLabel}
                target="_blank"
                rel="noopener"
              >
                {socialIcons.LinkedIn}
              </Link>
              <Link
                href={cmsData.instagram.href}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label={cmsData.instagram.ariaLabel}
                target="_blank"
                rel="noreferrer"
              >
                {socialIcons.Instagram}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            {cmsData.sections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="text-sm text-background/60 transition-colors hover:text-white"
                        href={link.href}
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} {cmsData.companyName}.{" "}
            {cmsData.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};
