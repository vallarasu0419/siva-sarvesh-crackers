import { apiHandler } from '@/lib/api/handler';
import { requireAdmin } from '@/lib/auth/session';

export default apiHandler({
  GET: async (req, res) => {
    const admin = await requireAdmin(req);
    return res.status(200).json({ admin });
  },
});
