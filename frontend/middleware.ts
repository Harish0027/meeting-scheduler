import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("authToken")?.value;
  const pathname = request.nextUrl.pathname;

  // Public routes (no auth required)
  const publicRoutes = ["/", "/[username]", "/login"];
  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.match(new RegExp(`^/${route.replace(/\[.*\]/, "[^/]+")}`))
  );

  // Protected app routes
  const protectedRoutes = [
    "/dashboard",
    "/event-types",
    "/bookings",
    "/availability",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If accessing protected route without auth, redirect to home
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If accessing home page with auth, redirect to dashboard
  if (pathname === "/" && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
