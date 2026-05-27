import { groq } from "next-sanity";
import { sanityFetch } from "../lib/live";
import { client } from "../lib/client";
import { Language } from "@/lib/constants";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { notFound } from "next/navigation";
import { PortableTextBlock } from "@portabletext/types";
import { ZAGREB_DISTRICTS } from "@/lib/zagrebDistricts";
import { NJUSKALO_WATERMARK_VERSION } from "@/lib/njuskaloImageSync";

export { ZAGREB_DISTRICTS } from "@/lib/zagrebDistricts";

export interface ListingCMS {
  _id: string;
  title: string;
  shortDescription: string;
  slug: string;
  status: "active" | "reserved" | "rented";
  type: "rent";
  category: "apartment";
  district: string;
  price: number;
  livingArea: number;
  floor?: string;
  heating?: string;
  availableFromDate?: string;
  code: string;
  petFriendly?: boolean;
  numberOfRooms: string;
  locationDescription?: string;
  rentalTerms?: PortableTextBlock[];
  images: SanityImageSource[];
  video?: string;
  description: PortableTextBlock[];
  location?: {
    lat: number;
    lng: number;
  };
  agent: {
    name: string;
    image: SanityImageSource;
    position: string;
    email?: string;
    phone?: string;
  };
  publishedAt: string;
}

export interface NjuskaloListing {
  _id: string;
  title: string;
  description: PortableTextBlock[];
  slug: string;
  type: "rent";
  category: "apartment";
  district?: string;
  price: number;
  livingArea: number;
  floor?: string;
  heating?: string;
  availableFromDate?: string;
  code: string;
  njuskaloLocationId: string;
  petFriendly?: boolean;
  video?: string;
  images: Array<{ url: string }>;
  agent: {
    phone?: string;
  };
  // Apartment-specific
  flatBuildingType: string;
  flatFloorCount: string;
  numberOfRooms: string;
  // Location
  location: {
    lat: number;
    lng: number;
  };
}

export const listingFields = groq`
  _id,
  "title": title[$lang],
  "shortDescription": shortDescription[$lang],
  "slug": slug.current,
  "status": select(status == "published" => "active", status),
  type,
  category,
  district,
  price,
  livingArea,
  floor,
  heating,
  availableFromDate,
  code,
  petFriendly,
  numberOfRooms,
  "locationDescription": locationDescription[$lang],
  "rentalTerms": rentalTerms[$lang],
  images,
  video,
  "description": description[$lang],
  location,
  agent->{
    name,
    image,
    "position": position[$lang],
    email,
    phone
  },
  publishedAt
`;

export interface FetchListingsParams {
  lang: Language["id"];
  district?: string;
  rooms?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  petFriendly?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function fetchListings({
  lang,
  district,
  rooms,
  minPrice,
  maxPrice,
  minArea,
  maxArea,
  petFriendly,
  isFeatured,
  page = 1,
  limit = 6,
  sort = "newest",
}: FetchListingsParams): Promise<{ listings: ListingCMS[]; total: number }> {
  const start = (page - 1) * limit;
  const end = start + limit;

  const filters = [
    '_type == "listing"',
    `type == "rent"`,
    `category == "apartment"`,
    `defined(district)`,
    `status in ["active", "published", "reserved"]`,
    district && district !== "all" ? `district == "${district}"` : null,
    rooms && rooms !== "all" ? `numberOfRooms == "${rooms}"` : null,
    minPrice ? `price >= ${minPrice}` : null,
    maxPrice ? `price <= ${maxPrice}` : null,
    minArea ? `livingArea >= ${minArea}` : null,
    maxArea ? `livingArea <= ${maxArea}` : null,
    petFriendly === true ? `petFriendly == true` : null,
    isFeatured === true ? `isFeatured == true` : null,
  ]
    .filter(Boolean)
    .join(" && ");

  let orderBy = "publishedAt desc";
  if (sort === "price-asc") orderBy = "price asc";
  else if (sort === "price-desc") orderBy = "price desc";

  const query = groq`{
    "listings": *[${filters}] | order(${orderBy}) [${start}...${end}] {
      ${listingFields}
    },
    "total": count(*[${filters}])
  }`;

  const { data } = await sanityFetch({
    query,
    params: { lang },
    tags: ["listing"],
  });

  return {
    listings: data?.listings || [],
    total: data?.total || 0,
  };
}

export async function fetchListingBySlug(
  lang: Language["id"],
  slug: string,
): Promise<ListingCMS> {
  const query = groq`*[_type == "listing" && slug.current == $slug && type == "rent" && category == "apartment" && defined(district)][0] {
    ${listingFields}
  }`;

  const { data } = await sanityFetch({
    query,
    params: { lang, slug },
    tags: [`listing-${slug}`],
  });

  if (!data) {
    notFound();
  }

  return data as ListingCMS;
}

export async function fetchNjuskaloListings(): Promise<NjuskaloListing[]> {
  const query = groq`
    *[
      _type == "listing" &&
      syncToNjuskalo == true &&
      status in ["active", "published"] &&
      type == "rent" &&
      category == "apartment" &&
      defined(title.hr) &&
      defined(price) &&
      defined(livingArea) &&
      defined(code) &&
      count(images[defined(asset._ref)]) > 0 &&
      count(images[
        defined(asset._ref) &&
        !(asset._ref in ^.njuskaloImages[
          defined(sourceAssetRef) &&
          defined(image.asset._ref) &&
          watermarkVersion == $watermarkVersion
        ].sourceAssetRef)
      ]) == 0 &&
      defined(njuskaloLocationId) &&
      defined(location.lat) &&
      defined(location.lng) &&
      defined(availableFromDate) &&
      defined(flatBuildingType) &&
      defined(flatFloorCount) &&
      defined(numberOfRooms)
    ] {
      _id,
      "title": title.hr,
      "description": description.hr,
      "slug": slug.current,
      type,
      category,
      district,
      price,
      livingArea,
      floor,
      heating,
      availableFromDate,
      code,
      njuskaloLocationId,
      petFriendly,
      video,
      "images": njuskaloImages[
        defined(sourceAssetRef) &&
        defined(image.asset._ref) &&
        watermarkVersion == $watermarkVersion &&
        sourceAssetRef in ^.images[].asset._ref
      ].image.asset->{url},
      agent->{
        phone
      },
      location,
      flatBuildingType,
      flatFloorCount,
      numberOfRooms
    }
  `;

  const { data } = await sanityFetch({
    query,
    params: { watermarkVersion: NJUSKALO_WATERMARK_VERSION },
    tags: ["njuskalo-feed"],
  });

  return data || [];
}

export async function fetchAllDistricts(): Promise<string[]> {
  return [...ZAGREB_DISTRICTS];
}

export async function fetchAllListingSlugs(): Promise<
  { slug: string; publishedAt: string }[]
> {
  const query = groq`*[_type == "listing" && type == "rent" && category == "apartment" && defined(district)] {
    "slug": slug.current,
    publishedAt
  }`;
  const { data } = await sanityFetch({ query, tags: ["listing"] });
  return data || [];
}

export async function fetchStaticAllListingSlugs(
  lang: Language,
): Promise<{ slug: string; publishedAt: string }[]> {
  const query = groq`*[_type == "listing" && type == "rent" && category == "apartment" && defined(district)] {
    "slug": slug.current,
    publishedAt
  }`;
  const data = await client.fetch(query, { lang: lang.id });

  if (!data) {
    return [];
  }

  return data as { slug: string; publishedAt: string }[];
}
