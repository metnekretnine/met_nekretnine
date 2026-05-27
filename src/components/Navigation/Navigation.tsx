"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, XIcon } from "lucide-react";
import { LanguageSwitcher } from "@/components";
import { LogoCompany } from "../Icons/LogoCompany";
import * as React from "react";
import { useState, useCallback } from "react";
import { useScrollDetection } from "@/hooks";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/shadcn/components/ui/navigation-menu";
import { Button } from "@/shadcn/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/shadcn/components/ui/sheet";
import { NavigationSectionCMS } from "@/sanity/queries";

const ROUTES_WITH_HERO = ["/"];

interface NavigationProps {
  cmsData: NavigationSectionCMS;
}

export const Navigation: React.FC<NavigationProps> = React.memo(
  ({ cmsData }) => {
    const pathname = usePathname();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const isScrolled = useScrollDetection();

    const hasScrollEffect =
      ROUTES_WITH_HERO.includes(pathname) && !isScrolled && !isSheetOpen;

    const isActiveLink = useCallback(
      (href: string) => {
        return href === pathname || pathname.startsWith(`${href}/`);
      },
      [pathname],
    );

    const textColorClass = hasScrollEffect ? "text-white" : "text-foreground";
    
    return (
      <header
        className={`h-20 md:h-28 fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out flex items-center ${
          hasScrollEffect
            ? "bg-transparent border-b-transparent text-white"
            : "bg-white/90 backdrop-blur-xl border-b border-primary/5 text-foreground shadow-sm"
        }`}
      >
        <nav
          className={`container mx-auto flex justify-between items-center px-6`}
        >
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <LogoCompany
              primaryColor={hasScrollEffect ? "white" : "#101114"}
              className="h-[34px] w-[94px] md:h-[46px] md:w-[128px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="lg:gap-0 xl:gap-2">
              {cmsData.links.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className={`lg:px-3 xl:px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 rounded-full relative group ${
                        isActiveLink(item.href)
                          ? hasScrollEffect ? "text-white" : "text-primary"
                          : textColorClass + " opacity-70 hover:opacity-100"
                      }`}
                    >
                      {item.title}
                      {isActiveLink(item.href) && (
                        <span
                          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${
                            hasScrollEffect ? "bg-white" : "bg-primary"
                          }`}
                        ></span>
                      )}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="hidden lg:gap-x-4 xl:gap-x-8 lg:flex items-center">
            {cmsData.ctaButton && (
              <Link href={cmsData.ctaButton.href}>
                <Button
                  size="sm"
                  className={`text-xs font-semibold uppercase tracking-[0.12em] px-5 py-5 transition-all duration-500 shadow-none ${
                    hasScrollEffect
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-white hover:bg-primary/90"
                  }`}
                >
                  {cmsData.ctaButton.title}
                </Button>
              </Link>
            )}
            <div className="flex items-center">
              <LanguageSwitcher className={textColorClass + " font-bold opacity-70 hover:opacity-100 transition-opacity"} />
            </div>
          </div>

          {/* Mobile Navigation drawer */}
          <div className="lg:hidden flex items-center gap-x-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={textColorClass}>
                  <Menu className="size-8" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full bg-white flex flex-col items-center justify-center"
                isBackgroundBlurred={true}
                hasClose={false}
              >
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Mobile navigation
                </SheetDescription>

                {/* Close button — matches hamburger position (h-24 header, px-6 padding) */}
                <button
                  onClick={() => setIsSheetOpen(false)}
                  className="absolute top-0 right-1 h-20 md:h-28 px-6 flex items-center text-foreground hover:scale-110 transition-transform"
                  aria-label="Close menu"
                >
                  <XIcon className="size-8" />
                </button>

                <nav className="flex flex-col items-center gap-8 mt-12">
                  {cmsData.links.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-2xl font-semibold uppercase tracking-tight transition-all hover:scale-105 active:scale-95 ${
                        isActiveLink(item.href) ? "text-primary" : "text-foreground opacity-60 hover:opacity-100"
                      }`}
                      onClick={() => setIsSheetOpen(false)}
                    >
                      {item.title}
                    </Link>
                  ))}
                  {cmsData.ctaButton && (
                    <Link href={cmsData.ctaButton.href} className="mt-6 w-full max-w-xs px-2">
                      <Button
                        className="bg-primary text-white text-lg py-7 w-full font-semibold uppercase tracking-widest rounded-2xl shadow-none hover:scale-105 active:scale-95 transition-transform"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        {cmsData.ctaButton.title}
                      </Button>
                    </Link>
                  )}
                  <LanguageSwitcher />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>
    );
  },
);

Navigation.displayName = "Navigation";
