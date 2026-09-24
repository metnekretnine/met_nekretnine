import { Metadata } from "next";
import { PortableText, SubPageHero } from "@/components";
// Server-only (Sanity write token), so it stays out of the client-imported barrel.
import { PriceList } from "@/components/PriceList/PriceList";
import { fetchTermsPageCms } from "@/sanity/queries";
import { getLang, generatePageMetadata } from "@/lib/utils";
import { PageBreadcrumbJsonLd } from "@/analytics";
import { TERMS_LINK } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const pageCms = await fetchTermsPageCms(lang);

  return generatePageMetadata({
    metaTitle: pageCms.metaTitle,
    metaDescription: pageCms.metaDescription,
    metaOgImage: pageCms.metaOgImage,
    canonicalPath: TERMS_LINK,
  });
}

interface TermsPageProps {
  searchParams: Promise<{ admin?: string }>;
}

export default async function TermsPage({ searchParams }: TermsPageProps) {
  // Temporary: the new price list is shown only with ?admin=true until approved.
  const isAdminPreview = (await searchParams).admin === "true";
  const lang = await getLang();
  const pageCms = await fetchTermsPageCms(lang, isAdminPreview);

  return (
    <>
      <PageBreadcrumbJsonLd
        lang={lang}
        name={pageCms.heroTitle}
        path={TERMS_LINK}
      />
      <SubPageHero
        title={pageCms.heroTitle}
        description={pageCms.heroDescriptionText}
        backgroundImage={pageCms.heroBackgroundImage}
        imageAlt={pageCms.heroBackgroundImageAlt}
      />
      <section className="container mx-auto px-global py-16 md:py-24">
        <div className="prose prose-lg max-w-3xl text-muted-foreground">
          <PortableText
            value={pageCms.content}
            priceList={isAdminPreview ? <PriceList /> : undefined}
          />
        </div>
      </section>
    </>
  );
}
