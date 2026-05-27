import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";
import { sanityFetch } from "../lib/live";

export interface MetHeroBackgroundImageCMS {
  _key: string;
  image: SanityImageSource;
  imageAlt: string;
}

export interface MetHomePageCMS {
  heroSection: {
    title: string;
    subtitle: string;
    backgroundImages: MetHeroBackgroundImageCMS[];
  };
  positioningSection: {
    title: string;
    subtitle: string;
    content: PortableTextBlock[];
  };
  featuredSection: {
    title: string;
    ctaText: string;
  };
  whySection: {
    title: string;
    items: { title: string; text: string }[];
  };
  landlordSection: {
    title: string;
    content: PortableTextBlock[];
    ctaText: string;
    ctaHref: string;
  };
  tenantSection: {
    title: string;
    content: PortableTextBlock[];
    ctaText: string;
    ctaHref: string;
  };
  internationalSection: {
    title: string;
    content: PortableTextBlock[];
  };
  trustSection: {
    title: string;
    content: PortableTextBlock[];
  };
  aboutSection: {
    title: string;
    content: string;
    directorText: string;
    linkedinText: string;
    linkedinHref: string;
    hgkLogoUrl?: string;
    hgkLogoAlt?: string;
  };
  listingCards: {
    apartmentCardCtaText: string;
    monthlyRentSuffix: string;
    emptyFeaturedText: string;
  };
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const metHomePageQuery = groq`
  *[_type == "metHomePage"][0] {
    "heroSection": {
      "title": heroTitle[$lang],
      "subtitle": heroSubtitle[$lang],
      "backgroundImages": coalesce(
        heroBackgroundImages[] {
          _key,
          image,
          "imageAlt": imageAlt[$lang]
        },
        [
          {
            "_key": "legacy-hero-background",
            "image": heroBackgroundImage,
            "imageAlt": heroBackgroundImageAlt[$lang]
          }
        ]
      )
    },
    "positioningSection": {
      "title": positioningTitle[$lang],
      "subtitle": positioningSubtitle[$lang],
      "content": positioningContent[$lang]
    },
    "featuredSection": {
      "title": featuredTitle[$lang],
      "ctaText": featuredCtaText[$lang]
    },
    "whySection": {
      "title": whyTitle[$lang],
      "items": whyItems[] {
        "title": title[$lang],
        "text": text[$lang]
      }
    },
    "landlordSection": {
      "title": landlordTitle[$lang],
      "content": landlordContent[$lang],
      "ctaText": landlordCtaText[$lang],
      "ctaHref": landlordCtaHref
    },
    "tenantSection": {
      "title": tenantTitle[$lang],
      "content": tenantContent[$lang],
      "ctaText": tenantCtaText[$lang],
      "ctaHref": tenantCtaHref
    },
    "internationalSection": {
      "title": internationalTitle[$lang],
      "content": internationalContent[$lang]
    },
    "trustSection": {
      "title": trustTitle[$lang],
      "content": trustContent[$lang]
    },
    "aboutSection": {
      "title": aboutTitle[$lang],
      "content": aboutContent[$lang],
      "directorText": directorText[$lang],
      "linkedinText": linkedinText[$lang],
      "linkedinHref": linkedinHref,
      "hgkLogoUrl": select($lang == "en" => hgkLogoEn.asset->url, hgkLogoHr.asset->url),
      "hgkLogoAlt": hgkLogoAlt[$lang]
    },
    "listingCards": {
      "apartmentCardCtaText": apartmentCardCtaText[$lang],
      "monthlyRentSuffix": monthlyRentSuffix[$lang],
      "emptyFeaturedText": emptyFeaturedText[$lang]
    },
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage
  }
`;

export async function fetchMetHomePageCms(
  lang: Language["id"],
): Promise<MetHomePageCMS> {
  const { data } = await sanityFetch({
    query: metHomePageQuery,
    params: { lang },
    tags: ["metHomePage"],
  });
  if (!data) {
    notFound();
  }
  return data as MetHomePageCMS;
}
