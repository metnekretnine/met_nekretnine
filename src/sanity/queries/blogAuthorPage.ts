import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export interface BlogAuthorPageCMS {
  metaTitle: string;
  metaDescription: string;
}

const blogAuthorPageQuery = groq`
  *[_type == "blogAuthorPage"][0] {
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
  }
`;

export async function fetchBlogAuthorPageCms(
  lang: Language["id"],
): Promise<BlogAuthorPageCMS> {
  const { data } = await sanityFetch({
    query: blogAuthorPageQuery,
    params: { lang },
    tags: ["blogAuthorPage"],
  });
  if (!data) {
    notFound();
  }
  return data as BlogAuthorPageCMS;
}
