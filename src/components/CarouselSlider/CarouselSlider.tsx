"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { portableToText } from "@/lib/utils/text";
import { ItemsDisplayer } from "@/lib/utils/mappers";
import { Card } from "@/shadcn/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/shadcn/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface CarouselSliderProps {
  cmsData: ItemsDisplayer;
  className?: string;
}

export const CarouselSlider: React.FC<CarouselSliderProps> = ({
  cmsData,
  className,
}) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: false })
  );

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (!cmsData.items || cmsData.items.length === 0) return null;

  return (
    <section className={`w-full py-24 overflow-hidden ${className}`}>
      <div className="container mx-auto px-global">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-8 md:mb-16">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase leading-none">
              {cmsData.title}
            </h2>
          </div>

          <Link
            href={cmsData.moreInfoLink}
            className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all duration-300 group pb-2 border-b-2 border-transparent hover:border-primary shrink-0"
          >
            {cmsData.moreInfoText}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative group/carousel px-0 md:px-12">
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true }}
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent className="-ml-6 pt-2 pb-10">
              {cmsData.items.map((item, index) => (
                <CarouselItem
                  key={index}
                  className="pl-6 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <Link
                    href={item.buttonLink}
                    className="group h-full block"
                  >
                    <Card className="flex flex-col border-none bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 h-full p-0 gap-0">
                      {/* Image */}
                      <div className="relative h-[300px] shrink-0 w-full overflow-hidden">
                        {item.image && (
                          <Image
                            src={urlFor(item.image).url()}
                            alt={item.imageAlt}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                        {/* Status Overlay */}
                        {item.status && item.status !== "active" && (
                          <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="bg-white/95 px-6 py-2 rounded-full shadow-2xl border-2 border-primary/20 -translate-y-8">
                              <span className="text-lg font-black text-foreground uppercase tracking-wider">
                                {item.status === "rented"
                                  ? cmsData.rentedLabel
                                  : cmsData.soldLabel}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="px-8 py-7 flex flex-col flex-grow bg-white">
                        <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors duration-300 leading-tight uppercase mb-3">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-2">
                            {portableToText(item.description)}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-5 border-t border-foreground/5 mt-auto">
                          <span className="text-foreground/40 group-hover:text-primary text-[10px] font-black uppercase tracking-widest transition-colors duration-300">
                            {item.buttonText}
                          </span>
                          <ArrowRight className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation arrows on sides */}
            <CarouselPrevious className="flex left-4 md:-left-4 lg:-left-6 h-10 w-10 md:h-12 md:w-12 border-none bg-white/60 backdrop-blur-sm hover:bg-white/90 text-primary shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-0 z-10 [&_svg]:h-6 [&_svg]:w-6" />
            <CarouselNext className="flex right-4 md:-right-4 lg:-right-6 h-10 w-10 md:h-12 md:w-12 border-none bg-white/60 backdrop-blur-sm hover:bg-white/90 text-primary shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-0 z-10 [&_svg]:h-6 [&_svg]:w-6" />
          </Carousel>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-2">
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === current
                  ? "bg-primary w-10"
                  : "bg-foreground/10 w-3 hover:bg-foreground/20"
              }`}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
