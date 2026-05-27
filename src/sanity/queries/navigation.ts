import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export interface NavigationLink {
  title: string;
  href: string;
}

export interface CtaButton {
  title: string;
  href: string;
}

export interface NavigationSectionCMS {
  links: NavigationLink[];
  ctaButton: CtaButton;
}

const navigationQuery = groq`
  *[_type == "navigationSection"][0] {
    "links": links[] {
      "title": title[$lang],
      href
    },
    "ctaButton": {
      "title": ctaButton.title[$lang],
      "href": ctaButton.href
    }
  }
`;

export async function fetchNavigationSectionCms(
  lang: Language["id"]
): Promise<NavigationSectionCMS> {
  const { data } = await sanityFetch({
    query: navigationQuery,
    params: { lang },
    tags: ["navigationSection"],
  });
  if (!data) {
    notFound();
  }
  return data as NavigationSectionCMS;
}
