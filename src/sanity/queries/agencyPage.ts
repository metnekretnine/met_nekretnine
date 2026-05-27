import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";
import { sanityFetch } from "../lib/live";

export interface AgencyPageCMS {
  heroTitle: string;
  heroDescriptionText?: string;
  heroBackgroundImage: SanityImageSource;
  heroBackgroundImageAlt: string;
  contentSection: {
    content: PortableTextBlock[];
  };
  directorSection: {
    label: string;
    name: string;
    linkedinText: string;
    linkedinHref: string;
  };
  hgkSection: {
    logoUrl?: string;
    logoAlt?: string;
  };
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const agencyPageQuery = groq`
  *[_type == "agencyPage"][0] {
    "heroTitle": heroTitle[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    heroBackgroundImage,
    "heroBackgroundImageAlt": heroBackgroundImageAlt[$lang],
    "contentSection": {
      "content": content[$lang]
    },
    "directorSection": {
      "label": directorLabel[$lang],
      "name": directorName,
      "linkedinText": linkedinText[$lang],
      "linkedinHref": linkedinHref
    },
    "hgkSection": {
      "logoUrl": select($lang == "en" => hgkLogoEn.asset->url, hgkLogoHr.asset->url),
      "logoAlt": hgkLogoAlt[$lang]
    },
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage
  }
`;

export async function fetchAgencyPageCms(
  lang: Language["id"],
): Promise<AgencyPageCMS> {
  const { data } = await sanityFetch({
    query: agencyPageQuery,
    params: { lang },
    tags: ["agencyPage"],
  });
  if (!data) {
    notFound();
  }
  return data as AgencyPageCMS;
}
