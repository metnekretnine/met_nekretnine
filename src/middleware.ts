import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_CONSENT_NAME,
  Language,
  LOCALE_COOKIE_NAME,
  X_NEXT_LOCALE_HEADER,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  UNDER_MAINTENANCE_LINK,
} from "./lib/constants";

function getLocaleFromRequest(request: NextRequest): string {
  const locale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (
    locale &&
    SUPPORTED_LANGUAGES.map((lang) => lang.id).includes(
      locale as Language["id"],
    )
  ) {
    return locale;
  }

  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    "";

  if (country && country.toUpperCase() !== "HR") {
    return "en";
  }

  return DEFAULT_LANGUAGE.id;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isStaticAsset =
    /\/((api|_next\/static|_next\/image|assets|favicon\.ico|icon.*\.(svg|png|ico)|apple-icon\.png|site\.webmanifest|sw\.js).*)/.test(
      pathname,
    );

  if (isStaticAsset) {
    return NextResponse.next();
  }

  const locale = getLocaleFromRequest(request);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(X_NEXT_LOCALE_HEADER, locale);

  //In development turn off maintenance mode manually
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE_MODE === "true") {
    if (pathname !== UNDER_MAINTENANCE_LINK) {
      return NextResponse.rewrite(
        new URL(UNDER_MAINTENANCE_LINK, request.url),
        {
          status: 503,
          headers: {
            [X_NEXT_LOCALE_HEADER]: locale,
            "Retry-After": "21600", // Google crawler can retry after 6 hours
          },
        },
      );
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const cookieConsent = request.cookies.get(COOKIE_CONSENT_NAME);

  if (cookieConsent?.value === "false") {
    response.cookies.delete("_ga");
    response.cookies.delete("_gid");
    response.cookies.delete("_gat");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|icon.*|apple-icon.*|site.webmanifest|sw.js|admin).*)",
  ],
};
