import { format } from "date-fns";
import { hr, enUS } from "date-fns/locale";
import { Language } from "@/lib/constants";

export const formatDate = (
  dateString: string | undefined,
  lang: Language["id"]
) => {
  if (!dateString) {
    return "N/A";
  }

  const date = new Date(dateString);
  
  switch (lang) {
    case "hr":
      return format(date, "PPP", { locale: hr });
    case "en":
      return format(date, "PPP", { locale: enUS });
  }
};
