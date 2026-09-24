import { query } from '../db/index.js';

const PRODUCT_COLUMNS = `
  p.id, p.product_code AS productCode, p.product_name AS productName, p.tamil_name AS tamilName,
  p.category_id AS categoryId, p.description, p.unit, p.image_url AS imageUrl,
  p.original_price AS originalPrice, p.discount_percentage AS discountPercentage,
  p.selling_price AS sellingPrice, p.is_active AS isActive`;

/** Active categories with their active products, in display order. */
export async function getCatalog() {
  const categories = await query(
    `SELECT id, name, tamil_name AS tamilName, slug, display_order AS displayOrder
       FROM categories WHERE is_active = 1 ORDER BY display_order, name`
  );
  const products = await query(
    `SELECT ${PRODUCT_COLUMNS}
       FROM products p
       JOIN categories c ON c.id = p.category_id AND c.is_active = 1
      WHERE p.is_active = 1
      ORDER BY c.display_order, p.display_order, p.product_name`
  );
  return categories
    .map((category) => ({
      ...category,
      products: products
        .filter((product) => product.categoryId === category.id)
        .map((product) => ({ ...product, isActive: Boolean(product.isActive) })),
    }))
    .filter((category) => category.products.length > 0);
}

export async function getCategories() {
  return query(
    `SELECT c.id, c.name, c.tamil_name AS tamilName, c.slug, c.display_order AS displayOrder,
            COUNT(p.id) AS productCount
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.display_order`
  );
}

const SORTS = {
  default: 'c.display_order, p.display_order',
  name: 'p.product_name',
  price_asc: 'p.selling_price, p.product_name',
  price_desc: 'p.selling_price DESC, p.product_name',
  category: 'c.name, p.product_name',
};

/** Flat product search used by GET /api/products. */
export async function searchProducts({ search = '', categorySlug = '', status = 'active', sort = 'default' } = {}) {
  const where = [];
  const params = [];
  if (status === 'active') where.push('p.is_active = 1');
  else if (status === 'inactive') where.push('p.is_active = 0');
  if (search) {
    where.push('(p.product_name LIKE ? OR p.product_code LIKE ? OR p.tamil_name LIKE ?)');
    const term = `%${search.slice(0, 80)}%`;
    params.push(term, term, term);
  }
  if (categorySlug) {
    where.push('c.slug = ?');
    params.push(categorySlug.slice(0, 140));
  }
  const orderBy = SORTS[sort] || SORTS.default;
  return query(
    `SELECT ${PRODUCT_COLUMNS}, c.name AS categoryName, c.slug AS categorySlug
       FROM products p JOIN categories c ON c.id = p.category_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY ${orderBy}`,
    params
  );
}

/**
 * Fetches current, active products for pricing an order.
 * Uses the given connection so it can run inside the order transaction.
 */
export async function getActiveProductsByIds(connection, ids) {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await connection.execute(
    `SELECT id, product_code, product_name, tamil_name, unit, original_price, selling_price
       FROM products WHERE is_active = 1 AND id IN (${placeholders})`,
    ids
  );
  return rows;
}
