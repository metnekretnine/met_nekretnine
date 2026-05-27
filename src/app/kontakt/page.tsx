import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Hash,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Metadata } from "next";
import type { ReactNode } from "react";
import { ContactForm, SubPageHero } from "@/components";
import {
  fetchContactFormSectionCms,
  fetchContactPageCms,
} from "@/sanity/queries";
import { getLang, generatePageMetadata } from "@/lib/utils";
import { PageBreadcrumbJsonLd } from "@/analytics";
import { CONTACT_LINK } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const contactCms = await fetchContactPageCms(lang);

  return generatePageMetadata({
    metaTitle: contactCms.metaTitle,
    metaDescription: contactCms.metaDescription,
    metaOgImage: contactCms.metaOgImage,
    canonicalPath: CONTACT_LINK,
  });
}

export default async function ContactPage() {
  const lang = await getLang();
  const [contactCms, contactFormCms] = await Promise.all([
    fetchContactPageCms(lang),
    fetchContactFormSectionCms(lang),
  ]);

  return (
    <>
      <PageBreadcrumbJsonLd
        lang={lang}
        name={contactCms.heroTitle}
        path={CONTACT_LINK}
      />
      <SubPageHero
        title={contactCms.heroTitle}
        description={contactCms.heroDescriptionText}
        backgroundImage={contactCms.heroBackgroundImage}
        imageAlt={contactCms.heroBackgroundImageAlt}
      />

      <section className="container mx-auto px-global py-16 md:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              {contactCms.findUsTitle}
            </h2>
            <div className="flex gap-3">
              <SocialIconLink
                href={contactCms.instagramHref}
                label={contactCms.instagramLabel}
                icon={<Instagram className="h-5 w-5" />}
              />
              <SocialIconLink
                href={contactCms.linkedinHref}
                label={contactCms.linkedinLabel}
                icon={<Linkedin className="h-5 w-5" />}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <ContactCard
                icon={<Phone className="h-5 w-5" />}
                label={contactCms.companyPhoneLabel}
                value={contactCms.companyPhoneValue}
                href={`tel:${contactCms.companyPhoneValue.replace(/\s/g, "")}`}
              />
              <ContactCard
                icon={<Mail className="h-5 w-5" />}
                label={contactCms.companyEmailLabel}
                value={contactCms.companyEmailValue}
                href={`mailto:${contactCms.companyEmailValue}`}
              />
              <ContactCard
                icon={<MapPin className="h-5 w-5" />}
                label={contactCms.companyAddressLabel}
                value={contactCms.companyAddressValue}
                subValue={contactCms.companyAddressSubValue}
              />
              <ContactCard
                icon={<Building2 className="h-5 w-5" />}
                label={contactCms.companyNameLabel}
                value={contactCms.companyNameValue}
                subValue={contactCms.companyNameSubValue}
              />
              <ContactCard
                icon={<Hash className="h-5 w-5" />}
                label={contactCms.infoLabel}
                value={contactCms.infoValue}
                subValue={contactCms.infoSubValue}
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#dedede] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-3xl font-semibold tracking-tight">
              {contactCms.sendInquiryTitle}
            </h2>
            <div className="mt-8">
              <ContactForm cmsData={contactFormCms} />
            </div>
            <Link
              href={contactCms.meetingButtonLink}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:text-foreground"
            >
              {contactCms.meetingButtonText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SocialIconLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dedede] bg-white text-foreground/55 transition-colors hover:border-foreground/20 hover:bg-foreground hover:text-white"
    >
      {icon}
    </Link>
  );
}

function ContactCard({
  icon,
  label,
  value,
  subValue,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  subValue?: string;
  href?: string;
}) {
  const content = (
    <div className="group flex h-full gap-4 rounded-lg border border-[#dedede] bg-white p-5 transition-colors hover:border-foreground/20">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground/[0.04] text-foreground/55 transition-colors group-hover:bg-foreground group-hover:text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
          {label}
        </p>
        <p className="mt-2 break-words text-xl font-semibold leading-tight tracking-tight">
          {value}
        </p>
        {subValue && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
    >
      {content}
    </Link>
  );
}
