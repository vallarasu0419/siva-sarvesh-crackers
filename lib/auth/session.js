import { ADMIN_COOKIE_NAME, ADMIN_SESSION_HOURS } from '../../constants/config.js';
import { verifySessionToken } from './token.js';
import { AppError } from '../api/errors.js';
import { query } from '../db/index.js';

/**
 * Browsers drop Secure cookies on plain http, so only mark the cookie Secure
 * when the request really came over https (directly or via the nginx proxy).
 */
function isHttpsRequest(req) {
  const forwardedProto = String(req?.headers?.['x-forwarded-proto'] || '').split(',')[0].trim();
  return forwardedProto === 'https' || Boolean(req?.socket?.encrypted);
}

function serializeCookie(value, maxAgeSeconds, secure) {
  const parts = [
    `${ADMIN_COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function setSessionCookie(req, res, token) {
  res.setHeader('Set-Cookie', serializeCookie(token, ADMIN_SESSION_HOURS * 3600, isHttpsRequest(req)));
}

export function clearSessionCookie(req, res) {
  res.setHeader('Set-Cookie', serializeCookie('', 0, isHttpsRequest(req)));
}

/** Reads and verifies the admin session from an API request. */
export async function getAdminFromRequest(req) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];
  const session = await verifySessionToken(token);
  if (!session) return null;
  // Make sure the admin still exists and is active.
  const [admin] = await query('SELECT id, name, email FROM admins WHERE id = ? AND is_active = 1', [session.id]);
  return admin || null;
}

/** Throws 401 unless the request carries a valid admin session. */
export async function requireAdmin(req) {
  const admin = await getAdminFromRequest(req);
  if (!admin) throw new AppError(401, 'Your session has expired. Please log in again.');
  return admin;
}
