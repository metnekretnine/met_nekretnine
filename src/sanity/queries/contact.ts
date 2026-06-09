import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";

export interface ContactPageCMS {
  heroTitle: string;
  heroBackgroundImage: SanityImageSource;
  heroBackgroundImageAlt: string;
  heroDescriptionText?: string;
  findUsTitle: string;
  companyNameLabel: string;
  companyNameValue: string;
  companyNameSubValue: string;
  companyAddressLabel: string;
  companyAddressValue: string;
  companyAddressSubValue: string;
  companyPhoneLabel: string;
  companyPhoneValue: string;
  whatsAppLabel: string;
  whatsAppValue: string;
  whatsAppHref: string;
  companyEmailLabel: string;
  companyEmailValue: string;
  instagramLabel: string;
  instagramHref: string;
  linkedinLabel: string;
  linkedinHref: string;
  facebookLabel?: string;
  facebookHref?: string;
  infoLabel: string;
  infoValue: string;
  infoSubValue: string;
  sendInquiryTitle: string;
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
  meetingButtonText: string;
  meetingButtonLink: string;
}

const contactQuery = groq`
  *[_type == "contactPage"][0] {
    "heroTitle": heroTitle[$lang],
    heroBackgroundImage,
    "heroBackgroundImageAlt": heroBackgroundImageAlt[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    "findUsTitle": findUsTitle[$lang],
    "companyNameLabel": companyNameLabel[$lang],
    "companyNameValue": companyNameValue,
    "companyNameSubValue": companyNameSubValue[$lang],
    "companyAddressLabel": companyAddressLabel[$lang],
    "companyAddressValue": companyAddressValue,
    "companyAddressSubValue": companyAddressSubValue[$lang],
    "companyPhoneLabel": companyPhoneLabel[$lang],
    "companyPhoneValue": companyPhoneValue,
    "whatsAppLabel": whatsAppLabel[$lang],
    "whatsAppValue": whatsAppValue,
    "whatsAppHref": whatsAppHref,
    "companyEmailLabel": companyEmailLabel[$lang],
    "companyEmailValue": companyEmailValue,
    "instagramLabel": instagramLabel[$lang],
    instagramHref,
    "linkedinLabel": linkedinLabel[$lang],
    linkedinHref,
    "facebookLabel": facebookLabel[$lang],
    facebookHref,
    "infoLabel": infoLabel[$lang],
    "infoValue": infoValue,
    "infoSubValue": infoSubValue,
    "sendInquiryTitle": sendInquiryTitle[$lang],
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage,
    "meetingButtonText": meetingButtonText[$lang],
    meetingButtonLink,
  }
`;

export async function fetchContactPageCms(
  lang: Language["id"],
): Promise<ContactPageCMS> {
  const { data } = await sanityFetch({
    query: contactQuery,
    params: { lang },
    tags: ["contactPage"],
  });
  if (!data) {
    notFound();
  }
  return data as ContactPageCMS;
}
