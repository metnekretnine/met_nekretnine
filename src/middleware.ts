import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent } from "next/server";
import { clerkConfigured, isolatedAuthTest } from "./lib/epotpis/auth-config";
import { NextResponse } from "next/server";
import { WEBSITE_ORIGIN, internalContractPath, isContractsHost, isContractPath } from "./lib/epotpis/routes";
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

function getLocaleFromRequest(request: NextRequest): Language["id"] {
  const locale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (
    locale &&
    SUPPORTED_LANGUAGES.map((lang) => lang.id).includes(
      locale as Language["id"],
    )
  ) {
    return locale as Language["id"];
  }

  // Keep canonical URLs stable for crawlers and anonymous visitors.
  return DEFAULT_LANGUAGE.id;
}

function siteMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const dedicated = isContractsHost(request.headers.get("host") || request.nextUrl.host);
  const contractPath = dedicated ? internalContractPath(pathname) : null;

  if (dedicated) {
    if (pathname === "/robots.txt") return new NextResponse("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex, nofollow, noarchive" } });
    if (pathname === "/sitemap.xml" || (pathname.startsWith("/api/") && !pathname.startsWith("/api/ugovori/"))) return new NextResponse(null, { status: 404 });
    const infrastructure = /^\/(?:api\/ugovori(?:\/|$)|_next(?:\/|$)|__clerk(?:\/|$)|epotpis(?:\/|$)|assets(?:\/|$)|manifest\.webmanifest$|favicon\.ico$|icon[^/]*$|apple-icon[^/]*$)/.test(pathname);
    if (!contractPath && !infrastructure) {
      const destination = new URL(WEBSITE_ORIGIN); destination.pathname = pathname; destination.search = request.nextUrl.search;
      return NextResponse.redirect(destination, 307);
    }
  }

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
  const isContracts = Boolean(contractPath) || isContractPath(pathname);
  requestHeaders.set("x-met-contracts", isContracts ? "1" : "0");
  if (contractPath) {
    const destination = request.nextUrl.clone(); destination.pathname = contractPath;
    return NextResponse.rewrite(destination, { request: { headers: requestHeaders } });
  }
  if (isContracts) return NextResponse.next({ request: { headers: requestHeaders } });

  //In development turn off maintenance mode manually
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE_MODE === "true") {
    if (pathname !== UNDER_MAINTENANCE_LINK) {
      return NextResponse.rewrite(
        new URL(UNDER_MAINTENANCE_LINK, request.url),
        {
          status: 503,
          headers: {
            [X_NEXT_LOCALE_HEADER]: locale,
            "Content-Language": locale,
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
  response.headers.set("Content-Language", locale);

  const cookieConsent = request.cookies.get(COOKIE_CONSENT_NAME);

  if (cookieConsent?.value === "false") {
    response.cookies.delete("_ga");
    response.cookies.delete("_gid");
    response.cookies.delete("_gat");
  }

  return response;
}

const withClerk = clerkMiddleware((_auth, request) => siteMiddleware(request));
export function middleware(request: NextRequest, event: NextFetchEvent) {
  const host = request.headers.get("host") || request.nextUrl.host;
  const dedicated = isContractsHost(host);
  const pathname = request.nextUrl.pathname;
  // /ugovori is an internal route prefix; public production URLs use the subdomain.
  if (isContractPath(pathname) && (dedicated || ["metnekretnine.hr", "www.metnekretnine.hr"].includes(host.toLowerCase()))) {
    return new NextResponse(null, { status: 404 });
  }
  const path = (dedicated && internalContractPath(pathname)) || pathname;
  const isAdmin = (path === "/ugovori" || path.startsWith("/ugovori/"))
    && path !== "/ugovori/potpis" && !path.startsWith("/ugovori/potpis/");
  const isPrivateApi = path.startsWith("/api/ugovori/") && !path.startsWith("/api/ugovori/sign/");
  const isClerk = path === "/__clerk" || path.startsWith("/__clerk/");
  if ((isAdmin || isPrivateApi || isClerk) && clerkConfigured() && !isolatedAuthTest()) {
    return withClerk(request, event);
  }
  return siteMiddleware(request);
}

export const config = {
  matcher: [
    { source: "/:path*", has: [{ type: "host", value: "ugovori\\.metnekretnine\\.hr(:\\d+)?" }] },
    { source: "/:path*", has: [{ type: "host", value: "ugovori\\.localhost(:\\d+)?" }] },
    "/api/ugovori/:path*",
    "/((?!api|_next/static|_next/image|assets|favicon.ico|icon.*|apple-icon.*|site.webmanifest|sw.js|admin).*)",
  ],
};
