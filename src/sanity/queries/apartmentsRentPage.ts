import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";
import { sanityFetch } from "../lib/live";

export interface ApartmentsRentPageCMS {
  introSection: {
    title: string;
    intro: string;
  };
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const apartmentsRentPageQuery = groq`
  *[_type == "apartmentsRentPage"][0] {
    "introSection": {
      "title": title[$lang],
      "intro": intro[$lang]
    },
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage
  }
`;

export async function fetchApartmentsRentPageCms(
  lang: Language["id"],
): Promise<ApartmentsRentPageCMS> {
  const { data } = await sanityFetch({
    query: apartmentsRentPageQuery,
    params: { lang },
    tags: ["apartmentsRentPage"],
  });
  if (!data) {
    notFound();
  }
  return data as ApartmentsRentPageCMS;
}
