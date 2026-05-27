import {
  PortableText as PortableTextComponent,
  PortableTextComponentProps,
} from "@portabletext/react";
import type { PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/shadcn/lib/utils";
import Image from "next/image";
import React from "react";
import { PortableTextBlock, ArbitraryTypedObject } from "@portabletext/types";

interface PortableTextProps {
  value: PortableTextBlock[];
  isBackgroundDark?: boolean;
  textSize?: string;
}

export const PortableText = ({
  value,
  isBackgroundDark = false,
  textSize,
}: PortableTextProps) => {
  const textColor = isBackgroundDark ? "text-white/70" : "text-muted-foreground";
  const headingColor = isBackgroundDark ? "text-white" : "text-foreground";

  const components: PortableTextComponents = {
    types: {
      image: ({ value }: PortableTextComponentProps<ArbitraryTypedObject>) => {
        if (!value?.asset?._ref) return null;

        return (
          <figure className="my-10">
            <Image
              className="h-auto w-full rounded-lg object-cover"
              alt={value.alt || ""}
              loading="lazy"
              src={urlFor(value).width(800).url()}
              width={800}
              height={450}
            />
            {value.caption && (
              <figcaption
                className={`mt-4 text-center text-xs font-semibold uppercase tracking-[0.14em] ${
                  isBackgroundDark ? "text-white/40" : "text-foreground/30"
                }`}
              >
                {value.caption}
              </figcaption>
            )}
          </figure>
        );
      },
    },
    block: {
      h1: ({ children }) => (
        <h1
          className={`text-4xl font-semibold tracking-tight leading-tight md:text-5xl mt-16 mb-6 ${headingColor}`}
        >
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2
          className={`text-3xl font-semibold tracking-tight leading-tight md:text-4xl mt-14 mb-5 ${headingColor}`}
        >
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3
          className={`text-2xl font-semibold tracking-tight leading-tight md:text-3xl mt-10 mb-4 ${headingColor}`}
        >
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4
          className={`text-xl font-semibold tracking-tight leading-tight md:text-2xl mt-8 mb-3 ${headingColor}`}
        >
          {children}
        </h4>
      ),
      h5: ({ children }) => (
        <h5
          className={`text-lg font-semibold tracking-tight md:text-xl mt-6 mb-2 ${headingColor}`}
        >
          {children}
        </h5>
      ),
      h6: ({ children }) => (
        <h6
          className={`text-base font-semibold tracking-tight md:text-lg mt-6 mb-2 ${headingColor}`}
        >
          {children}
        </h6>
      ),
      normal: ({ children }) => (
        <p className={cn(
          textColor,
          "leading-relaxed my-4",
          textSize || "text-base md:text-lg"
        )}>
          {children}
        </p>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className={`list-disc pl-6 my-4 space-y-2 ${textColor}`}>
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className={`list-decimal pl-6 my-4 space-y-2 ${textColor}`}>
          {children}
        </ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => (
        <li className={cn(
          textColor,
          "leading-relaxed",
          textSize || "text-base md:text-lg"
        )}>
          {children}
        </li>
      ),
      number: ({ children }) => (
        <li className={cn(
          textColor,
          "leading-relaxed",
          textSize || "text-base md:text-lg"
        )}>
          {children}
        </li>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <strong className={`font-bold ${isBackgroundDark ? "text-white" : "text-foreground"}`}>
          {children}
        </strong>
      ),
      em: ({ children }) => <em className="italic">{children}</em>,
      link: ({ value, children }) => {
        const isInternal = value?.href?.startsWith("/");
        return (
          <a
            href={value?.href}
            className={`underline underline-offset-4 transition-colors duration-300 ${
              isBackgroundDark
                ? "decoration-white/30 hover:decoration-white text-white"
                : "decoration-primary/30 hover:decoration-primary text-primary"
            }`}
            target={isInternal ? "_self" : "_blank"}
            rel={isInternal ? undefined : "noopener noreferrer"}
          >
            {children}
          </a>
        );
      },
    },
  };

  return <PortableTextComponent value={value} components={components} />;
};
