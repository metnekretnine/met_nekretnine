import { Metadata } from "next";
import { PortableText, SubPageHero } from "@/components";
import { fetchCookiePolicyPageCms } from "@/sanity/queries";
import { getLang, generatePageMetadata } from "@/lib/utils";
import { PageBreadcrumbJsonLd } from "@/analytics";
import { COOKIE_POLICY_LINK } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const pageCms = await fetchCookiePolicyPageCms(lang);

  return generatePageMetadata({
    metaTitle: pageCms.metaTitle,
    metaDescription: pageCms.metaDescription,
    metaOgImage: pageCms.metaOgImage,
    canonicalPath: COOKIE_POLICY_LINK,
  });
}

export default async function CookiePolicyPage() {
  const lang = await getLang();
  const pageCms = await fetchCookiePolicyPageCms(lang);

  return (
    <>
      <PageBreadcrumbJsonLd
        lang={lang}
        name={pageCms.heroTitle}
        path={COOKIE_POLICY_LINK}
      />
      <SubPageHero
        title={pageCms.heroTitle}
        description={pageCms.heroDescriptionText}
        backgroundImage={pageCms.heroBackgroundImage}
        imageAlt={pageCms.heroBackgroundImageAlt}
      />
      <section className="container mx-auto px-global py-16 md:py-24">
        <div className="prose prose-lg max-w-3xl text-muted-foreground">
          <PortableText value={pageCms.content} />
        </div>
      </section>
    </>
  );
}
