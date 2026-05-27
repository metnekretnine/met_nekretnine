import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { HowWeDoItSectionCMS } from "../schemaTypes/howWeDoItSection";

export interface ServicePageItemCMS {
  title: string;
  description: PortableTextBlock[];
  image: SanityImageSource;
  imageAlt: string;
  slug: string;
  buttonText?: string;
}

export interface ServicesPageCMS {
  heroTitle: string;
  heroDescriptionText?: string;
  heroBackgroundImage: SanityImageSource;
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
  howWeDoItSection?: HowWeDoItSectionCMS;
  services: ServicePageItemCMS[];
}

export const servicesPageQuery = groq`
  *[_type == "servicesPage"][0] {
    "heroTitle": heroTitle[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    heroBackgroundImage,
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage,
    "howWeDoItSection": howWeDoItSection {
      "title": title[$lang],
      "steps": steps[] {
        "title": title[$lang],
        "description": description[$lang],
      }
    },
    services[]-> {
      "title": servicesPageTitle[$lang],
      "description": servicesPageDescription[$lang],
      "image": servicesPageImage,
      "imageAlt": servicesPageImageAlt[$lang],
      "slug": slug.current,
      "buttonText": servicesPageButtonText[$lang],
    }
  }
`;

export async function fetchServicesPageCms(
  lang: Language["id"]
): Promise<ServicesPageCMS> {
  const { data } = await sanityFetch({
    query: servicesPageQuery,
    params: { lang },
    tags: ["servicesPage"],
  });
  if (!data) {
    notFound();
  }
  return data as ServicesPageCMS;
}
