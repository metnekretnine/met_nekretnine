import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export interface SocialLink {
  href: string;
  ariaLabel: string;
}

export interface FooterLink {
  text: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterSectionCMS {
  companyName: string;
  tagline: string;
  specialtyText: string;
  licenseText: string;
  email: string;
  phone: string;
  linkedin: SocialLink;
  instagram: SocialLink;
  sections: FooterSection[];
  copyright: string;
}

const footerQuery = groq`
  *[_type == "footerSection"][0] {
    "companyName": companyName[$lang],
    "tagline": tagline[$lang],
    "specialtyText": specialtyText[$lang],
    "licenseText": licenseText[$lang],
    email,
    phone,
    "linkedin": {
      "href": linkedin.href,
      "ariaLabel": linkedin.ariaLabel
    },
    "instagram": {
      "href": instagram.href,
      "ariaLabel": instagram.ariaLabel
    },
    "sections": sections[] {
      "title": title[$lang],
      "links": links[] {
        "text": text[$lang],
        href
      }
    },
    "copyright": copyright[$lang]
  }
`;

export async function fetchFooterSectionCms(
  lang: Language["id"]
): Promise<FooterSectionCMS> {
  const { data } = await sanityFetch({
    query: footerQuery,
    params: { lang },
    tags: ["footerSection"],
  });
  if (!data) {
    notFound();
  }
  return data as FooterSectionCMS;
}
