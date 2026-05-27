import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export interface CtaSectionCMS {
  title: string;
  phoneText: string;
  phoneHref: string;
  whatsappText: string;
  whatsappHref: string;
}

const ctaQuery = groq`
  *[_type == "ctaSection"][0] {
    "title": title[$lang],
    "phoneText": phoneText[$lang],
    phoneHref,
    "whatsappText": whatsappText[$lang],
    whatsappHref
  }
`;

export async function fetchCtaSectionCms(
  lang: Language["id"]
): Promise<CtaSectionCMS> {
  const { data } = await sanityFetch({
    query: ctaQuery,
    params: { lang },
    tags: ["ctaSection"],
  });
  if (!data) {
    notFound();
  }
  return data as CtaSectionCMS;
}
