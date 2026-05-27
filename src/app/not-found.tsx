import Link from "next/link";
import { fetchNotFoundPageCms } from "@/sanity/queries";
import { getLang, generatePageMetadata } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { HOME_LINK, NOT_FOUND_LINK } from "@/lib/constants";

export async function generateMetadata() {
  const lang = await getLang();
  const cmsData = await fetchNotFoundPageCms(lang);

  return generatePageMetadata({
    metaTitle: cmsData.metaTitle,
    metaDescription: cmsData.metaDescription,
    metaOgImage: cmsData.metaOgImage,
    canonicalPath: NOT_FOUND_LINK,
    noIndex: true,
  });
}

export default async function NotFound() {
  const lang = await getLang();
  const cmsData = await fetchNotFoundPageCms(lang);

  return (
    <main className="mt-14 md:mt-20">
      <section className="container mx-auto flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center px-global py-20 text-center md:py-24">
        <p className="select-none text-[8rem] font-semibold leading-none tracking-tight text-foreground/[0.06] md:text-[12rem] lg:text-[14rem]">
          {cmsData.heroTitle}
        </p>

        <h1 className="mt-4 max-w-4xl text-4xl font-semibold uppercase leading-none tracking-tight md:mt-6 md:text-6xl lg:text-7xl">
          {cmsData.subtitle}
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {cmsData.text}
        </p>

        <Link
          href={HOME_LINK}
          className="mt-10 inline-flex h-12 min-w-[19.5rem] max-w-full items-center justify-center gap-3 rounded-lg bg-foreground px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white"
        >
          {cmsData.buttonText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
