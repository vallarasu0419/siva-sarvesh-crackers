import { apiHandler } from '@/lib/api/handler';
import { AppError } from '@/lib/api/errors';
import { validateContactMessage } from '@/lib/validation';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';
import { sendMail, getAdminEmail } from '@/lib/email';
import { contactMessageEmail } from '@/emails/contactMessageEmail';

export default apiHandler({
  POST: async (req, res) => {
    rateLimit({ key: `contact:${getClientIp(req)}`, limit: 5, windowMs: 30 * 60 * 1000 });
    const { valid, errors, value } = validateContactMessage(req.body);
    if (!valid) throw new AppError(400, 'Please correct the highlighted fields.', { fields: errors });
    await sendMail({ to: getAdminEmail(), ...contactMessageEmail(value) });
    return res.status(200).json({ message: 'Thanks! Your message has been sent. We will reply soon.' });
  },
});
