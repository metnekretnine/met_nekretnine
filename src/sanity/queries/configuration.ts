import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";

export interface ConfigurationSectionCMS {
  isWhatsAppEnabled: boolean;
  isHubSpotEnabled: boolean;
  isBackToTopButtonEnabled: boolean;
}

const configurationQuery = groq`
  *[_type == "configurationSection"][0] {
    isWhatsAppEnabled,
    isHubSpotEnabled,
    isBackToTopButtonEnabled,
  }
`;

export async function fetchConfigurationSectionCms(lang: string): Promise<ConfigurationSectionCMS> {
  const { data } = await sanityFetch({
    query: configurationQuery,
    params: { lang },
    tags: ["configurationSection"],
  });
  if (!data) {
    return notFound();
  }
  return data as ConfigurationSectionCMS;
}
