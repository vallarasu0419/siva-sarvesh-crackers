import { apiHandler } from '@/lib/api/handler';
import { clearSessionCookie } from '@/lib/auth/session';

export default apiHandler({
  POST: async (req, res) => {
    clearSessionCookie(res);
    return res.status(200).json({ message: 'Logged out.' });
  },
});
