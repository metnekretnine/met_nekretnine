"use client";

import React from "react";
import { cn } from "@/shadcn/lib/utils";
import { HowWeDoItSectionCMS } from "@/sanity/schemaTypes/howWeDoItSection";

interface HowWeDoItSectionProps {
  data: HowWeDoItSectionCMS;
  isBackgroundDark?: boolean;
  className?: string;
  rightElement?: React.ReactNode;
}

export const HowWeDoItSection: React.FC<HowWeDoItSectionProps> = ({
  data,
  isBackgroundDark = false,
  className,
  rightElement,
}) => {
  if (!data?.steps || data.steps.length === 0) return null;

  return (
    <section
      className={cn(
        "py-24 md:py-32 overflow-hidden relative",
        isBackgroundDark
          ? "bg-brand-primary text-white"
          : "bg-background text-foreground",
        className,
      )}
    >
      {/* Background element */}
      {rightElement && (
        <div className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-[90%] h-[75%] items-center justify-end pointer-events-none select-none overflow-hidden">
          <div
            className={cn(
              "w-full h-full flex items-center justify-end translate-x-1/2",
              isBackgroundDark
                ? "text-white opacity-80"
                : "text-primary opacity-80",
            )}
          >
            <div className="w-full h-full flex items-center justify-end">
              {rightElement}
            </div>
          </div>
        </div>
      )}

      <div className="container px-global mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 md:mb-24 max-w-3xl">
          <h2
            className={cn(
              "text-5xl lg:text-7xl font-black tracking-tighter leading-none uppercase",
              isBackgroundDark ? "text-white" : "text-foreground",
            )}
          >
            {data.title}
          </h2>
        </div>

        {/* Steps */}
        <div className="max-w-3xl">
          {data.steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "relative flex gap-8 md:gap-12 items-start group",
                index !== data.steps.length - 1 && "pb-12 md:pb-16",
              )}
            >
              {/* Line + Number */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-14 h-14 rounded-full font-black text-lg transition-transform duration-300 group-hover:scale-110",
                    isBackgroundDark
                      ? "bg-white text-brand-primary"
                      : "bg-foreground text-white",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                {index !== data.steps.length - 1 && (
                  <div
                    className={cn(
                      "w-px flex-1 mt-4",
                      isBackgroundDark ? "bg-white/15" : "bg-foreground/10",
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col pt-3 pb-2">
                <h3
                  className={cn(
                    "text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-4",
                    isBackgroundDark ? "text-white" : "text-foreground",
                  )}
                >
                  {step.title}
                </h3>
                <p
                  className={cn(
                    "text-base md:text-lg leading-relaxed max-w-lg",
                    isBackgroundDark
                      ? "text-white/60"
                      : "text-muted-foreground",
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
