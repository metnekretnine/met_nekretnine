import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";
import { sanityFetch } from "../lib/live";

export interface LandlordsPageCMS {
  heroTitle: string;
  heroDescriptionText?: string;
  heroBackgroundImage: SanityImageSource;
  heroBackgroundImageAlt: string;
  introSection: {
    title: string;
    text: string;
  };
  processSection: {
    items: { text: string }[];
  };
  modelSection: {
    channelsContent: PortableTextBlock[];
    title: string;
    items: { title: string; text: string }[];
    ctaText: string;
    ctaHref: string;
  };
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const landlordsPageQuery = groq`
  *[_type == "landlordsPage"][0] {
    "heroTitle": heroTitle[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    heroBackgroundImage,
    "heroBackgroundImageAlt": heroBackgroundImageAlt[$lang],
    "introSection": {
      "title": introTitle[$lang],
      "text": introText[$lang]
    },
    "processSection": {
      "items": processItems[] {
        "text": text[$lang]
      }
    },
    "modelSection": {
      "channelsContent": channelsContent[$lang],
      "title": modelTitle[$lang],
      "items": modelItems[] {
        "title": title[$lang],
        "text": text[$lang]
      },
      "ctaText": ctaText[$lang],
      "ctaHref": ctaHref
    },
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage
  }
`;

export async function fetchLandlordsPageCms(
  lang: Language["id"],
): Promise<LandlordsPageCMS> {
  const { data } = await sanityFetch({
    query: landlordsPageQuery,
    params: { lang },
    tags: ["landlordsPage"],
  });
  if (!data) {
    notFound();
  }
  return data as LandlordsPageCMS;
}
