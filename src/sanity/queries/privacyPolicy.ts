import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";

export interface PrivacyPolicyPageCMS {
  heroTitle: string;
  heroBackgroundImage: SanityImageSource;
  heroBackgroundImageAlt: string;
  heroDescriptionText?: string;
  content: PortableTextBlock[];
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const privacyPolicyQuery = groq`
  *[_type == "privacyPolicyPage"][0] {
    "heroTitle": heroTitle[$lang],
    heroBackgroundImage,
    "heroBackgroundImageAlt": heroBackgroundImageAlt[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    "content": content[$lang],
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage,
  }
`;

export async function fetchPrivacyPolicyPageCms(
  lang: Language["id"]
): Promise<PrivacyPolicyPageCMS> {
  const { data } = await sanityFetch({
    query: privacyPolicyQuery,
    params: { lang },
    tags: ["privacyPolicyPage"],
  });
  if (!data) {
    notFound();
  }
  return data as PrivacyPolicyPageCMS;
}
