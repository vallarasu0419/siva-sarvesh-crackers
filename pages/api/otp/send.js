import { apiHandler } from '@/lib/api/handler';
import { AppError } from '@/lib/api/errors';
import { sendOtp } from '@/lib/otp';
import { isValidEmail, normalizeEmail } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';

// POST /api/otp/send { email }
export default apiHandler({
  POST: async (req, res) => {
    const ip = getClientIp(req);
    rateLimit({ key: `otp-send:${ip}`, limit: 10, windowMs: 15 * 60 * 1000 });

    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) throw new AppError(400, 'Enter a valid email address.');

    const result = await sendOtp(email, ip);
    // The OTP itself is never returned.
    return res.status(200).json({ message: `OTP sent to ${email}.`, ...result });
  },
});
