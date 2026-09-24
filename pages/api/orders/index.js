import { apiHandler } from '@/lib/api/handler';
import { createOrder, listOrders } from '@/lib/orders';
import { requireAdmin } from '@/lib/auth/session';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';

export default apiHandler({
  // Admin: paginated order list with filters and sorting.
  GET: async (req, res) => {
    await requireAdmin(req);
    const result = await listOrders(req.query);
    return res.status(200).json(result);
  },

  // Public: place an order (requires a verification token from /api/otp/verify).
  POST: async (req, res) => {
    rateLimit({ key: `order:${getClientIp(req)}`, limit: 10, windowMs: 30 * 60 * 1000 });
    const { customer, items, promotionCode, verificationToken } = req.body || {};
    const { order, items: orderItems } = await createOrder({ customer, items, promotionCode, verificationToken });

    // Only return what the confirmation page needs.
    return res.status(201).json({
      message: 'Order placed successfully!',
      order: {
        orderNumber: order.order_number,
        createdAt: order.created_at,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerMobile: order.customer_mobile,
        city: order.city,
        subtotal: order.subtotal,
        promotionDiscount: order.promotion_discount,
        packingCharge: order.packing_charge,
        roundOff: order.round_off,
        totalAmount: order.total_amount,
        items: orderItems.map((item) => ({
          productName: item.product_name,
          tamilName: item.tamil_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          amount: item.amount,
        })),
      },
    });
  },
});
