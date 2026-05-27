"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/shadcn/components/ui/button";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={className}
    >
      {!mounted ? (
        <Moon size={20} />
      ) : isDark ? (
        <Sun size={20} data-testid="sun-icon" />
      ) : (
        <Moon size={20} data-testid="moon-icon" />
      )}
    </Button>
  );
};
