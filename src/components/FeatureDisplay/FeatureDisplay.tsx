import React from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { Button } from "@/shadcn/components/ui/button";
import { ItemsDisplayer } from "@/lib/utils/mappers";
import { Card } from "@/shadcn/components/ui/card";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { portableToText } from "@/lib/utils/text";

interface FeatureDisplayProps {
  cmsData: ItemsDisplayer;
  className?: string;
}

export const FeatureDisplay: React.FC<FeatureDisplayProps> = ({
  cmsData,
  className,
}) => {
  if (!cmsData.items || cmsData.items.length === 0) {
    return null;
  }

  return (
    <section className={`w-full py-24 ${className}`}>
      <div className="container mx-auto px-global mb-12 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-0 md:mb-12">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase leading-none">
              {cmsData.title}
            </h2>
          </div>
          <Link
            href={cmsData.moreInfoLink}
            className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all duration-300 group pb-2 border-b-2 border-transparent hover:border-primary"
          >
            {cmsData.moreInfoText}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8 md:mt-18">
          {cmsData.items.map((feature, index) => (
            <Link key={index} href={feature.buttonLink} passHref className="group">
              <Card className="relative flex flex-col h-[450px] border-none bg-white rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
                {/* Full Image Background Overlay Style */}
                <div className="absolute inset-0 z-0">
                  {feature.image && (
                    <Image
                      src={urlFor(feature.image).url()}
                      alt={feature.imageAlt}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172B]/90 via-[#0F172B]/20 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 mt-auto p-8 pb-0 flex flex-col">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-3xl font-black text-white leading-tight uppercase tracking-tight drop-shadow-lg group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <div className="bg-white/95 backdrop-blur-md p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <ArrowUpRight className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <div className="text-white/70 text-sm mb-6 line-clamp-3 leading-relaxed font-medium">
                    {portableToText(feature.description)}
                  </div>

                  <Button className="w-full font-black uppercase tracking-[0.2em] text-sm h-16 rounded-3xl bg-white text-primary hover:bg-white/90 shadow-xl">
                    {feature.buttonText}
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
