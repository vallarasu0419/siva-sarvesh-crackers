import { createHmac, randomInt, randomBytes, timingSafeEqual } from 'node:crypto';
import { OTP_LENGTH, OTP_MAX_VERIFY_ATTEMPTS } from '../../constants/config.js';

/**
 * Pure OTP helpers (no database). Covered by tests/otp.test.js.
 */

function secret() {
  const value = process.env.OTP_SECRET || process.env.AUTH_SECRET;
  if (!value) throw new Error('OTP_SECRET (or AUTH_SECRET) must be configured.');
  return value;
}

/** Cryptographically secure numeric OTP, e.g. "048213". */
export function generateOtp(length = OTP_LENGTH) {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, '0');
}

/** HMAC-SHA256 of email + OTP - the raw OTP is never stored. */
export function hashOtp(email, otp) {
  return createHmac('sha256', secret()).update(`${email}:${otp}`).digest('hex');
}

export function generateVerificationToken() {
  return randomBytes(32).toString('hex');
}

export function hashToken(token) {
  return createHmac('sha256', secret()).update(`token:${token}`).digest('hex');
}

function safeEqualHex(a, b) {
  const left = Buffer.from(String(a), 'hex');
  const right = Buffer.from(String(b), 'hex');
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}

/**
 * Decides whether an OTP attempt succeeds.
 * record: { email, otp_hash, expires_at, attempt_count, verified_at }
 * Returns { ok: true } or { ok: false, reason: 'NOT_FOUND' | 'ALREADY_USED' | 'EXPIRED' | 'TOO_MANY_ATTEMPTS' | 'INVALID' }
 */
export function checkOtp(record, otp, now = new Date()) {
  if (!record) return { ok: false, reason: 'NOT_FOUND' };
  if (record.verified_at) return { ok: false, reason: 'ALREADY_USED' };
  if (new Date(record.expires_at).getTime() <= now.getTime()) return { ok: false, reason: 'EXPIRED' };
  if (record.attempt_count >= OTP_MAX_VERIFY_ATTEMPTS) return { ok: false, reason: 'TOO_MANY_ATTEMPTS' };
  if (!/^\d+$/.test(String(otp || ''))) return { ok: false, reason: 'INVALID' };
  const matches = safeEqualHex(hashOtp(record.email, String(otp)), record.otp_hash);
  return matches ? { ok: true } : { ok: false, reason: 'INVALID' };
}

export const OTP_ERROR_MESSAGES = {
  NOT_FOUND: 'No active OTP found. Request a new OTP.',
  ALREADY_USED: 'This OTP has already been used. Request a new OTP.',
  EXPIRED: 'Invalid or expired OTP. Request a new OTP.',
  TOO_MANY_ATTEMPTS: 'Too many incorrect attempts. Request a new OTP.',
  INVALID: 'Invalid or expired OTP.',
};
