import { apiHandler } from '@/lib/api/handler';
import { AppError } from '@/lib/api/errors';
import { verifyOtp } from '@/lib/otp';
import { isValidEmail, normalizeEmail } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';

// POST /api/otp/verify { email, otp }
export default apiHandler({
  POST: async (req, res) => {
    rateLimit({ key: `otp-verify:${getClientIp(req)}`, limit: 20, windowMs: 15 * 60 * 1000 });
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || '').trim();
    if (!isValidEmail(email)) throw new AppError(400, 'Enter a valid email address.');
    if (!/^\d{6}$/.test(otp)) throw new AppError(400, 'Enter the 6 digit OTP from your email.');

    const result = await verifyOtp(email, otp);
    return res.status(200).json({ message: 'OTP verified successfully.', ...result });
  },
});
