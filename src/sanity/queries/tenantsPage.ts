import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";
import { sanityFetch } from "../lib/live";

export interface TenantsPageCMS {
  heroTitle: string;
  heroDescriptionText?: string;
  heroBackgroundImage: SanityImageSource;
  heroBackgroundImageAlt: string;
  processSection: {
    title: string;
    items: { text: string }[];
  };
  contentSection: {
    content: PortableTextBlock[];
    ctaText: string;
    ctaHref: string;
  };
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const tenantsPageQuery = groq`
  *[_type == "tenantsPage"][0] {
    "heroTitle": heroTitle[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    heroBackgroundImage,
    "heroBackgroundImageAlt": heroBackgroundImageAlt[$lang],
    "processSection": {
      "title": processTitle[$lang],
      "items": processItems[] {
        "text": text[$lang]
      }
    },
    "contentSection": {
      "content": content[$lang],
      "ctaText": ctaText[$lang],
      "ctaHref": ctaHref
    },
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage
  }
`;

export async function fetchTenantsPageCms(
  lang: Language["id"],
): Promise<TenantsPageCMS> {
  const { data } = await sanityFetch({
    query: tenantsPageQuery,
    params: { lang },
    tags: ["tenantsPage"],
  });
  if (!data) {
    notFound();
  }
  return data as TenantsPageCMS;
}
