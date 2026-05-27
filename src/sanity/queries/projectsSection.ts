import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { PortableTextBlock } from "@portabletext/types";

export interface ProjectSectionItemCMS {
  title: string;
  description: PortableTextBlock[];
  image: SanityImageSource;
  imageAlt: string;
  buttonText: string;
  slug: string;
}
export interface ProjectsSectionCMS {
  title: string;
  moreInfoText: string;
  moreInfoLink: string;
  projects: ProjectSectionItemCMS[];
}

export const projectsSectionQuery = groq`
  *[_type == "projectsSection"][0] {
    "title": title[$lang],
    "moreInfoText": moreInfoText[$lang],
    moreInfoLink,
    projects[]-> {
      "title": coalesce(projectsSectionTitle[$lang], projectsPageTitle[$lang]),
      "description": coalesce(projectsSectionDescription[$lang], projectsPageDescription[$lang]),
      "image": coalesce(projectsSectionImage, projectsPageImage),
      "imageAlt": coalesce(projectsSectionImageAlt[$lang], projectsPageImageAlt[$lang]),
      "buttonText": projectsSectionButtonText[$lang],
      "slug": slug.current,
    }
  }
`;

export async function fetchProjectsSectionCms(
  lang: Language["id"]
): Promise<ProjectsSectionCMS> {
  const { data } = await sanityFetch({
    query: projectsSectionQuery,
    params: { lang },
    tags: ["projectsSection"],
  });
  if (!data) {
    notFound();
  }
  return data as ProjectsSectionCMS;
}
