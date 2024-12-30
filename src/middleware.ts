import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { redis } from "./lib/redis";

// Define public paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/reset-password",
  "/api/auth/verify-otp",
];

// Cache session data for 5 minutes
const SESSION_CACHE_TIME = 300;

interface SessionData {
  sub: string;
  role?: string;
  email?: string;
  name?: string;
  iat: number;
  exp: number;
  jti: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for API routes that don't need token verification
  if (pathname.startsWith("/api/") && publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    // Try to get cached session first
    const sessionKey = `session:${request.cookies.get("next-auth.session-token")?.value}`;
    let session = await redis.get<SessionData>(sessionKey);

    if (!session) {
      // If no cached session, verify JWT token
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      session = token as SessionData;
      // Cache the session
      await redis.set(sessionKey, session, {
        ex: SESSION_CACHE_TIME,
      });
    }

    // Clone the request headers and add user info
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.sub);
    requestHeaders.set("x-user-role", session.role ?? "user");

    // Return response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 