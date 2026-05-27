"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/shadcn/components/ui/button";

interface BackToTopButtonProps {
  isEnabled: boolean;
}

export const BackToTopButton: React.FC<BackToTopButtonProps> = ({ isEnabled }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to a certain amount
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  if (!isVisible || !isEnabled) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-5 right-6 md:right-8 z-40 rounded-full shadow-lg size-12 bg-brand-primary text-white hover:bg-brand-primary/90 border border-white/30"
      aria-label="Scroll to top"
    >
      <ArrowUp className="size-6" />
    </Button>
  );
};
