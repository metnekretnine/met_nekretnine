import React from "react";
import { PortableText } from "@/components";
import { Gallery } from "@/components/Gallery/Gallery";
import { GoogleMapComponent } from "@/components/GoogleMap/GoogleMap";
import { ListingDetailsPageCMS, ListingCMS } from "@/sanity/queries";

interface ListingContentProps {
  listing: ListingCMS;
  cmsData: ListingDetailsPageCMS;
  statusLabel?: string | null;
}

export const ListingContent = ({
  listing,
  cmsData,
  statusLabel,
}: ListingContentProps) => {
  return (
    <div className="w-full lg:w-2/3 space-y-8 md:space-y-16">
      <Gallery
        images={listing.images}
        title={listing.title}
        video={listing.video}
        watermarkEnabled={false}
        statusOverlayText={statusLabel || undefined}
      />

      <div>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
          {cmsData.descriptionTitle}
        </h2>
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <PortableText value={listing.description} />
        </div>
      </div>

      {(listing.locationDescription || listing.location) && (
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
            {cmsData.locationTitle}
          </h2>
          {listing.locationDescription && (
            <p className="mb-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {listing.locationDescription}
            </p>
          )}
          {listing.location && (
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <GoogleMapComponent
                lat={listing.location.lat}
                lng={listing.location.lng}
              />
            </div>
          )}
        </div>
      )}

      {listing.rentalTerms && listing.rentalTerms.length > 0 && (
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
            {cmsData.rentalTermsTitle}
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <PortableText value={listing.rentalTerms} />
          </div>
        </div>
      )}

      <div className="rounded-lg border border-[#b9c7d1] bg-[#eef3f6] p-6 text-lg font-semibold leading-relaxed text-foreground shadow-sm md:p-7">
        {cmsData.noCommissionNote}
      </div>
    </div>
  );
};
