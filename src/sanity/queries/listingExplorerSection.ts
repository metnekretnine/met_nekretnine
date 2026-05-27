import { groq } from "next-sanity";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";
import { notFound } from "next/navigation";

export interface ListingExplorerSectionCMS {
  title: string;
  locationLabel: string;
  priceLabel: string;
  areaLabel: string;
  roomsLabel: string;
  petFriendlyLabel: string;
  minPlaceholder: string;
  maxPlaceholder: string;
  applyButtonLabel: string;
  allRoomsLabel: string;
  studioApartmentLabel: string;
  oneRoomLabel: string;
  twoRoomsLabel: string;
  threeRoomsLabel: string;
  fourRoomsLabel: string;
  fiveRoomsLabel: string;
  allCountiesLabel: string;
  totalResultsLabel: string;
  sortNewestLabel: string;
  sortPriceAscLabel: string;
  sortPriceDescLabel: string;
  noResultsTitle: string;
  noResultsDescription: string;
  rentedLabel: string;
  reservedLabel: string;
  detailsCtaText: string;
  monthlyRentSuffix: string;
}

export async function fetchListingExplorerSectionCms(
  lang: Language["id"],
): Promise<ListingExplorerSectionCMS> {
  const query = groq`*[_type == "listingExplorerSection"][0] {
    "title": title[$lang],
    "locationLabel": locationLabel[$lang],
    "priceLabel": priceLabel[$lang],
    "areaLabel": areaLabel[$lang],
    "roomsLabel": roomsLabel[$lang],
    "petFriendlyLabel": petFriendlyLabel[$lang],
    "minPlaceholder": minPlaceholder[$lang],
    "maxPlaceholder": maxPlaceholder[$lang],
    "applyButtonLabel": applyButtonLabel[$lang],
    "allRoomsLabel": allRoomsLabel[$lang],
    "studioApartmentLabel": studioApartmentLabel[$lang],
    "oneRoomLabel": oneRoomLabel[$lang],
    "twoRoomsLabel": twoRoomsLabel[$lang],
    "threeRoomsLabel": threeRoomsLabel[$lang],
    "fourRoomsLabel": fourRoomsLabel[$lang],
    "fiveRoomsLabel": fiveRoomsLabel[$lang],
    "allCountiesLabel": allCountiesLabel[$lang],
    "totalResultsLabel": totalResultsLabel[$lang],
    "sortNewestLabel": sortNewestLabel[$lang],
    "sortPriceAscLabel": sortPriceAscLabel[$lang],
    "sortPriceDescLabel": sortPriceDescLabel[$lang],
    "noResultsTitle": noResultsTitle[$lang],
    "noResultsDescription": noResultsDescription[$lang],
    "rentedLabel": rentedLabel[$lang],
    "reservedLabel": reservedLabel[$lang],
    "detailsCtaText": detailsCtaText[$lang],
    "monthlyRentSuffix": monthlyRentSuffix[$lang]
  }`;

  const { data } = await sanityFetch({
    query,
    params: { lang },
    tags: ["listingExplorerSection"],
  });

  if (!data) {
    notFound();
  }

  return data as ListingExplorerSectionCMS;
}
