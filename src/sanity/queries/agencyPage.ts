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
    title?: string;
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
  biographySection: {
    title?: string;
    name?: string;
    education?: string;
    credential?: string;
  };
  ctaSection: {
    title?: string;
    text?: string;
    href?: string;
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
      "title": contentTitle[$lang],
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
    "biographySection": {
      "title": biographyTitle[$lang],
      "name": biographyName,
      "education": biographyEducation[$lang],
      "credential": biographyCredential[$lang]
    },
    "ctaSection": {
      "title": ctaTitle[$lang],
      "text": ctaText[$lang],
      "href": ctaHref
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
