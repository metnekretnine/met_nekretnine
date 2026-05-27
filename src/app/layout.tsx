import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { VisualEditing } from "next-sanity";
import { draftMode } from "next/headers";
import {
  CookieConsent,
  Footer,
  BackToTopButton,
  WhatsAppButton,
  HeaderWrapper,
} from "@/components";
import {
  fetchNavigationSectionCms,
  fetchFooterSectionCms,
  fetchCookieConsentSectionCms,
  fetchWhatsAppButtonSectionCms,
  fetchConfigurationSectionCms,
  fetchNotificationBarSectionCms,
} from "@/sanity/queries";
import { getLang } from "@/lib/utils";

import {
  GoogleAnalytics,
  MicrosoftClarityAnalytics,
  MetaPixelAnalytics,
  JsonLd,
} from "@/analytics";
import { Toaster } from "@/shadcn/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled } = await draftMode();
  const lang = await getLang();
  const [
    navigationCms,
    footerCms,
    cookieConsentCms,
    whatsAppButtonCms,
    configurationCms,
    notificationBarCms,
  ] = await Promise.all([
    fetchNavigationSectionCms(lang),
    fetchFooterSectionCms(lang),
    fetchCookieConsentSectionCms(lang),
    fetchWhatsAppButtonSectionCms(lang),
    fetchConfigurationSectionCms(lang),
    fetchNotificationBarSectionCms(lang),
  ]);

  const IS_MAINTENANCE_MODE =
    process.env.NEXT_PUBLIC_IS_MAINTENANCE_MODE === "true";

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <JsonLd lang={lang} />
      </head>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="light"
        >
          {IS_MAINTENANCE_MODE ? (
            <main>{children}</main>
          ) : (
            <>
              <HeaderWrapper
                navigationCms={navigationCms}
                notificationBarCms={notificationBarCms}
              />
              <main>{children}</main>
              <Footer cmsData={footerCms} />
              {process.env.NODE_ENV === "production" && (
                <>
                  <Analytics />
                  <GoogleAnalytics />
                  <MicrosoftClarityAnalytics />
                  <MetaPixelAnalytics />
                </>
              )}
              <WhatsAppButton
                cmsData={whatsAppButtonCms}
                isEnabled={configurationCms.isWhatsAppEnabled}
              />
              <CookieConsent cmsData={cookieConsentCms} />
              <BackToTopButton
                isEnabled={configurationCms.isBackToTopButtonEnabled}
              />
            </>
          )}

          {isEnabled && <VisualEditing />}

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
