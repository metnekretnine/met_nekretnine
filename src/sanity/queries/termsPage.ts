import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";
import { sanityFetch } from "../lib/live";

export interface TermsPageCMS {
  heroTitle: string;
  heroDescriptionText?: string;
  heroBackgroundImage: SanityImageSource;
  heroBackgroundImageAlt: string;
  content: PortableTextBlock[];
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const termsPageQuery = groq`
  *[_type == "termsPage"][0] {
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

export async function fetchTermsPageCms(
  lang: Language["id"],
): Promise<TermsPageCMS> {
  const { data } = await sanityFetch({
    query: termsPageQuery,
    params: { lang },
    tags: ["termsPage"],
  });
  if (!data) {
    notFound();
  }
  return data as TermsPageCMS;
}
