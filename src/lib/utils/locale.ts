import { headers } from "next/headers";
import { DEFAULT_LANGUAGE, X_NEXT_LOCALE_HEADER, Language } from "@/lib/constants";

export async function getLang(): Promise<Language["id"]> {
  const headersList = await headers();
  return (headersList.get(X_NEXT_LOCALE_HEADER) as Language["id"]) || DEFAULT_LANGUAGE.id;
}
