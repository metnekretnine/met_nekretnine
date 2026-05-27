import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";
import { sanityFetch } from "../lib/live";

export interface HeroImage {
  image: SanityImageSource;
  imageAlt: string;
}

export interface HeroSectionCMS {
  badgeText: string;
  mainHeading: string;
  subtitle: string;
  primaryButton?: {
    title: string;
    href: string;
  };
  secondaryButton?: {
    title: string;
    href: string;
  };
  videoUrl?: string;
  backgroundImages: HeroImage[];
}

export interface HomePageCMS {
  heroSection?: HeroSectionCMS;
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const homeQuery = groq`
  *[_type == "homePage"][0] {
    heroSection-> {
      "badgeText": badgeText[$lang],
      "mainHeading": mainHeading[$lang],
      "subtitle": subtitle[$lang],
      primaryButton {
        "title": title[$lang],
        href
      },
      secondaryButton {
        "title": title[$lang],
        href
      },
      "videoUrl": videoFile.asset->url,
      backgroundImages[] {
        image,
        "imageAlt": imageAlt[$lang],
      }
    },
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage
  }
`;

export async function fetchHomePageCms(
  lang: Language["id"]
): Promise<HomePageCMS> {
  const { data } = await sanityFetch({
    query: homeQuery,
    params: { lang },
    tags: ["homePage"],
  });
  if (!data) {
    notFound();
  }
  return data as HomePageCMS;
}
