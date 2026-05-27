import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "@/lib/constants";

export interface NotificationBarSectionCMS {
  isEnabled: boolean;
  message: string;
}

const notificationBarQuery = groq`
  *[_type == "notificationBarSection"][0] {
    isEnabled,
    "message": message[$lang],
  }
`;

export async function fetchNotificationBarSectionCms(
  lang: Language["id"]
): Promise<NotificationBarSectionCMS> {
  const { data } = await sanityFetch({
    query: notificationBarQuery,
    params: { lang },
    tags: ["notificationBarSection"],
  });
  if (!data) {
    notFound();
  }
  return data as NotificationBarSectionCMS;
}
