import React from "react";
import Image from "next/image";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlFor } from "@/sanity/lib/image";
import { PhotoCredit } from "@/components/PhotoCredit/PhotoCredit";

interface SubPageHeroProps {
  title: string;
  description?: string;
  backgroundImage: SanityImageSource;
  imageAlt?: string;
  className?: string;
}

export const SubPageHero: React.FC<SubPageHeroProps> = ({
  title,
  description,
  backgroundImage,
  imageAlt,
  className,
}) => {
  return (
    <>
      <section
        className={`relative min-h-[50dvh] mt-14 md:mt-20 md:min-h-[58dvh] lg:min-h-[62dvh] flex items-end overflow-hidden ${className}`}
      >
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src={urlFor(backgroundImage).url()}
            alt={imageAlt || title}
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10" />
        </div>

        {/* Content */}
        <div className="container relative z-20 mx-auto px-global pb-16 pt-32 md:pb-24">
          <div>
            <h1 className="max-w-5xl text-5xl font-semibold uppercase leading-none tracking-tight text-white md:text-7xl lg:text-8xl">
              {title}
            </h1>
            {description && (
              <p className="mt-6 text-2xl font-medium text-white/86 md:text-3xl">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>
      <PhotoCredit />
    </>
  );
};
