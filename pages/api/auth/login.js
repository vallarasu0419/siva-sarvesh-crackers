import { apiHandler } from '@/lib/api/handler';
import { AppError } from '@/lib/api/errors';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/auth/authenticate';
import { createSessionToken } from '@/lib/auth/token';
import { setSessionCookie } from '@/lib/auth/session';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';

async function findAdminByEmail(email) {
  const [admin] = await query('SELECT id, name, email, password_hash, is_active FROM admins WHERE email = ?', [email]);
  return admin || null;
}

export default apiHandler({
  POST: async (req, res) => {
    const ip = getClientIp(req);
    rateLimit({ key: `login:${ip}`, limit: 8, windowMs: 15 * 60 * 1000 });
    const email = String(req.body?.email || '').trim().toLowerCase();
    rateLimit({ key: `login-email:${email}`, limit: 8, windowMs: 15 * 60 * 1000 });

    const admin = await authenticateAdmin(email, req.body?.password, findAdminByEmail);
    if (!admin) throw new AppError(401, 'Incorrect email or password.');

    await query('UPDATE admins SET last_login_at = NOW() WHERE id = ?', [admin.id]);
    setSessionCookie(res, await createSessionToken(admin));
    return res.status(200).json({ admin: { name: admin.name, email: admin.email } });
  },
});
