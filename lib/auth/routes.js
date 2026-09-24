/**
 * Decides where an admin page request should go.
 * Returns a redirect path, or null to let the request continue.
 * Used by middleware.js and covered by tests/auth.test.js.
 */
export function getAdminRedirect(pathname, isAuthenticated) {
  if (!pathname.startsWith('/admin')) return null;
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) return isAuthenticated ? '/admin/dashboard' : null;
  if (!isAuthenticated) return `/admin/login?next=${encodeURIComponent(pathname)}`;
  if (pathname === '/admin' || pathname === '/admin/') return '/admin/dashboard';
  return null;
}
