import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

const protectedRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  addSecurityHeaders(response);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return response;
  }

  const hasSessionCookie = AUTH_COOKIE_NAMES.some((cookieName) =>
    request.cookies.has(cookieName)
  );

  if (!hasSessionCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Run middleware on all pages except:
     * - API routes
     * - Next.js internal files
     * - static assets
     * - favicon
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};