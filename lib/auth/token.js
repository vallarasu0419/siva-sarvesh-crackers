import { SignJWT, jwtVerify } from 'jose';
import { ADMIN_SESSION_HOURS } from '../../constants/config.js';

/**
 * Signed session token (HS256 JWT). Works in both Node API routes and the
 * Edge middleware, so it only depends on `jose`.
 */
function getKey() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be set to a random string of at least 32 characters.');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(admin) {
  return new SignJWT({ name: admin.name, email: admin.email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(admin.id))
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_HOURS}h`)
    .sign(getKey());
}

/** Returns the session payload, or null when the token is missing/invalid/expired. */
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] });
    if (payload.role !== 'admin' || !payload.sub) return null;
    return { id: Number(payload.sub), name: payload.name, email: payload.email };
  } catch {
    return null;
  }
}
