import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "../../lib/constants";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface LogoImage {
  image: SanityImageSource;
  imageAlt: string;
}

export interface ClientsSectionCMS {
  title?: string;
  logos: LogoImage[];
}

const clientsSectionQuery = groq`
  *[_type == "clientsSection"][0] {
    "title": title[$lang],
    logos[] {
      image,
      "imageAlt": imageAlt[$lang],
    }
  }
`;

export async function fetchClientsSectionCms(
  lang: Language["id"]
): Promise<ClientsSectionCMS> {
  const { data } = await sanityFetch({
    query: clientsSectionQuery,
    params: { lang },
    tags: ["clientsSection"],
  });
  if (!data) {
    notFound();
  }
  return data as ClientsSectionCMS;
}
