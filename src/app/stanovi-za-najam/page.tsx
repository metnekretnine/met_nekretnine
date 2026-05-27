import { Metadata } from "next";
import ListingsExplorer from "@/components/ListingsExplorer/ListingsExplorer";
import {
  fetchAllDistricts,
  fetchApartmentsRentPageCms,
  fetchListingExplorerSectionCms,
  fetchListings,
} from "@/sanity/queries";
import { LISTINGS_PER_PAGE, RENT_LINK } from "@/lib/constants";
import { getLang, generatePageMetadata } from "@/lib/utils";
import { ListingsItemListJsonLd, PageBreadcrumbJsonLd } from "@/analytics";

interface Props {
  searchParams: Promise<{
    district?: string;
    minPrice?: string;
    maxPrice?: string;
    rooms?: string;
    minArea?: string;
    maxArea?: string;
    petFriendly?: string;
    page?: string;
    sort?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const pageCms = await fetchApartmentsRentPageCms(lang);

  return generatePageMetadata({
    metaTitle: pageCms.metaTitle,
    metaDescription: pageCms.metaDescription,
    metaOgImage: pageCms.metaOgImage,
    canonicalPath: RENT_LINK,
  });
}

export default async function ApartmentsForRentPage({ searchParams }: Props) {
  const lang = await getLang();
  const params = await searchParams;

  const [pageCms, explorerCms, data, districts] = await Promise.all([
    fetchApartmentsRentPageCms(lang),
    fetchListingExplorerSectionCms(lang),
    fetchListings({
      lang,
      district: params.district,
      rooms: params.rooms,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      minArea: params.minArea ? Number(params.minArea) : undefined,
      maxArea: params.maxArea ? Number(params.maxArea) : undefined,
      petFriendly: params.petFriendly === "true",
      page: params.page ? Number(params.page) : 1,
      limit: LISTINGS_PER_PAGE,
      sort: params.sort,
    }),
    fetchAllDistricts(),
  ]);

  return (
    <div className="pt-28 md:pt-36">
      <PageBreadcrumbJsonLd
        lang={lang}
        name={pageCms.introSection.title}
        path={RENT_LINK}
      />
      <ListingsItemListJsonLd listings={data.listings} />
      <section className="container mx-auto px-global pb-2 md:pb-4">
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
          {pageCms.introSection.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {pageCms.introSection.intro}
        </p>
      </section>

      <section className="container mx-auto px-global">
        <ListingsExplorer
          initialListings={data.listings}
          totalResults={data.total}
          allCounties={districts}
          cmsData={explorerCms}
          lang={lang}
        />
      </section>
    </div>
  );
}
