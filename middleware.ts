import { rootDomain } from "@/lib/utils";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Define which routes are public (no authentication needed)
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/(.*)",
]);

// Extract subdomain from host
function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Local development
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) return fullUrlMatch[1];

    if (hostname.includes(".localhost")) return hostname.split(".")[0];

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(":")[0];

  // Handle Vercel preview format
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

// Middleware definition
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const subdomain = extractSubdomain(req);

  const isProtected = !isPublicRoute(req) || !!subdomain;

  if (isProtected) {
    await auth.protect();
  }

  // Don't rewrite internal assets or API routes
  const isInternalAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(.*)$/); // static files like .css, .js, etc.

  // Only rewrite if subdomain exists and it's not an internal asset
  if (subdomain && !isInternalAsset) {
    const rewrittenUrl = new URL(`/s/${subdomain}${pathname}`, req.url);
    return NextResponse.rewrite(rewrittenUrl);
  }

  // On root domain, serve as-is (e.g., domain.com/pricing)
  return NextResponse.next();
});

// Matcher configuration
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
