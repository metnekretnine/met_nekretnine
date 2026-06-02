import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { PortableText, SubPageHero } from "@/components";
import { fetchAgencyPageCms } from "@/sanity/queries";
import { getLang, generatePageMetadata } from "@/lib/utils";
import { PageBreadcrumbJsonLd } from "@/analytics";
import { ABOUT_LINK } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const pageCms = await fetchAgencyPageCms(lang);

  return generatePageMetadata({
    metaTitle: pageCms.metaTitle,
    metaDescription: pageCms.metaDescription,
    metaOgImage: pageCms.metaOgImage,
    canonicalPath: ABOUT_LINK,
  });
}

export default async function AboutAgencyPage() {
  const lang = await getLang();
  const pageCms = await fetchAgencyPageCms(lang);

  return (
    <>
      <PageBreadcrumbJsonLd
        lang={lang}
        name={pageCms.heroTitle}
        path={ABOUT_LINK}
      />
      <SubPageHero
        title={pageCms.heroTitle}
        description={pageCms.heroDescriptionText}
        backgroundImage={pageCms.heroBackgroundImage}
        imageAlt={pageCms.heroBackgroundImageAlt}
      />

      <section className="container mx-auto px-global py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-muted-foreground">
            <PortableText value={pageCms.contentSection.content} />
          </div>

          <aside className="grid gap-4">
            <div className="rounded-lg border border-foreground/10 bg-[#f5f7f8] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/45">
                {pageCms.directorSection.label}
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                {pageCms.directorSection.name}
              </h2>
              <Link
                href={pageCms.directorSection.linkedinHref}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em]"
              >
                {pageCms.directorSection.linkedinText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {pageCms.hgkSection.logoUrl && (
              <div className="flex rounded-lg border border-foreground/10 bg-white px-6 py-7 md:justify-center">
                <Link
                  href="https://www.hgk.hr/"
                  target="_blank"
                  rel="noopener"
                  aria-label={pageCms.hgkSection.logoAlt ?? "HGK"}
                >
                  <Image
                    src={pageCms.hgkSection.logoUrl}
                    alt={pageCms.hgkSection.logoAlt ?? ""}
                    width={360}
                    height={240}
                    unoptimized
                    className="h-auto w-full max-w-[118px] opacity-80 transition-opacity hover:opacity-100 md:max-w-[132px]"
                  />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
