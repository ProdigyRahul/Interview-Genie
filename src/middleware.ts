import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Protect verify-otp route
  if (path === "/verify-otp") {
    const userId = request.nextUrl.searchParams.get("userId");
    const referer = request.headers.get("referer");
    
    // Check if coming from signup and has userId
    if (!userId || !referer?.includes("/signup")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/verify-otp"],
}; 