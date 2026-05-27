import Image from "next/image";
import Link from "next/link";
import { ProjectPageItemCMS } from "@/sanity/queries/projectsPage";
import { ServicePageItemCMS } from "@/sanity/queries/servicesPage";
import { PortableText } from "../PortableText/PortableText";
import { urlFor } from "@/sanity/lib/image";
import { ArrowRight } from "lucide-react";

interface ContentShowcaseProps {
  cmsData: ServicePageItemCMS | ProjectPageItemCMS;
  isImageLeft: boolean;
  className?: string;
  linkPrefix: string;
}

export function ContentShowcase({
  cmsData,
  isImageLeft,
  className,
  linkPrefix,
}: ContentShowcaseProps) {
  const isDark = isImageLeft;

  return (
    <section className={`w-full ${className}`}>
      <div
        className={`container mx-auto px-global flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
          isImageLeft ? "" : "lg:flex-row-reverse"
        }`}
      >
        {/* Image */}
        <div className="w-full lg:w-1/2 relative aspect-[4/3] rounded-[2.5rem] overflow-hidden group">
          <Image
            src={urlFor(cmsData.image).url()}
            alt={cmsData.imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        </div>

        {/* Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <div className="space-y-8 max-w-lg">
            <h2
              className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none uppercase ${
                isDark ? "text-white" : "text-foreground"
              }`}
            >
              {cmsData.title}
            </h2>

            <div
              className={`text-lg leading-relaxed ${
                isDark ? "text-white/70" : "text-muted-foreground"
              }`}
            >
              <PortableText
                value={cmsData.description}
                isBackgroundDark={isDark}
              />
            </div>

            {cmsData.slug && cmsData.buttonText && (
              <Link
                href={`${linkPrefix}/${cmsData.slug}`}
                className={`inline-flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 group/link ${
                  isDark ? "text-white hover:gap-6" : "text-primary hover:gap-6"
                }`}
              >
                {cmsData.buttonText}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/link:translate-x-1" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
