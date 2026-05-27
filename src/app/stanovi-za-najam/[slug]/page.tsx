import { Metadata } from "next";
import {
  fetchListingBySlug,
  fetchListingDetailsPageCms,
  fetchStaticAllListingSlugs,
} from "@/sanity/queries";
import { getLang, generatePageMetadata } from "@/lib/utils";
import { ListingSidebar, ListingContent } from "@/components/ListingDetails";
import { DEFAULT_LANGUAGE, HOME_LINK, LISTING_LINK } from "@/lib/constants";
import { BreadcrumbJsonLd, ListingJsonLd } from "@/analytics";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await fetchStaticAllListingSlugs(DEFAULT_LANGUAGE);
  return slugs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLang();
  const listing = await fetchListingBySlug(lang, slug);

  if (!listing) return {};

  return generatePageMetadata({
    metaTitle: listing.title,
    metaDescription: listing.shortDescription,
    metaOgImage: listing.images[0],
    canonicalPath: `${LISTING_LINK}/${listing.slug}`,
  });
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getLang();

  const [listing, listingDetailsCms] = await Promise.all([
    fetchListingBySlug(lang, slug),
    fetchListingDetailsPageCms(lang),
  ]);
  const statusLabel =
    listing.status === "reserved"
      ? listingDetailsCms.reservedLabel
      : listing.status === "rented"
        ? listingDetailsCms.rentedLabel
        : null;

  return (
    <div>
      <ListingJsonLd listing={listing} lang={lang} />
      <BreadcrumbJsonLd
        items={[
          { name: lang === "en" ? "Home" : "Naslovnica", item: HOME_LINK },
          {
            name: lang === "en" ? "Apartments for rent" : "Stanovi za najam",
            item: LISTING_LINK,
          },
          { name: listing.title, item: `${LISTING_LINK}/${listing.slug}` },
        ]}
      />
      <section className="container mx-auto px-global pb-10 pt-28 md:pt-36">
        <p className="text-primary font-semibold uppercase tracking-[0.24em] text-xs mb-6">
          {listing.district}
        </p>
        <h1 className="text-4xl md:text-7xl font-semibold tracking-tight leading-none mb-6">
          {listing.title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          {listing.shortDescription}
        </p>
      </section>

      <section className="pb-4 md:pb-12 container mx-auto px-global">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <ListingContent
            listing={listing}
            cmsData={listingDetailsCms}
            statusLabel={statusLabel}
          />
          <ListingSidebar
            listing={listing}
            cmsData={listingDetailsCms}
            lang={lang}
          />
        </div>
      </section>
    </div>
  );
}
