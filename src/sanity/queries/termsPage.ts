import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { ArbitraryTypedObject, PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";
import { sanityFetch } from "../lib/live";

export interface TermsPageCMS {
  heroTitle: string;
  heroDescriptionText?: string;
  heroBackgroundImage: SanityImageSource;
  heroBackgroundImageAlt: string;
  content: Array<PortableTextBlock | ArbitraryTypedObject>;
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

// `isDraftPreview` reads the unpublished draft (e.g. the new price list) for ?admin=true.
export async function fetchTermsPageCms(
  lang: Language["id"],
  isDraftPreview = false,
): Promise<TermsPageCMS> {
  const { data } = await sanityFetch({
    query: termsPageQuery,
    params: { lang },
    tags: ["termsPage"],
    ...(isDraftPreview && { perspective: "drafts" as const }),
  });
  if (!data) {
    notFound();
  }
  return data as TermsPageCMS;
}
