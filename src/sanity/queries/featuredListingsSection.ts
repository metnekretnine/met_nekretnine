import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface FeaturedListingItemCMS {
  title: string;
  description: string;
  image: SanityImageSource;
  imageAlt: string;
  buttonText: string;
  slug: string;
  status: "active" | "reserved" | "rented";
}

export interface FeaturedListingsSectionCMS {
  title: string;
  moreInfoText: string;
  moreInfoLink: string;
  rentedLabel: string;
  reservedLabel: string;
  listings: FeaturedListingItemCMS[];
}

export const featuredListingSaleSectionQuery = groq`
  {
    "section": *[_type == "featuredListingSaleSection"][0] {
      "title": title[$lang],
      "moreInfoText": moreInfoText[$lang],
      moreInfoLink,
      "buttonText": buttonText[$lang],
      "rentedLabel": rentedLabel[$lang],
      "reservedLabel": reservedLabel[$lang]
    },
    "listings": *[_type == "listing" && type == "sale" && isFeatured == true] | order(publishedAt desc) {
      "title": title[$lang],
      "description": shortDescription[$lang],
      "image": images[0],
      "imageAlt": title[$lang],
      "slug": slug.current,
      status
    }
  }
`;

export const featuredRentListingSectionQuery = groq`
  {
    "section": *[_type == "featuredRentListingSection"][0] {
      "title": title[$lang],
      "moreInfoText": moreInfoText[$lang],
      moreInfoLink,
      "buttonText": buttonText[$lang],
      "rentedLabel": rentedLabel[$lang],
      "reservedLabel": reservedLabel[$lang]
    },
    "listings": *[_type == "listing" && type == "rent" && isFeatured == true && status in ["active", "reserved"]] | order(publishedAt desc) {
      "title": title[$lang],
      "description": shortDescription[$lang],
      "image": images[0],
      "imageAlt": title[$lang],
      "slug": slug.current,
      status
    }
  }
`;

export async function fetchFeaturedListingSaleSectionCms(
  lang: Language["id"],
): Promise<FeaturedListingsSectionCMS> {
  const { data } = await sanityFetch({
    query: featuredListingSaleSectionQuery,
    params: { lang },
    tags: ["featuredListingSaleSection", "listing"],
  });

  if (!data || !data.section) {
    notFound();
  }

  return {
    ...data.section,
    listings: data.listings.map((l: FeaturedListingItemCMS) => ({
      ...l,
      buttonText: data.section.buttonText,
    })),
  } as FeaturedListingsSectionCMS;
}

export async function fetchFeaturedRentListingSectionCms(
  lang: Language["id"],
): Promise<FeaturedListingsSectionCMS> {
  const { data } = await sanityFetch({
    query: featuredRentListingSectionQuery,
    params: { lang },
    tags: ["featuredRentListingSection", "listing"],
  });

  if (!data || !data.section) {
    notFound();
  }

  return {
    ...data.section,
    listings: data.listings.map((l: FeaturedListingItemCMS) => ({
      ...l,
      buttonText: data.section.buttonText,
    })),
  } as FeaturedListingsSectionCMS;
}
