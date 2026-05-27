import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface RentPageCMS {
  heroTitle: string;
  heroDescriptionText: string;
  heroBackgroundImage: SanityImageSource;
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

export async function fetchRentPageCms(
  lang: Language["id"]
): Promise<RentPageCMS> {
  const query = groq`*[_type == "rentPage"][0] {
    "heroTitle": heroTitle[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    heroBackgroundImage,
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage
  }`;

  const { data } = await sanityFetch({
    query,
    params: { lang },
    tags: ["rentPage"],
  });

  if (!data) {
    notFound();
  }

  return data;
}
