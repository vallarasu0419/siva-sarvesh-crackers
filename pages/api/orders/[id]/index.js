import { apiHandler } from '@/lib/api/handler';
import { AppError } from '@/lib/api/errors';
import { getOrderDetails } from '@/lib/orders';
import { requireAdmin } from '@/lib/auth/session';

// GET /api/orders/:id (admin)
export default apiHandler({
  GET: async (req, res) => {
    await requireAdmin(req);
    const id = Number.parseInt(req.query.id, 10);
    if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'Invalid order id.');
    const details = await getOrderDetails(id);
    if (!details) throw new AppError(404, 'Order not found.');
    return res.status(200).json(details);
  },
});
