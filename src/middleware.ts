import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that don't require authentication
const publicPaths = [
  "/login",
  "/register",
  "/auth",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

// Paths that require authentication but don't require a complete profile
const authNoProfilePaths = [
  "/complete-profile",
  "/api/profile",
];

// Cache configuration for different routes
const cacheConfig = {
  // Static assets
  static: "public, max-age=31536000, immutable", // 1 year
  // API responses
  api: "public, max-age=300, stale-while-revalidate=60", // 5 minutes
  // Dynamic pages
  dynamic: "public, max-age=0, must-revalidate", // No cache
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token and not a public path, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Set up the response
  const response = NextResponse.next();

  // Add cache headers based on route type
  if (pathname.startsWith("/api/")) {
    if (pathname.includes("profile")) {
      // Profile endpoints should not be cached by default
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate"
      );
    } else {
      // Other API endpoints can be cached
      response.headers.set("Cache-Control", cacheConfig.api);
    }
  } else if (pathname.startsWith("/_next/") || pathname.includes(".")) {
    // Static assets
    response.headers.set("Cache-Control", cacheConfig.static);
  } else {
    // Dynamic pages
    response.headers.set("Cache-Control", cacheConfig.dynamic);
  }

  // Check if profile is complete for protected routes
  if (!authNoProfilePaths.some((path) => pathname.startsWith(path))) {
    const isProfileComplete = token.isProfileComplete === true || 
      (token.profileProgress as number ?? 0) >= 80;

    if (!isProfileComplete) {
      return NextResponse.redirect(new URL("/complete-profile", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}; 