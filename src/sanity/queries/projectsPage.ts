import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface ProjectPageItemCMS {
  title: string;
  description: PortableTextBlock[];
  image: SanityImageSource;
  imageAlt: string;
  slug: string;
  buttonText?: string;
}

export interface ProjectsPageCMS {
  heroTitle: string;
  heroDescriptionText?: string;
  heroBackgroundImage: SanityImageSource;
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
  projects: ProjectPageItemCMS[];
}

export const projectsPageQuery = groq`
  *[_type == "projectsPage"][0] {
    "heroTitle": heroTitle[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    heroBackgroundImage,
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage,
    projects[]-> {
      "title": projectsPageTitle[$lang],
      "description": projectsPageDescription[$lang],
      "image": projectsPageImage,
      "imageAlt": projectsPageImageAlt[$lang],
      "slug": slug.current,
      "buttonText": projectsPageButtonText[$lang],
    }
  }
`;

export async function fetchProjectsPageCms(
  lang: Language["id"]
): Promise<ProjectsPageCMS> {
  const { data } = await sanityFetch({
    query: projectsPageQuery,
    params: { lang },
    tags: ["projectsPage"],
  });
  if (!data) {
    notFound();
  }
  return data as ProjectsPageCMS;
}
