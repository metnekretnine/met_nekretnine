import { groq } from "next-sanity";
import { sanityFetch } from "../lib/live";
import { notFound } from "next/navigation";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";

export interface MeetingPageCMS {
  heroTitle: string;
  heroDescriptionText?: string;
  heroBackgroundImage: SanityImageSource;
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const meetingPageQuery = groq`
  *[_type == "meetingPage"][0] {
    "heroTitle": heroTitle[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    heroBackgroundImage,
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage,
  }
`;

export async function fetchMeetingPageCms(
  lang: Language["id"]
): Promise<MeetingPageCMS> {
  const { data } = await sanityFetch({
    query: meetingPageQuery,
    params: { lang },
    tags: ["meetingPage"],
  });
  if (!data) {
    notFound();
  }
  return data as MeetingPageCMS;
}
