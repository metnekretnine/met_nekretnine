import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";
import { sanityFetch } from "../lib/live";

export interface CookiePolicyPageCMS {
  heroTitle: string;
  heroDescriptionText?: string;
  heroBackgroundImage: SanityImageSource;
  heroBackgroundImageAlt: string;
  content: PortableTextBlock[];
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const cookiePolicyPageQuery = groq`
  *[_type == "cookiePolicyPage"][0] {
    "heroTitle": heroTitle[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    heroBackgroundImage,
    "heroBackgroundImageAlt": heroBackgroundImageAlt[$lang],
    "content": content[$lang],
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage
  }
`;

export async function fetchCookiePolicyPageCms(
  lang: Language["id"],
): Promise<CookiePolicyPageCMS> {
  const { data } = await sanityFetch({
    query: cookiePolicyPageQuery,
    params: { lang },
    tags: ["cookiePolicyPage"],
  });
  if (!data) {
    notFound();
  }
  return data as CookiePolicyPageCMS;
}
