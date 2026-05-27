"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, House } from "lucide-react";
import { HeroSectionCMS } from "@/sanity/queries/home";
import { urlFor } from "@/sanity/lib/image";

interface HeroSectionProps {
  cmsData: HeroSectionCMS;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ cmsData }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (cmsData.backgroundImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === cmsData.backgroundImages.length - 1 ? 0 : prev + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [cmsData.backgroundImages.length]);

  return (
    <section className="relative min-h-[105svh] sm:min-h-svh flex items-end lg:items-center overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0">
        {cmsData.videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={
              cmsData.backgroundImages[0]?.image
                ? urlFor(cmsData.backgroundImages[0].image)
                    .width(1920)
                    .quality(60)
                    .url()
                : undefined
            }
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={cmsData.videoUrl} type="video/mp4" />
          </video>
        ) : (
          cmsData.backgroundImages.map(
            (image, index) =>
              image.image && (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${
                    index === currentImageIndex
                      ? "opacity-100 scale-105"
                      : "opacity-0 scale-100"
                  }`}
                >
                  <Image
                    src={urlFor(image.image).url()}
                    alt={image.imageAlt || ""}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={index === 0}
                  />
                </div>
              ),
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-global pb-24 lg:pb-0 pt-32">
        <div className="max-w-4xl">
          {/* Badge */}
          {cmsData.badgeText && (
            <div className="mb-8">
              <span className="text-white/50 font-black uppercase tracking-[0.3em] text-xs">
                {cmsData.badgeText}
              </span>
            </div>
          )}

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-black text-white leading-none tracking-tighter uppercase">
            {cmsData.mainHeading}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/60 mt-8 mb-12 max-w-2xl leading-relaxed">
            {cmsData.subtitle}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {cmsData.primaryButton?.title && cmsData.primaryButton?.href && (
              <a
                href={cmsData.primaryButton.href}
                className="inline-flex items-center gap-3 bg-primary text-white text-sm px-10 py-5 font-black uppercase tracking-[0.15em] rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg"
              >
                {cmsData.primaryButton.title}
                <ArrowRight className="h-5 w-5" />
              </a>
            )}
            {cmsData.secondaryButton?.title && cmsData.secondaryButton?.href && (
              <a
                href={cmsData.secondaryButton.href}
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 text-sm px-10 py-5 font-black uppercase tracking-[0.15em] rounded-full hover:bg-white/20 transition-all duration-300"
              >
                <House className="h-4 w-4" />
                {cmsData.secondaryButton.title}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {!cmsData.videoUrl && cmsData.backgroundImages.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {cmsData.backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentImageIndex
                  ? "bg-white w-10"
                  : "bg-white/30 w-3 hover:bg-white/50"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
