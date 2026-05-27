import { ListingCMS } from "@/sanity/queries/listings";
import { ListingExplorerSectionCMS } from "@/sanity/queries/listingExplorerSection";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import {
  Search,
  Ruler,
  MapPin,
  BedDouble,
  ArrowRight,
} from "lucide-react";
import { Language, LISTING_LINK } from "@/lib/constants";
import { formatListingAvailability } from "@/lib/listingFieldFormatters";

interface ListingGridProps {
  listings: ListingCMS[];
  cmsData: ListingExplorerSectionCMS;
  lang: Language["id"];
}

export default function ListingGrid({
  listings,
  cmsData,
  lang,
}: ListingGridProps) {
  const roomLabels: Record<string, string> = {
    studio_apartment: cmsData.studioApartmentLabel,
    one_room: cmsData.oneRoomLabel,
    two_rooms: cmsData.twoRoomsLabel,
    three_rooms: cmsData.threeRoomsLabel,
    four_rooms: cmsData.fourRoomsLabel,
    five_rooms: cmsData.fiveRoomsLabel,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {listings.length > 0 ? (
        listings.map((item) => {
          const availabilityLabel = formatListingAvailability(
            item.availableFromDate,
            lang,
          );

          return (
            <Link
              key={item._id}
              href={`${LISTING_LINK}/${item.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-foreground/10 bg-white transition-colors hover:border-foreground/25"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
                <Image
                  src={urlFor(item.images[0]).url()}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                {availabilityLabel && (
                  <span className="absolute bottom-4 right-4 rounded bg-black/35 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-white/85 backdrop-blur-sm">
                    {availabilityLabel}
                  </span>
                )}

                {item.status !== "active" && (
                  <div className="absolute inset-0 z-10 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-white px-5 py-2 text-sm font-semibold text-foreground uppercase tracking-[0.14em]">
                      {item.status === "rented"
                        ? cmsData.rentedLabel
                        : cmsData.reservedLabel}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-foreground/55">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                      {item.district}
                    </span>
                  </div>
                </div>

                <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-foreground">
                  {item.title}
                </h3>

                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap items-center gap-5 text-foreground/65">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {item.livingArea} m²
                      </span>
                    </div>
                    {item.numberOfRooms && (
                      <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {roomLabels[item.numberOfRooms] ||
                            item.numberOfRooms}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-foreground/10 pt-6">
                    <p className="text-2xl font-semibold tracking-tight">
                      {item.price.toLocaleString("hr-HR")} €
                      <span className="ml-1 text-sm font-medium text-foreground/45">
                        {cmsData.monthlyRentSuffix}
                      </span>
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      {cmsData.detailsCtaText}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })
      ) : (
        <div className="col-span-full py-24 text-center space-y-6 rounded-lg border border-dashed border-foreground/10">
          <div className="w-16 h-16 mx-auto bg-foreground/5 rounded-full flex items-center justify-center">
            <Search className="w-6 h-6 text-foreground/20" />
          </div>
          <div className="space-y-2 px-6">
            <p className="text-3xl font-semibold text-foreground tracking-tight">
              {cmsData.noResultsTitle}
            </p>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {cmsData.noResultsDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
