import { groq } from "next-sanity";
import { sanityFetch } from "../lib/live";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface MaintenancePageCMS {
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
  maintenanceText: PortableTextBlock[];
}

export const maintenancePageQuery = groq`
  *[_type == "maintenancePage"][0]{
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage,
    "maintenanceText": maintenanceText[$lang],
  }
`;

export async function fetchMaintenancePageCms(
  lang: string
): Promise<MaintenancePageCMS> {
  const { data } = await sanityFetch({
    query: maintenancePageQuery,
    params: { lang },
    tags: ["maintenancePage"],
  });
  return data as MaintenancePageCMS;
}
