/**
 * CSRF protection for cookie-authenticated requests: state-changing
 * requests must come from our own origin. Combined with SameSite=Strict
 * cookies this blocks cross-site form/fetch submissions.
 */
export function isSameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!origin) {
    // Non-browser clients (curl, server-to-server) send no Origin header.
    // Browsers always send Origin on cross-site POST, so absence is safe.
    return true;
  }
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
