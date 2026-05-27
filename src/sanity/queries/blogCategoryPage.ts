import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface BlogCategoryPageCMS {
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const blogCategoryPageQuery = groq`
  *[_type == "blogCategoryPage"][0] {
    "metaDescription": metaDescription[$lang],
    metaOgImage,
  }
`;

export async function fetchBlogCategoryPageCms(
  lang: Language["id"]
): Promise<BlogCategoryPageCMS> {
  const { data } = await sanityFetch({
    query: blogCategoryPageQuery,
    params: { lang },
    tags: ["blogCategoryPage"],
  });
  if (!data) {
    notFound();
  }
  return data as BlogCategoryPageCMS;
}
