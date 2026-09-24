import { apiHandler } from '@/lib/api/handler';
import { requireAdmin } from '@/lib/auth/session';
import { getDashboardStats } from '@/lib/orders';

export default apiHandler({
  GET: async (req, res) => {
    await requireAdmin(req);
    return res.status(200).json(await getDashboardStats());
  },
});
