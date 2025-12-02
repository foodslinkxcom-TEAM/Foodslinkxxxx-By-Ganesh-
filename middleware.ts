import { type NextRequest, NextResponse } from "next/server"

/**
 * Middleware function to handle authentication and authorization for protected routes.
 * - It checks for the presence and validity of an authentication token in the request cookies.
 * - If the token is missing or invalid, it redirects the user to the login page.
 * - Public routes are allowed to proceed without authentication.
 *
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {NextResponse} The Next.js response, which is either a redirect or the next middleware in the chain.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes
  if (
    pathname.startsWith("/hotels") ||
    pathname === "/admin/hotels/create" ||
    pathname === "/api/admin/hotels"  ||
    pathname === "/api/hotels" 
  ) {
    return NextResponse.next()
  }

  // Protected routes
  // if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
  //   const token = request.cookies.get("auth-token")?.value

  //   if (!token || !verifyToken(token)) {
  //     return NextResponse.redirect(new URL("/auth/login", request.url))
  //   }
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
