import { defineQuery } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export const recentPostsSectionQuery = defineQuery(`
  *[_type == "recentPostsSection"][0] {
    "title": title[$lang],
    "viewAllLabel": viewAllLabel[$lang]
  }
`);

export interface RecentPostsSectionCMS {
  title: string;
  viewAllLabel: string;
}

export async function fetchRecentPostsSectionCms(
  lang: Language["id"]
): Promise<RecentPostsSectionCMS> {
  const { data } = await sanityFetch({
    query: recentPostsSectionQuery,
    params: { lang },
    tags: ["recentPostsSection"],
  });

  if (!data) {
    notFound();
  }

  return data as RecentPostsSectionCMS;
}
