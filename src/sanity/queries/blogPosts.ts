import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export interface BlogPostsSectionCMS {
  noArticlesFoundText: string;
  loadMoreButtonText: string;
  loadingButtonText: string;
}

const blogPostsQuery = groq`
  *[_type == "blogPostsSection"][0] {
    "noArticlesFoundText": noArticlesFoundText[$lang],
    "loadMoreButtonText": loadMoreButtonText[$lang],
    "loadingButtonText": loadingButtonText[$lang],
  }
`;

export async function fetchBlogPostsSectionCms(
  lang: Language["id"]
): Promise<BlogPostsSectionCMS> {
  const { data } = await sanityFetch({
    query: blogPostsQuery,
    params: { lang },
    tags: ["blogPostsSection"],
  });
  if (!data) {
    notFound();
  }
  return data as BlogPostsSectionCMS;
}
