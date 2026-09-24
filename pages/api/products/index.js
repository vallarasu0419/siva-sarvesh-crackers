import { apiHandler } from '@/lib/api/handler';
import { searchProducts } from '@/lib/products';
import { getAdminFromRequest } from '@/lib/auth/session';

// GET /api/products?search=&category=&sort=&status=
export default apiHandler({
  GET: async (req, res) => {
    const { search = '', category = '', sort = 'default' } = req.query;
    let status = 'active';
    // Only admins may list inactive products.
    if (req.query.status && req.query.status !== 'active' && (await getAdminFromRequest(req))) {
      status = req.query.status === 'inactive' ? 'inactive' : 'all';
    }
    const products = await searchProducts({ search: String(search), categorySlug: String(category), status, sort: String(sort) });
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json({ products });
  },
});
