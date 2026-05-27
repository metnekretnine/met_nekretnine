import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export interface CategoriesFilterSectionCMS {
  allCategoriesText: string;
}

const categoriesFilterQuery = groq`
  *[_type == "categoriesFilterSection"][0] {
    "allCategoriesText": allCategoriesText[$lang],
  }
`;

export async function fetchCategoriesFilterSectionCms(
  lang: Language["id"]
): Promise<CategoriesFilterSectionCMS> {
  const { data } = await sanityFetch({
    query: categoriesFilterQuery,
    params: { lang },
    tags: ["categoriesFilterSection"],
  });
  if (!data) {
    notFound();
  }
  return data as CategoriesFilterSectionCMS;
}
