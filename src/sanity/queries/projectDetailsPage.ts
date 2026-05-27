import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "../lib/client";
import { ContentSectionCMS } from "../schemaTypes/contentSection";

export interface ProjectDetailsPageCMS {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
  heroBackgroundImage: SanityImageSource;
  heroDescriptionText?: string;
  contentSections: ContentSectionCMS[];
}

export const projectDetailsPageQuery = groq`
  *[_type == "projects" && slug.current == $slug][0] {
    "slug": slug.current,
    "title": projectsPageTitle[$lang],
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

export const allProjectSlugsQuery = groq`
  *[_type == "projects"] {
    "slug": slug.current,
  }
`;

export async function fetchProjectDetailsPageCms(
  lang: Language["id"],
  slug: string
): Promise<ProjectDetailsPageCMS> {
  const { data } = await sanityFetch({
    query: projectDetailsPageQuery,
    params: { lang, slug },
    tags: [`projectDetailsPage-${slug}`],
  });

  if (!data) {
    notFound();
  }

  return data as ProjectDetailsPageCMS;
}

// Static fetch function for build time (generateStaticParams)
export async function fetchStaticAllProjectSlugs(): Promise<
  Pick<ProjectDetailsPageCMS, "slug">[]
> {
  const data = await client.fetch(allProjectSlugsQuery);

  if (!data) {
    return [];
  }

  return data as Pick<ProjectDetailsPageCMS, "slug">[];
}
