import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export interface ContactFormSectionCMS {
  nameLabel: string;
  namePlaceholder: string;
  nameRequiredError: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailRequiredError: string;
  emailInvalidError: string;
  phoneLabel: string;
  phonePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  messageRequiredError: string;
  sendButtonText: string;
  sendingButtonText: string;
  successMessage: string;
  errorMessage: string;
}

const contactFormQuery = groq`
  *[_type == "contactFormSection"][0] {
    "nameLabel": nameLabel[$lang],
    "namePlaceholder": namePlaceholder[$lang],
    "nameRequiredError": nameRequiredError[$lang],
    "emailLabel": emailLabel[$lang],
    "emailPlaceholder": emailPlaceholder[$lang],
    "emailRequiredError": emailRequiredError[$lang],
    "emailInvalidError": emailInvalidError[$lang],
    "phoneLabel": phoneLabel[$lang],
    "phonePlaceholder": phonePlaceholder[$lang],
    "messageLabel": messageLabel[$lang],
    "messagePlaceholder": messagePlaceholder[$lang],
    "messageRequiredError": messageRequiredError[$lang],
    "sendButtonText": sendButtonText[$lang],
    "sendingButtonText": sendingButtonText[$lang],
    "successMessage": successMessage[$lang],
    "errorMessage": errorMessage[$lang],
  }
`;

export async function fetchContactFormSectionCms(
  lang: Language["id"]
): Promise<ContactFormSectionCMS> {
  const { data } = await sanityFetch({
    query: contactFormQuery,
    params: { lang },
    tags: ["contactFormSection"],
  });
  if (!data) {
    notFound();
  }
  return data as ContactFormSectionCMS;
}
