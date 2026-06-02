import {
  ProjectsSectionCMS,
  ProjectSectionItemCMS,
} from "@/sanity/queries/projectsSection";
import {
  ServicesSectionCMS,
  ServiceSectionItemCMS,
} from "@/sanity/queries/servicesSection";
import {
  FeaturedListingsSectionCMS,
  FeaturedListingItemCMS,
} from "@/sanity/queries/featuredListingsSection";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { PortableTextBlock } from "@portabletext/types";
import { LISTING_LINK } from "../constants";

export interface ItemsDisplayerItem {
  title: string;
  description: PortableTextBlock[] | string;
  image: SanityImageSource;
  imageAlt: string;
  buttonText: string;
  buttonLink: string;
  status?: "active" | "reserved" | "rented";
}

export interface ItemsDisplayer {
  title: string;
  moreInfoText: string;
  moreInfoLink: string;
  rentedLabel: string;
  reservedLabel: string;
  items: ItemsDisplayerItem[];
}

export const mapItemsToDisplayer = (
  data: ProjectsSectionCMS | ServicesSectionCMS | FeaturedListingsSectionCMS
): ItemsDisplayer => {
  let items: (
    | ProjectSectionItemCMS
    | ServiceSectionItemCMS
    | FeaturedListingItemCMS
  )[] = [];

  if ("projects" in data && data.projects) {
    items = data.projects;
  } else if ("services" in data && data.services) {
    items = data.services;
  } else if ("listings" in data && data.listings) {
    items = data.listings;
  }

  const isListingSection = "listings" in data;

  return {
    title: data.title,
    moreInfoText: data.moreInfoText,
    moreInfoLink: data.moreInfoLink,
    rentedLabel: isListingSection ? (data as FeaturedListingsSectionCMS).rentedLabel : "",
    reservedLabel: isListingSection
      ? (data as FeaturedListingsSectionCMS).reservedLabel
      : "",
    items: items.map((item) => {
      const baseLink = isListingSection ? LISTING_LINK : data.moreInfoLink;

      return {
        title: item.title,
        description: item.description,
        image: item.image,
        imageAlt: item.imageAlt,
        buttonText: item.buttonText,
        buttonLink: `${baseLink}/${item.slug}`,
        status: "status" in item ? (item as FeaturedListingItemCMS).status : undefined,
      };
    }),
  };
};
