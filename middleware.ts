import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if the user is authenticated and requesting a protected route

    const isAuthenticated = !!token;

    const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");

    const isApiRoute = request.nextUrl.pathname.startsWith("/api");

    const isPublicRoute = request.nextUrl.pathname === "/";

    // Allow access to public routes regardless of authentication

    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users trying to access protected routes

    if (!isAuthenticated && !isAuthRoute && !isApiRoute) {
      const signInUrl = new URL("/auth/signin", request.url);

      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

      return NextResponse.redirect(signInUrl);
    }

    // Redirect authenticated users away from auth pages

    if (isAuthenticated && isAuthRoute) {
      return NextResponse.redirect(new URL("/papers", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*

     * Match all request paths except:

     * - _next/static (static files)

     * - _next/image (image optimization files)

     * - favicon.ico (favicon file)

     * - public folder (public assets)

     * - api/auth routes (auth API)

     */

    "/((?!_next/static|_next/image|favicon.svg|public|api/auth).*)",
  ],
};
