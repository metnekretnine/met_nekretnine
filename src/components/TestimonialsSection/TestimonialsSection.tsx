"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Quote, Star, ChevronDown, ChevronUp } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/shadcn/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Testimonial {
  name: string;
  text: string;
  rating: number;
}

interface TestimonialsSectionProps {
  data: {
    title: string;
    showMoreLabel: string;
    showLessLabel: string;
    testimonials: Testimonial[];
  };
  className?: string;
}

const StarRating = memo(({ rating }: { rating: number }) => {
  const stars = rating || 5;
  return (
    <div className="flex gap-1.5 mb-8">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < stars ? "fill-amber-400 text-amber-400" : "text-foreground/10"
          }`}
        />
      ))}
    </div>
  );
});
StarRating.displayName = "StarRating";

const TestimonialCard = memo(
  ({
    testimonial,
    showMoreLabel,
    showLessLabel,
  }: {
    testimonial: Testimonial;
    showMoreLabel: string;
    showLessLabel: string;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
      const el = textRef.current;
      if (!el) return;

      let rafId: number;
      const checkTruncation = () => {
        rafId = requestAnimationFrame(() => {
          setIsTruncated(el.scrollHeight > el.clientHeight);
        });
      };

      checkTruncation();
      window.addEventListener("resize", checkTruncation);
      return () => {
        window.removeEventListener("resize", checkTruncation);
        cancelAnimationFrame(rafId);
      };
    }, [testimonial.text]);

    const toggleExpanded = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const initial = testimonial.name.charAt(0);

    return (
      <div className="h-full bg-white rounded-[2rem] border border-foreground/5 p-10 flex flex-col shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
        <StarRating rating={testimonial.rating} />

        <div className="flex-grow mb-6">
          <Quote className="w-9 h-9 text-foreground/25 mb-6" />
          <div className="relative">
            <p
              ref={textRef}
              className={`text-foreground/80 text-lg md:text-xl font-medium leading-relaxed transition-all duration-300 ${
                !isExpanded ? "line-clamp-[7]" : ""
              }`}
            >
              {testimonial.text}
            </p>
            {(isTruncated || isExpanded) && (
              <button
                onClick={toggleExpanded}
                className="mt-4 text-primary font-bold hover:underline flex items-center gap-1 group/btn"
              >
                {isExpanded ? (
                  <>
                    {showLessLabel}
                    <ChevronUp className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </>
                ) : (
                  <>
                    {showMoreLabel}
                    <ChevronDown className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-foreground/10 flex items-center gap-4 mt-auto">
          <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center text-foreground font-black text-lg shrink-0">
            {initial}
          </div>
          <p className="text-lg font-black text-foreground/60">
            {testimonial.name}
          </p>
        </div>
      </div>
    );
  },
);
TestimonialCard.displayName = "TestimonialCard";

export const TestimonialsSection = ({
  data,
  className,
}: TestimonialsSectionProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));

  const handleMouseEnter = useCallback(() => {
    plugin.current.stop();
  }, []);

  const handleMouseLeave = useCallback(() => {
    plugin.current.reset();
  }, []);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const carouselOpts = useMemo(
    () => ({ align: "start" as const, loop: true }),
    [],
  );

  const plugins = useMemo(() => [plugin.current], []);

  if (!data?.testimonials?.length) return null;

  return (
    <section className={`py-18 md:py-20 overflow-hidden ${className || ""}`}>
      <div className="container mx-auto px-global">
        <div className="max-w-2xl mb-16 md:mb-20">
          <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none uppercase">
            {data.title}
          </h2>
        </div>

        <div className="relative group/carousel px-0 md:px-12">
          <Carousel
            setApi={setApi}
            opts={carouselOpts}
            plugins={plugins}
            className="w-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <CarouselContent className="-ml-6 pt-2 pb-10">
              {data.testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="pl-6 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <TestimonialCard
                    testimonial={testimonial}
                    showMoreLabel={data.showMoreLabel}
                    showLessLabel={data.showLessLabel}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="flex -left-2 md:-left-4 lg:-left-6 h-10 w-10 md:h-12 md:w-12 border-none bg-white/60 backdrop-blur-sm hover:bg-white/90 text-primary shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-0 z-10 [&_svg]:h-6 [&_svg]:w-6" />
            <CarouselNext className="flex -right-2 md:-right-4 lg:-right-6 h-10 w-10 md:h-12 md:w-12 border-none bg-white/60 backdrop-blur-sm hover:bg-white/90 text-primary shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-0 z-10 [&_svg]:h-6 [&_svg]:w-6" />
          </Carousel>
        </div>

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
