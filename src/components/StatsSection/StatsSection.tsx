"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";
import { StatsSectionCMS, StatItemCMS } from "@/sanity/queries/statsSection";

const StatItem = ({ value, label, suffix = "" }: StatItemCMS) => {
  const [displayValue, setDisplayValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const hasMounted = useRef(false);

  const decimals = value % 1 === 0 ? 0 : value.toString().split(".")[1].length;

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setDisplayValue(0);
    }
  }, []);

  useEffect(() => {
    if (!isInView || hasAnimated) return;

    let startTime: number | null = null;
    const duration = 2000;

    const easeOutExpo = (x: number): number =>
      x === 1 ? 1 : 1 - Math.pow(2, -10 * x);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(easeOutExpo(progress) * value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        setHasAnimated(true);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, hasAnimated]);

  const formatNumber = (num: number) =>
    num.toLocaleString("hr-HR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-black text-foreground tracking-tighter leading-none mb-3">
        {formatNumber(displayValue)}
        <span className="text-primary">{suffix}</span>
      </div>
      <div className="text-[10px] md:text-xs font-black text-foreground/30 uppercase tracking-[0.25em]">
        {label}
      </div>
    </div>
  );
};

interface StatsSectionProps {
  cmsData: StatsSectionCMS;
  className?: string;
}

export const StatsSection = ({ cmsData, className }: StatsSectionProps) => {
  if (!cmsData.stats || cmsData.stats.length === 0) return null;

  return (
    <section className={`py-24 md:py-32 ${className}`}>
      <div className="container mx-auto px-global">
        {cmsData.title && (
          <div className="mb-12 max-w-3xl">
            <h2 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter uppercase leading-none">
              {cmsData.title}
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 sm:gap-y-16 gap-x-8">
          {cmsData.stats.map((stat, index) => (
            <StatItem key={index} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};
