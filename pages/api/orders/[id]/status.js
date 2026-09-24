import { apiHandler } from '@/lib/api/handler';
import { AppError } from '@/lib/api/errors';
import { updateOrderStatus } from '@/lib/orders';
import { requireAdmin } from '@/lib/auth/session';
import { STATUS_LABELS } from '@/lib/orders/status';

// PATCH /api/orders/:id/status { status, remarks } (admin)
export default apiHandler({
  PATCH: async (req, res) => {
    const admin = await requireAdmin(req);
    const id = Number.parseInt(req.query.id, 10);
    if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'Invalid order id.');

    const result = await updateOrderStatus({ orderId: id, newStatus: req.body?.status, admin, remarks: req.body?.remarks });
    const label = STATUS_LABELS[result.order.status];
    return res.status(200).json({
      message: result.emailSent
        ? `Order status updated to ${label}. The customer has been emailed.`
        : `Order status updated to ${label}. The customer email could not be sent - check SMTP settings.`,
      ...result,
    });
  },
});
