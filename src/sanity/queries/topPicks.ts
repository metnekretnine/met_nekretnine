import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export interface TopPicksSectionCMS {
  title: string;
}

const topPicksQuery = groq`
  *[_type == "topPicksSection"][0] {
    "title": title[$lang],
  }
`;

export async function fetchTopPicksSectionCms(
  lang: Language["id"]
): Promise<TopPicksSectionCMS> {
  const { data } = await sanityFetch({
    query: topPicksQuery,
    params: { lang },
    tags: ["topPicksSection"],
  });
  if (!data) {
    notFound();
  }
  return data as TopPicksSectionCMS;
}
