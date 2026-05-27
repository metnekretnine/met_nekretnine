import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export interface WhatsAppButtonSectionCMS {
  whatsappNumber: string;
  whatsappMessage: string;
}

const whatsAppButtonQuery = groq`
  *[_type == "whatsAppButtonSection"][0] {
    whatsappNumber,
    "whatsappMessage": whatsappMessage[$lang],
  }
`;

export async function fetchWhatsAppButtonSectionCms(
  lang: Language["id"]
): Promise<WhatsAppButtonSectionCMS> {
  const { data } = await sanityFetch({
    query: whatsAppButtonQuery,
    params: { lang },
    tags: ["whatsAppButtonSection"],
  });
  if (!data) {
    notFound();
  }
  return data as WhatsAppButtonSectionCMS;
}
