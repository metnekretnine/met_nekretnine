import React from "react";
import { BedDouble, Home, MapPin, Maximize, PawPrint } from "lucide-react";
import { ListingDetailsPageCMS, ListingCMS } from "@/sanity/queries";
import { Language } from "@/lib/constants";
import { formatListingAvailability } from "@/lib/listingFieldFormatters";

interface ListingSpecsProps {
  listing: ListingCMS;
  cmsData: ListingDetailsPageCMS;
  lang: Language["id"];
}

export const ListingSpecs = ({ listing, cmsData, lang }: ListingSpecsProps) => {
  const roomLabels: Record<string, string> = {
    studio_apartment: cmsData.studioApartmentLabel,
    one_room: cmsData.oneRoomLabel,
    two_rooms: cmsData.twoRoomsLabel,
    three_rooms: cmsData.threeRoomsLabel,
    four_rooms: cmsData.fourRoomsLabel,
    five_rooms: cmsData.fiveRoomsLabel,
  };

  const specs = [
    {
      icon: <MapPin className="w-5 h-5" />,
      label: cmsData.districtLabel,
      value: listing.district,
    },
    {
      icon: <Maximize className="w-5 h-5" />,
      label: cmsData.areaLabel,
      value: `${listing.livingArea} m²`,
    },
  ];

  if (listing.numberOfRooms) {
    specs.push({
      icon: <BedDouble className="w-5 h-5" />,
      label: cmsData.roomsLabel,
      value: roomLabels[listing.numberOfRooms] || listing.numberOfRooms,
    });
  }

  if (listing.floor !== undefined) {
    specs.push({
      icon: <Home className="w-5 h-5" />,
      label: cmsData.floorLabel,
      value: ((): string => {
        const floorMap: Record<string, string> = {
          basement: cmsData.basementLabel,
          ground_floor: cmsData.groundFloorLabel,
          high_ground_floor: cmsData.highGroundFloorLabel,
          "25_plus": cmsData.plus25Label,
          attic: cmsData.atticLabel,
          high_attic: cmsData.highAtticLabel,
          penthouse: cmsData.penthouseLabel,
        };
        if (listing.floor && floorMap[listing.floor]) {
          return floorMap[listing.floor];
        }
        if (listing.floor && !isNaN(Number(listing.floor))) {
          return `${listing.floor}.`;
        }
        return listing.floor || "-";
      })(),
    });
  }

  const availabilityLabel = formatListingAvailability(
    listing.availableFromDate,
    lang,
  );

  if (availabilityLabel) {
    specs.push({
      icon: <Home className="w-5 h-5" />,
      label: cmsData.availabilityLabel,
      value: availabilityLabel,
    });
  }

  if (listing.petFriendly) {
    specs.push({
      icon: <PawPrint className="w-5 h-5" />,
      label: cmsData.petFriendlyLabel,
      value: cmsData.petFriendlyLabel,
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {specs.map((spec, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg p-5 space-y-3 shadow-sm border border-foreground/10"
        >
          <div className="text-primary">{spec.icon}</div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
            {spec.label}
          </p>
          <p className="text-lg font-semibold tracking-tight">
            {spec.value || "-"}
          </p>
        </div>
      ))}
    </div>
  );
};
