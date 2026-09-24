import { apiHandler } from '@/lib/api/handler';
import { getCategories } from '@/lib/products';

export default apiHandler({
  GET: async (req, res) => {
    const categories = await getCategories();
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json({ categories });
  },
});
