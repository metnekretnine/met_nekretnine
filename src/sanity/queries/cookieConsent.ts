import { groq } from "next-sanity";
import { sanityFetch } from "../lib/live";
import { notFound } from "next/navigation";
import { Language } from "@/lib/constants";

export interface CookieConsentSectionCMS {
  title: string;
  description: string;
  agreementText: string;
  learnMoreLinkText: string;
  declineButtonText: string;
  acceptButtonText: string;
}

const cookieConsentQuery = groq`
  *[_type == "cookieConsentSection"][0] {
    "title": title[$lang],
    "description": description[$lang],
    "agreementText": agreementText[$lang],
    "learnMoreLinkText": learnMoreLinkText[$lang],
    "declineButtonText": declineButtonText[$lang],
    "acceptButtonText": acceptButtonText[$lang],
  }
`;

export const fetchCookieConsentSectionCms = async (
  lang: Language["id"]
): Promise<CookieConsentSectionCMS> => {
  const { data } = await sanityFetch({
    query: cookieConsentQuery,
    params: { lang },
    tags: ["cookieConsentSection"],
  });
  if (!data) {
    notFound();
  }
  return data as CookieConsentSectionCMS;
};
