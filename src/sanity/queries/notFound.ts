import { groq } from "next-sanity";
import { sanityFetch } from "../lib/live";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";

export interface NotFoundPageCMS {
  heroTitle: string;
  subtitle: string;
  text: string;
  buttonText: string;
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const notFoundQuery = groq`
  *[_type == "notFoundPage"][0] {
    "heroTitle": heroTitle[$lang],
    "subtitle": subtitle[$lang],
    "text": text[$lang],
    "buttonText": buttonText[$lang],
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage,
  }
`;

//Specific because if there is no data we must return a default object
export async function fetchNotFoundPageCms(
  lang: Language["id"]
): Promise<NotFoundPageCMS> {
  const { data } = await sanityFetch({
    query: notFoundQuery,
    params: { lang },
    tags: ["notFoundPage"],
  });
  if (!data) {
    return {
      heroTitle: '404',
      subtitle: 'Stranica nije pronađena',
      text: 'Traženi resurs nije moguće pronaći.',
      buttonText: 'Povratak na početnu',
      metaTitle: '404 - Stranica nije pronađena',
      metaDescription: 'Traženi resurs nije moguće pronaći.',
    };
  }
  return data as NotFoundPageCMS;
}
