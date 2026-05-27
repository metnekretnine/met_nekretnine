import React from "react";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { CtaSectionCMS } from "@/sanity/queries";
import { cn } from "@/shadcn/lib/utils";

interface CTASectionProps {
  cmsData: CtaSectionCMS;
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  cmsData,
  className,
}) => {
  return (
    <section className={cn("bg-[#dfe7ee] py-20 md:py-24", className)}>
      <div className="container mx-auto px-global">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-center">
          <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            {cmsData.title}
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={cmsData.phoneHref}
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-foreground px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white sm:w-auto"
            >
              <Phone className="h-4 w-4" />
              {cmsData.phoneText}
            </Link>
            <Link
              href={cmsData.whatsappHref}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-foreground/20 px-6 text-sm font-semibold uppercase tracking-[0.14em] text-foreground sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              {cmsData.whatsappText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
