import { groq } from "next-sanity";
import { sanityFetch } from "../lib/live";
import { notFound } from "next/navigation";
import { Language } from "@/lib/constants";

export interface StatItemCMS {
  value: number;
  label: string;
  suffix?: string;
}

export interface StatsSectionCMS {
  title: string;
  stats: StatItemCMS[];
}

const statsSectionQuery = groq`
  *[_type == "statsSection"][0] {
    "title": title[$lang],
    stats[] {
      value,
      "label": label[$lang],
      suffix
    }
  }
`;

export async function fetchStatsSectionCms(
  lang: Language["id"]
): Promise<StatsSectionCMS> {
  const { data } = await sanityFetch({
    query: statsSectionQuery,
    params: { lang },
    tags: ["statsSection"],
  });
  if (!data) {
    notFound();
  }
  return data as StatsSectionCMS;
}
