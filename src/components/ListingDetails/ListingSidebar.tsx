import React from "react";
import { ListingSpecs } from "./ListingSpecs";
import { ListingDetailsPageCMS, ListingCMS } from "@/sanity/queries";
import { Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import {
  COMPANY_PHONE_HREF,
  COMPANY_WHATSAPP_HREF,
  Language,
} from "@/lib/constants";

interface ListingSidebarProps {
  listing: ListingCMS;
  cmsData: ListingDetailsPageCMS;
  lang: Language["id"];
}

export const ListingSidebar = ({
  listing,
  cmsData,
  lang,
}: ListingSidebarProps) => {
  const phoneHref = listing.agent?.phone
    ? `tel:${listing.agent.phone.replace(/\s/g, "")}`
    : COMPANY_PHONE_HREF;
  const whatsappHref = listing.agent?.phone
    ? `https://wa.me/${listing.agent.phone.replace(/\D/g, "")}`
    : COMPANY_WHATSAPP_HREF;
  const emailHref = listing.agent?.email
    ? `mailto:${listing.agent.email}?subject=${encodeURIComponent(
        `Upit za stan: ${listing.title}`,
      )}`
    : "mailto:info@met.hr";

  return (
    <div className="w-full lg:w-1/3">
      <div className="sticky top-32 space-y-6">
        <div className="bg-foreground rounded-lg p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40 mb-3">
            {cmsData.rentPriceLabel}
          </p>
          <p className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
            {listing.price.toLocaleString("hr-HR")} €
          </p>
        </div>
        <ListingSpecs listing={listing} cmsData={cmsData} lang={lang} />
        <div className="rounded-lg border border-foreground/10 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">
            {cmsData.scheduleViewingTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {cmsData.scheduleViewingText}
          </p>
          <div className="mt-6 grid gap-3">
            <Link
              href={phoneHref}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-foreground px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-foreground/90"
            >
              <Phone className="h-4 w-4" />
              {cmsData.phoneLabel}
            </Link>
            <Link
              href={whatsappHref}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-foreground/10 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-foreground/5"
            >
              <MessageCircle className="h-4 w-4" />
              {cmsData.whatsAppLabel}
            </Link>
            <Link
              href={emailHref}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-foreground/10 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-foreground/5"
            >
              <Mail className="h-4 w-4" />
              {cmsData.emailLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
