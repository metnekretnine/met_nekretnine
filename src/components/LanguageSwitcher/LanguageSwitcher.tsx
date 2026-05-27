"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { LOCALE_COOKIE_NAME } from "@/lib/constants";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/constants";
import { Language } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { Button } from "@/shadcn/components/ui/button";

interface LanguageSwitcherProps {
  className?: string;
}
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<string>(
    DEFAULT_LANGUAGE.id
  );

  useEffect(() => {
    const cookieLocale = Cookies.get(LOCALE_COOKIE_NAME);
    if (
      cookieLocale &&
      SUPPORTED_LANGUAGES.map((lang) => lang.id).includes(
        cookieLocale as Language["id"]
      )
    ) {
      setCurrentLocale(cookieLocale);
    } else {
      // If no cookie or invalid, set the base language as current
      setCurrentLocale(DEFAULT_LANGUAGE.id);
      Cookies.set(LOCALE_COOKIE_NAME, DEFAULT_LANGUAGE.id, { path: "/" });
    }
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    setCurrentLocale(newLocale); // Update state immediately
    Cookies.set(LOCALE_COOKIE_NAME, newLocale, { path: "/" });
    router.refresh();
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-current/15 p-1">
      {SUPPORTED_LANGUAGES.map((lang: Language) => (
        <Button
          key={lang.id}
          onClick={() => handleLanguageChange(lang.id)}
          variant="ghost"
          className={`${className} h-7 rounded-full px-2.5 text-xs font-semibold uppercase tracking-[0.12em] ${
            lang.id === currentLocale ? "bg-current/10 opacity-100" : "opacity-55"
          } hover:opacity-100`}
        >
          {lang.id}
        </Button>
      ))}
    </div>
  );
}
