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

      {pageCms.contentSection.introContent &&
        pageCms.contentSection.introContent.length > 0 && (
          <section className="container mx-auto px-global py-10 md:py-14">
            <div className="max-w-4xl">
              <div className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
                <PortableText value={pageCms.contentSection.introContent} />
              </div>
            </div>
          </section>
        )}

      {pageCms.contentSection.agencyMainContent &&
        pageCms.contentSection.agencyMainContent.length > 0 && (
          <section className="bg-[#eef3f6] py-10 md:py-14">
            <div className="container mx-auto px-global">
              <div className="max-w-4xl text-foreground">
                <PortableText
                  value={pageCms.contentSection.agencyMainContent}
                  textSize="text-lg md:text-xl"
                />
              </div>
            </div>
          </section>
        )}

      {pageCms.hgkSection.logoUrl && pageCms.hgkSection.text && (
        <section className="bg-white py-8 md:py-10">
          <div className="container mx-auto px-global">
            <div className="flex max-w-4xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="w-[78%] max-w-xl text-lg font-medium leading-relaxed text-foreground sm:w-auto md:text-xl">
                  {pageCms.hgkSection.text}
                </p>
              </div>
              <Link
                href="https://www.hgk.hr/"
                target="_blank"
                rel="noopener"
                aria-label={pageCms.hgkSection.logoAlt ?? "HGK"}
                className="inline-flex w-fit shrink-0 transition-opacity hover:opacity-80"
              >
                <Image
                  src={pageCms.hgkSection.logoUrl}
                  alt={pageCms.hgkSection.logoAlt ?? ""}
                  width={360}
                  height={240}
                  unoptimized
                  className="h-auto w-[96px] md:w-[112px]"
                />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#f5f7f8] py-12 md:py-14">
        <div className="container mx-auto grid gap-6 px-global lg:grid-cols-[0.9fr_1.1fr]">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {pageCms.biographySection.title}
          </h2>
          <div>
            <h3 className="text-3xl font-semibold tracking-tight">
              {pageCms.biographySection.name}
            </h3>
            <div className="mt-5 space-y-3 text-lg leading-relaxed text-muted-foreground">
              {pageCms.biographySection.education && (
                <p>{pageCms.biographySection.education}</p>
              )}
              {pageCms.biographySection.credential && (
                <p>{pageCms.biographySection.credential}</p>
              )}
            </div>
            <div className="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              <PortableText value={pageCms.contentSection.content} />
            </div>
          </div>
        </div>
      </section>

      {pageCms.ctaSection.title &&
        pageCms.ctaSection.text &&
        pageCms.ctaSection.href && (
          <section className="bg-[#dfe7ee] py-12 text-foreground md:py-14">
            <div className="container mx-auto flex flex-col items-start justify-between gap-6 px-global md:flex-row md:items-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                {pageCms.ctaSection.title}
              </h2>
              <Link
                href={pageCms.ctaSection.href}
                className="inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-foreground px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-foreground/90"
              >
                {pageCms.ctaSection.text}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}
    </>
  );
}
