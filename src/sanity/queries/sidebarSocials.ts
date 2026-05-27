import { groq } from "next-sanity";
import { sanityFetch } from "../lib/live";
import { notFound } from "next/navigation";

export interface SidebarSocialsCMS {
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
}

const sidebarSocialsQuery = groq`
  *[_type == "sidebarSocialsSection"][0] {
    phone,
    email,
    facebook,
    instagram
  }
`;

export async function fetchSidebarSocialsCms(): Promise<SidebarSocialsCMS> {
  const { data } = await sanityFetch({
    query: sidebarSocialsQuery,
    tags: ["sidebarSocialsSection"],
  });

  if (!data) {
    notFound();
  }

  return data as SidebarSocialsCMS;
}
