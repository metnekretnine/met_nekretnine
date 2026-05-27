import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";
import { FaqSectionCMS } from "@/components";

export interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: SanityImageSource;
}

export interface AboutPageCMS {
  heroDescriptionText?: string;
  heroTitle: string;
  heroBackgroundImage: SanityImageSource;
  missionTitle: string;
  missionContent: PortableTextBlock[];
  missionImage: SanityImageSource;
  teamTitle: string;
  teamDescription: string;
  teamMembers: TeamMember[];
  faqSection?: FaqSectionCMS;
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const aboutQuery = groq`
  *[_type == "aboutPage"][0] {
    "heroDescriptionText": heroDescriptionText[$lang],
    "heroTitle": heroTitle[$lang],
    heroBackgroundImage,
    "missionTitle": missionTitle[$lang],
    "missionContent": missionContent[$lang],
    missionImage,
    "teamTitle": teamTitle[$lang],
    "teamDescription": teamDescription[$lang],
    "teamMembers": teamMembers[] {
      name,
      "role": role[$lang],
      "description": description[$lang],
      image
    },
    "faqSection": {
      "title": faqSection.title[$lang],
      "faqs": faqSection.faqs[] {
        "question": question[$lang],
        "answer": answer[$lang]
      }
    },
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage
  }
`;

export async function fetchAboutPageCms(
  lang: Language["id"],
): Promise<AboutPageCMS> {
  const { data } = await sanityFetch({
    query: aboutQuery,
    params: { lang },
    tags: ["aboutPage"],
  });
  if (!data) {
    notFound();
  }
  return data as AboutPageCMS;
}
