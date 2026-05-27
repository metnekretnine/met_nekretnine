import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export interface ListingDetailsPageCMS {
  rentPriceLabel: string;
  areaLabel: string;
  districtLabel: string;
  roomsLabel: string;
  heatingLabel: string;
  availabilityLabel: string;
  petFriendlyLabel: string;
  floorLabel: string;
  basementLabel: string;
  groundFloorLabel: string;
  highGroundFloorLabel: string;
  plus25Label: string;
  atticLabel: string;
  highAtticLabel: string;
  penthouseLabel: string;
  rentedLabel: string;
  reservedLabel: string;
  studioApartmentLabel: string;
  oneRoomLabel: string;
  twoRoomsLabel: string;
  threeRoomsLabel: string;
  fourRoomsLabel: string;
  fiveRoomsLabel: string;
  phoneLabel: string;
  emailLabel: string;
  whatsAppLabel: string;
  descriptionTitle: string;
  rentalTermsTitle: string;
  noCommissionNote: string;
  scheduleViewingTitle: string;
  scheduleViewingText: string;
  locationTitle: string;
}

const listingDetailsPageQuery = groq`
  *[_type == "listingDetailsPage"][0] {
    "rentPriceLabel": rentPriceLabel[$lang],
    "areaLabel": areaLabel[$lang],
    "districtLabel": districtLabel[$lang],
    "roomsLabel": roomsLabel[$lang],
    "heatingLabel": heatingLabel[$lang],
    "availabilityLabel": availabilityLabel[$lang],
    "petFriendlyLabel": petFriendlyLabel[$lang],
    "floorLabel": floorLabel[$lang],
    "basementLabel": basementLabel[$lang],
    "groundFloorLabel": groundFloorLabel[$lang],
    "highGroundFloorLabel": highGroundFloorLabel[$lang],
    "plus25Label": plus25Label[$lang],
    "atticLabel": atticLabel[$lang],
    "highAtticLabel": highAtticLabel[$lang],
    "penthouseLabel": penthouseLabel[$lang],
    "rentedLabel": rentedLabel[$lang],
    "reservedLabel": reservedLabel[$lang],
    "studioApartmentLabel": studioApartmentLabel[$lang],
    "oneRoomLabel": oneRoomLabel[$lang],
    "twoRoomsLabel": twoRoomsLabel[$lang],
    "threeRoomsLabel": threeRoomsLabel[$lang],
    "fourRoomsLabel": fourRoomsLabel[$lang],
    "fiveRoomsLabel": fiveRoomsLabel[$lang],
    "phoneLabel": phoneLabel[$lang],
    "emailLabel": emailLabel[$lang],
    "whatsAppLabel": whatsAppLabel[$lang],
    "descriptionTitle": descriptionTitle[$lang],
    "rentalTermsTitle": rentalTermsTitle[$lang],
    "noCommissionNote": noCommissionNote[$lang],
    "scheduleViewingTitle": scheduleViewingTitle[$lang],
    "scheduleViewingText": scheduleViewingText[$lang],
    "locationTitle": locationTitle[$lang],
  }
`;

export async function fetchListingDetailsPageCms(
  lang: Language["id"],
): Promise<ListingDetailsPageCMS> {
  const { data } = await sanityFetch({
    query: listingDetailsPageQuery,
    params: { lang },
    tags: ["listingDetailsPage"],
  });
  if (!data) {
    notFound();
  }
  return data as ListingDetailsPageCMS;
}
