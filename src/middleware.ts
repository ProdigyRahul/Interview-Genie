import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that don't require authentication
const publicPaths = [
  "/",
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
  "/api/trpc",
  "/api/auth/callback",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth callback routes and static assets
  if (
    pathname.startsWith('/api/auth/callback/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Handle auth redirects
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    const callbackUrl = request.nextUrl.pathname + request.nextUrl.search;
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and trying to access login/register pages
  if (token && (pathname === '/login' || pathname === '/register')) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl && !callbackUrl.includes('/login')) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Set up the response
  const response = NextResponse.next();

  // Add cache control headers
  if (pathname.startsWith("/api/")) {
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
  }

  // Check if profile is complete for protected routes
  if (
    token && 
    !authNoProfilePaths.some((path) => pathname.startsWith(path))
  ) {
    const isProfileComplete = token.isProfileComplete === true || 
      (token.profileProgress as number ?? 0) >= 80;

    if (!isProfileComplete) {
      const url = new URL("/complete-profile", request.url);
      const currentUrl = request.nextUrl.pathname + request.nextUrl.search;
      url.searchParams.set("callbackUrl", currentUrl);
      return NextResponse.redirect(url);
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