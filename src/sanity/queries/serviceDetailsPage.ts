import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "../lib/client";
import { ContentSectionCMS } from "../schemaTypes/contentSection";

export interface ServiceDetailsPageCMS {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
  heroBackgroundImage: SanityImageSource;
  heroDescriptionText?: string;
  contentSections: ContentSectionCMS[];
}

export const serviceDetailsPageQuery = groq`
  *[_type == "services" && slug.current == $slug][0] {
    "slug": slug.current,
    "title": servicesPageTitle[$lang],
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage,
    heroBackgroundImage,
    "heroDescriptionText": heroDescriptionText[$lang],
    "contentSections": contentSections[] {
      "text": text[$lang],
      "image": {
        "image": image,
        "alt": imageAlt[$lang]
      }
    }
  }
`;

export const allServiceSlugsQuery = groq`
  *[_type == "services"] {
    "slug": slug.current,
  }
`;

export async function fetchServiceDetailsPageCms(
  lang: Language["id"],
  slug: string,
): Promise<ServiceDetailsPageCMS> {
  const { data } = await sanityFetch({
    query: serviceDetailsPageQuery,
    params: { lang, slug },
    tags: [`serviceDetailsPage-${slug}`],
  });

  if (!data) {
    notFound();
  }

  return data as ServiceDetailsPageCMS;
}

// Static fetch function for build time (generateStaticParams)
export async function fetchStaticAllServiceSlugs(): Promise<
  Pick<ServiceDetailsPageCMS, "slug">[]
> {
  const data = await client.fetch(allServiceSlugsQuery);

  if (!data) {
    return [];
  }

  return data as Pick<ServiceDetailsPageCMS, "slug">[];
}
