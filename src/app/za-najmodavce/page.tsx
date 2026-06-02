import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Metadata } from "next";
import { FaqSection, PortableText, SubPageHero } from "@/components";
import { fetchLandlordsPageCms } from "@/sanity/queries";
import { getLang, generatePageMetadata } from "@/lib/utils";
import { PageBreadcrumbJsonLd } from "@/analytics";
import { LANDLORD_LINK } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const pageCms = await fetchLandlordsPageCms(lang);

  return generatePageMetadata({
    metaTitle: pageCms.metaTitle,
    metaDescription: pageCms.metaDescription,
    metaOgImage: pageCms.metaOgImage,
    canonicalPath: LANDLORD_LINK,
  });
}

export default async function LandlordsPage() {
  const lang = await getLang();
  const pageCms = await fetchLandlordsPageCms(lang);

  return (
    <>
      <PageBreadcrumbJsonLd
        lang={lang}
        name={pageCms.heroTitle}
        path={LANDLORD_LINK}
      />
      <SubPageHero
        title={pageCms.heroTitle}
        description={pageCms.heroDescriptionText}
        backgroundImage={pageCms.heroBackgroundImage}
        imageAlt={pageCms.heroBackgroundImageAlt}
      />

      <section className="container mx-auto px-global py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              {pageCms.introSection.title}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {pageCms.introSection.text}
            </p>
            <div className="mt-8 rounded-lg border border-[#b9c7d1] bg-[#eef3f6] p-6">
              <h3 className="text-xl font-semibold tracking-tight">
                {pageCms.whyMetBox.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {pageCms.whyMetBox.items.map((item) => (
                  <li key={item.text} className="flex gap-3 text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pageCms.processSection.items.map((item) => (
              <div
                key={item.text}
                className="rounded-lg border border-foreground/10 bg-white p-5 text-base font-medium"
              >
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5f7f8] py-10 md:py-14">
        <div className="container mx-auto px-global">
          <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-muted-foreground">
            <PortableText value={pageCms.modelSection.channelsContent} />
          </div>

          <h2 className="mt-10 text-3xl font-semibold tracking-tight md:mt-12 md:text-5xl">
            {pageCms.modelSection.title}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {pageCms.modelSection.items.map((model) => (
              <div
                key={model.title}
                className="rounded-lg border border-foreground/10 bg-white p-6"
              >
                <h3 className="text-xl font-semibold tracking-tight">
                  {model.title}
                </h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {model.text}
                </p>
              </div>
            ))}
          </div>

          <Link
            href={pageCms.modelSection.ctaHref}
            className="mt-10 inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-foreground px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white"
          >
            {pageCms.modelSection.ctaText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {pageCms.faqSection && (
        <FaqSection data={pageCms.faqSection} className="py-16 md:py-24" />
      )}
    </>
  );
}
