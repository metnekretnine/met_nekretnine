import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Ruler } from "lucide-react";
import { Metadata } from "next";
import {
  fetchCtaSectionCms,
  fetchListingExplorerSectionCms,
  fetchListings,
  fetchMetHomePageCms,
  ListingCMS,
  ListingExplorerSectionCMS,
  MetHomePageCMS,
} from "@/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import { CTASection, PortableText } from "@/components";
import { getLang, generatePageMetadata } from "@/lib/utils";
import { HOME_LINK, Language, RENT_LINK } from "@/lib/constants";
import { formatListingAvailability } from "@/lib/listingFieldFormatters";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const pageCms = await fetchMetHomePageCms(lang);

  return generatePageMetadata({
    metaTitle: pageCms.metaTitle,
    metaDescription: pageCms.metaDescription,
    metaOgImage: pageCms.metaOgImage,
    canonicalPath: HOME_LINK,
  });
}

export default async function HomePage() {
  const lang = await getLang();
  const [pageCms, listingExplorerCms, listingData, ctaSectionCms] =
    await Promise.all([
      fetchMetHomePageCms(lang),
      fetchListingExplorerSectionCms(lang),
      fetchListings({
        lang,
        limit: 4,
        isFeatured: true,
      }),
      fetchCtaSectionCms(lang),
    ]);

  return (
    <>
      <section className="relative flex min-h-[100svh] sm:min-h-svh items-end overflow-hidden bg-[#101114]">
        {pageCms.heroSection.backgroundImages.map((backgroundImage, index) => (
          <Image
            key={backgroundImage._key}
            src={urlFor(backgroundImage.image).url()}
            alt={backgroundImage.imageAlt}
            fill
            priority
            className={getHeroBackgroundImageClass(
              index,
              pageCms.heroSection.backgroundImages.length,
            )}
            sizes="100vw"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/15" />
        <div className="container relative z-10 mx-auto px-global pb-16 md:pb-24">
          <h1 className="max-w-5xl text-5xl font-semibold leading-none tracking-tight text-white md:text-7xl lg:text-8xl">
            {pageCms.heroSection.title}
          </h1>
          <p className="mt-6 text-2xl font-medium text-white/86 md:text-3xl">
            {pageCms.heroSection.subtitle}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-global py-20 md:py-28">
        <div className="max-w-4xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-foreground/45">
            {pageCms.positioningSection.title}
          </p>
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            {pageCms.positioningSection.subtitle}
          </h2>
          <div className="mt-10 max-w-3xl space-y-5 text-lg leading-relaxed text-muted-foreground">
            <PortableText value={pageCms.positioningSection.content} />
          </div>
        </div>
      </section>

      <section className="bg-[#f5f7f8] py-20 md:py-28">
        <div className="container mx-auto px-global">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
              {pageCms.featuredSection.title}
            </h2>
            <Link
              href={RENT_LINK}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-foreground"
            >
              {pageCms.featuredSection.ctaText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {listingData.listings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {listingData.listings.map((listing) => (
                <FeaturedApartmentCard
                  key={listing._id}
                  listing={listing}
                  listingCards={pageCms.listingCards}
                  listingExplorerCms={listingExplorerCms}
                  lang={lang}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-foreground/10 bg-white p-8 text-muted-foreground">
              {pageCms.listingCards.emptyFeaturedText}
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-global py-20 md:py-28">
        <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          {pageCms.whySection.title}
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pageCms.whySection.items.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-foreground/10 bg-white p-6"
            >
              <h3 className="text-xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SplitSection
        section={pageCms.landlordSection}
      />

      <SplitSection section={pageCms.tenantSection} muted />

      <section className="container mx-auto px-global py-20 md:py-28">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            {pageCms.internationalSection.title}
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
            <PortableText value={pageCms.internationalSection.content} />
          </div>
        </div>
      </section>

      <section className="bg-[#101114] py-20 text-white md:py-28">
        <div className="container mx-auto px-global">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
              {pageCms.trustSection.title}
            </h2>
            <div className="mt-8 space-y-5 text-[1.3125rem] leading-relaxed text-white [&_li]:text-white [&_p]:text-white">
              <PortableText value={pageCms.trustSection.content} isBackgroundDark />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-global py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_280px] md:items-end">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
              {pageCms.aboutSection.title}
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {pageCms.aboutSection.content}
            </p>
            <p className="mt-6 text-lg font-medium">
              {pageCms.aboutSection.directorText}
            </p>
            <Link
              href={pageCms.aboutSection.linkedinHref}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em]"
            >
              {pageCms.aboutSection.linkedinText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex min-h-[146px] items-center justify-center p-6">
            {pageCms.aboutSection.hgkLogoUrl && (
              <Link
                href="https://www.hgk.hr/"
                target="_blank"
                rel="noopener"
                aria-label={pageCms.aboutSection.hgkLogoAlt ?? "HGK"}
              >
                <Image
                  src={pageCms.aboutSection.hgkLogoUrl}
                  alt={pageCms.aboutSection.hgkLogoAlt ?? ""}
                  width={360}
                  height={240}
                  unoptimized
                  className="h-auto w-full max-w-[108px] opacity-80 transition-opacity hover:opacity-100 md:max-w-[132px]"
                />
              </Link>
            )}
          </div>
        </div>
      </section>

      <CTASection cmsData={ctaSectionCms} />
    </>
  );
}

function getHeroBackgroundImageClass(index: number, imageCount: number) {
  if (imageCount === 1) {
    return "object-cover";
  }

  if (imageCount === 2) {
    return index === 0
      ? "hidden object-cover md:block"
      : "block object-cover md:hidden";
  }

  if (index === 0) {
    return "hidden object-cover lg:block";
  }

  if (index === 1) {
    return "hidden object-cover md:block lg:hidden";
  }

  if (index === 2) {
    return "block object-cover md:hidden";
  }

  return "hidden object-cover";
}

function FeaturedApartmentCard({
  listing,
  listingCards,
  listingExplorerCms,
  lang,
}: {
  listing: ListingCMS;
  listingCards: MetHomePageCMS["listingCards"];
  listingExplorerCms: ListingExplorerSectionCMS;
  lang: Language["id"];
}) {
  const roomLabels: Record<string, string> = {
    studio_apartment: listingExplorerCms.studioApartmentLabel,
    one_room: listingExplorerCms.oneRoomLabel,
    two_rooms: listingExplorerCms.twoRoomsLabel,
    three_rooms: listingExplorerCms.threeRoomsLabel,
    four_rooms: listingExplorerCms.fourRoomsLabel,
    five_rooms: listingExplorerCms.fiveRoomsLabel,
  };

  const availabilityLabel = formatListingAvailability(
    listing.availableFromDate,
    lang,
  );

  return (
    <Link
      href={`${RENT_LINK}/${listing.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-foreground/10 bg-white"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
        <Image
          src={urlFor(listing.images[0]).url()}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        {availabilityLabel && (
          <span className="absolute bottom-4 right-4 rounded bg-black/35 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-white/85 backdrop-blur-sm">
            {availabilityLabel}
          </span>
        )}
        {listing.status !== "active" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
            <span className="bg-white px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
              {listing.status === "rented"
                ? listingExplorerCms.rentedLabel
                : listingExplorerCms.reservedLabel}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/45">
          <span>{listing.district}</span>
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-tight">
          {listing.title}
        </h3>
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap gap-4 text-sm text-foreground/65">
            <span className="inline-flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              {listing.livingArea} m²
            </span>
            {listing.numberOfRooms && (
              <span className="inline-flex items-center gap-2">
                <BedDouble className="h-4 w-4" />
                {roomLabels[listing.numberOfRooms] || listing.numberOfRooms}
              </span>
            )}
          </div>
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-foreground/10 pt-5">
            <p className="text-xl font-semibold">
              {listing.price.toLocaleString("hr-HR")} €
              <span className="ml-1 text-sm font-medium text-foreground/45">
                {listingCards.monthlyRentSuffix}
              </span>
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              {listingCards.apartmentCardCtaText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SplitSection({
  section,
  muted = false,
}: {
  section: MetHomePageCMS["landlordSection"] | MetHomePageCMS["tenantSection"];
  muted?: boolean;
}) {
  return (
    <section className={muted ? "bg-[#f5f7f8]" : "bg-white"}>
      <div className="container mx-auto grid gap-10 px-global py-20 md:grid-cols-[0.8fr_1.2fr] md:py-28">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            {section.title}
          </h2>
          <Link
            href={section.ctaHref}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em]"
          >
            {section.ctaText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-muted-foreground">
          <PortableText value={section.content} />
        </div>
      </div>
    </section>
  );
}
