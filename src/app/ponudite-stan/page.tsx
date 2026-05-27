import { Metadata } from "next";
import { PageBreadcrumbJsonLd } from "@/analytics";
import { SubmitApartmentForm, SubPageHero } from "@/components";
import { SUBMIT_APARTMENT_LINK } from "@/lib/constants";
import { generatePageMetadata, getLang } from "@/lib/utils";
import { fetchSubmitApartmentPageCms } from "@/sanity/queries";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const pageCms = await fetchSubmitApartmentPageCms(lang);

  return generatePageMetadata({
    metaTitle: pageCms.metaTitle,
    metaDescription: pageCms.metaDescription,
    metaOgImage: pageCms.metaOgImage,
    canonicalPath: SUBMIT_APARTMENT_LINK,
  });
}

export default async function SubmitApartmentPage() {
  const lang = await getLang();
  const pageCms = await fetchSubmitApartmentPageCms(lang);

  return (
    <>
      <PageBreadcrumbJsonLd
        lang={lang}
        name={pageCms.heroTitle}
        path={SUBMIT_APARTMENT_LINK}
      />
      <SubPageHero
        title={pageCms.heroTitle}
        description={pageCms.heroDescriptionText}
        backgroundImage={pageCms.heroBackgroundImage}
        imageAlt={pageCms.heroBackgroundImageAlt}
      />

      <section className="container mx-auto px-global py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <SubmitApartmentForm cmsData={pageCms.formSection} />
        </div>
      </section>
    </>
  );
}
