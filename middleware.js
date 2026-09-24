import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from './constants/config.js';
import { verifySessionToken } from './lib/auth/token.js';
import { getAdminRedirect } from './lib/auth/routes.js';

/**
 * Server-side protection for every /admin page.
 * API routes check the session themselves with requireAdmin().
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
  const redirectTo = getAdminRedirect(pathname, Boolean(session));

  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
