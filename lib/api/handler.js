import { AppError } from './errors.js';
import { isSameOrigin } from '../security/origin.js';

/**
 * Wraps a Pages Router API handler with:
 *  - allowed method check
 *  - same-origin (CSRF) check for state-changing requests
 *  - consistent JSON error responses (internal errors never leak details)
 *
 * handlers: { GET: fn, POST: fn, PATCH: fn, ... }
 */
export function apiHandler(handlers) {
  return async function handler(req, res) {
    const method = req.method || 'GET';
    const fn = handlers[method];
    res.setHeader('Cache-Control', 'no-store');

    if (!fn) {
      res.setHeader('Allow', Object.keys(handlers).join(', '));
      return res.status(405).json({ error: 'Method not allowed.' });
    }
    if (method !== 'GET' && method !== 'HEAD' && !isSameOrigin(req)) {
      return res.status(403).json({ error: 'Request blocked. Reload the page and try again.' });
    }

    try {
      return await fn(req, res);
    } catch (error) {
      if (error instanceof AppError) {
        if (error.details?.retryAfter) res.setHeader('Retry-After', String(error.details.retryAfter));
        return res.status(error.status).json({ error: error.message, ...(error.details ? { details: error.details } : {}) });
      }
      console.error(`[api] ${method} ${req.url} failed:`, error);
      return res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
    }
  };
}
