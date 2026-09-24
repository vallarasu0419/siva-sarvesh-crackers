import { AppError } from '../api/errors.js';

/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for a single-server deployment (one EC2 instance).
 * For multiple servers, move this to Redis or the database.
 */
const buckets = globalThis.__sscRateLimits || (globalThis.__sscRateLimits = new Map());

export function rateLimit({ key, limit, windowMs }) {
  const now = Date.now();
  const timestamps = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) {
    const retryAfter = Math.ceil((windowMs - (now - timestamps[0])) / 1000);
    buckets.set(key, timestamps);
    throw new AppError(429, 'Too many requests. Please wait a moment and try again.', { retryAfter });
  }
  timestamps.push(now);
  buckets.set(key, timestamps);

  // Occasional cleanup so the map does not grow forever.
  if (buckets.size > 5000) {
    for (const [bucketKey, times] of buckets) {
      if (!times.some((t) => now - t < windowMs)) buckets.delete(bucketKey);
    }
  }
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}
