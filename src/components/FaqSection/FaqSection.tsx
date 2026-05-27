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

      <div className="container px-global mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2
              className={cn(
                "text-5xl lg:text-7xl font-black tracking-tighter leading-none uppercase",
                isDark ? "text-white" : "text-foreground",
              )}
            >
              {data.title}
            </h2>
          </div>

          <div className="space-y-0">
            {data.faqs.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  "border-b",
                  isDark ? "border-white/10" : "border-foreground/5",
                )}
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="flex items-center justify-between w-full text-left py-7 md:py-8 gap-6 group"
                >
                  <span
                    className={cn(
                      "text-lg md:text-xl font-black leading-tight uppercase tracking-tight transition-colors duration-300",
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
                      "w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-all duration-300",
                      isDark
                        ? "bg-white/5 group-hover:bg-white/10"
                        : "bg-foreground/5 group-hover:bg-foreground/10",
                      openIndex === index &&
                        (isDark ? "bg-white/15" : "bg-foreground/10"),
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        isDark ? "text-white/40" : "text-foreground/30",
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
                    <div className="pb-8 pr-16">
                      <PortableText
                        value={faq.answer}
                        isBackgroundDark={isDark}
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
