"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shadcn/lib/utils";
import { PortableText } from "@/components";
import { PortableTextBlock } from "@portabletext/types";

interface FaqItem {
  question: string;
  answer: PortableTextBlock[];
}

export interface FaqSectionCMS {
  title: string;
  faqs: FaqItem[];
}

interface FaqSectionProps {
  data: FaqSectionCMS;
  isBackgroundDark?: boolean;
  className?: string;
}

function richTextToPlainText(blocks: PortableTextBlock[]) {
  return blocks
    .map((block) =>
      block.children
        ?.map((child) => ("text" in child ? child.text : ""))
        .join(""),
    )
    .filter(Boolean)
    .join("\n\n");
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  data,
  isBackgroundDark = false,
  className,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity:
      data.faqs?.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: richTextToPlainText(faq.answer),
        },
      })) || [],
  };

  if (!data.faqs || data.faqs.length === 0) return null;

  const isDark = isBackgroundDark;

  return (
    <section className={cn(isDark ? "bg-foreground" : "", className)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container mx-auto px-global">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <div>
            <h2
              className={cn(
                "text-3xl font-semibold tracking-tight md:text-5xl",
                isDark ? "text-white" : "text-foreground",
              )}
            >
              {data.title}
            </h2>
          </div>

          <div
            className={cn(
              "border-t",
              isDark ? "border-white/10" : "border-foreground/10",
            )}
          >
            {data.faqs.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  "border-b",
                  isDark ? "border-white/10" : "border-foreground/10",
                )}
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
                >
                  <span
                    className={cn(
                      "text-base font-semibold leading-tight tracking-tight transition-colors duration-300 md:text-lg",
                      isDark
                        ? "text-white/70 group-hover:text-white"
                        : "text-foreground/70 group-hover:text-foreground",
                      openIndex === index &&
                        (isDark ? "text-white" : "text-foreground"),
                    )}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center transition-colors duration-300",
                      isDark
                        ? "text-white/50 group-hover:text-white/80"
                        : "text-foreground/45 group-hover:text-foreground/70",
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        openIndex === index && "rotate-180",
                      )}
                    />
                  </div>
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    openIndex === index
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="pb-7 pr-12 md:pr-16">
                      <PortableText
                        value={faq.answer}
                        isBackgroundDark={isDark}
                        textSize="text-base md:text-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
