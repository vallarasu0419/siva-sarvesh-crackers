import { apiHandler } from '@/lib/api/handler';
import { AppError } from '@/lib/api/errors';
import { quoteOrder } from '@/lib/orders';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';

// POST /api/promotions/validate { code, items: [{ productId, quantity }] }
// Returns server-calculated totals. The client never supplies a discount value.
export default apiHandler({
  POST: async (req, res) => {
    rateLimit({ key: `promo:${getClientIp(req)}`, limit: 20, windowMs: 10 * 60 * 1000 });
    const code = String(req.body?.code || '').trim();
    if (!code) throw new AppError(400, 'Enter a promotion code.');
    const quote = await quoteOrder({ items: req.body?.items, promotionCode: code });
    return res.status(200).json(quote);
  },
});
