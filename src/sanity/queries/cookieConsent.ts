import { groq } from "next-sanity";
import { sanityFetch } from "../lib/live";
import { notFound } from "next/navigation";
import { Language } from "@/lib/constants";

export interface CookieConsentSectionCMS {
  title: string;
  description: string;
  learnMoreLinkText: string;
  acceptButtonText: string;
  settingsButtonText: string;
  saveSettingsButtonText: string;
  necessaryCookiesLabel: string;
  necessaryCookiesDescription: string;
  analyticsCookiesLabel: string;
  analyticsCookiesDescription: string;
}

const cookieConsentQuery = groq`
  *[_type == "cookieConsentSection"][0] {
    "title": title[$lang],
    "description": description[$lang],
    "learnMoreLinkText": learnMoreLinkText[$lang],
    "acceptButtonText": acceptButtonText[$lang],
    "settingsButtonText": settingsButtonText[$lang],
    "saveSettingsButtonText": saveSettingsButtonText[$lang],
    "necessaryCookiesLabel": necessaryCookiesLabel[$lang],
    "necessaryCookiesDescription": necessaryCookiesDescription[$lang],
    "analyticsCookiesLabel": analyticsCookiesLabel[$lang],
    "analyticsCookiesDescription": analyticsCookiesDescription[$lang],
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
