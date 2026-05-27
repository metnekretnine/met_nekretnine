import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { PortableTextBlock } from "@portabletext/types";

export interface ServiceSectionItemCMS {
  title: string;
  description: PortableTextBlock[];
  image: SanityImageSource;
  imageAlt: string;
  buttonText: string;
  slug: string;
}
export interface ServicesSectionCMS {
  title: string;
  moreInfoText: string;
  moreInfoLink: string;
  services: ServiceSectionItemCMS[];
}

export const servicesSectionQuery = groq`
  *[_type == "servicesSection"][0] {
    "title": title[$lang],
    "moreInfoText": moreInfoText[$lang],
    moreInfoLink,
    services[]-> {
      "title": coalesce(servicesSectionTitle[$lang], servicesPageTitle[$lang]),
      "description": coalesce(servicesSectionDescription[$lang], servicesPageDescription[$lang]),
      "image": coalesce(servicesSectionImage, servicesPageImage),
      "imageAlt": coalesce(servicesSectionImageAlt[$lang], servicesPageImageAlt[$lang]),
      "buttonText": servicesSectionButtonText[$lang],
      "slug": slug.current,
    }
  }
`;

export async function fetchServicesSectionCms(
  lang: Language["id"]
): Promise<ServicesSectionCMS> {
  const { data } = await sanityFetch({
    query: servicesSectionQuery,
    params: { lang },
    tags: ["servicesSection"],
  });
  if (!data) {
    notFound();
  }
  return data as ServicesSectionCMS;
}
