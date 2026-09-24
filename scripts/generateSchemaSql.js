/**
 * Regenerates database/schema.sql = schema.base.sql + seed INSERTs built
 * from database/seedData.js (the single source of truth for the catalogue).
 * Usage: npm run db:generate-sql
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildSeedRows } from '../database/seedData.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = readFileSync(path.join(root, 'database/schema.base.sql'), 'utf8');

const sqlString = (value) =>
  value === null || value === undefined ? 'NULL' : `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;

const { categoryRows, productRows } = buildSeedRows();

const categorySql = categoryRows
  .map((c) => `  (${sqlString(c.name)}, ${sqlString(c.tamilName)}, ${sqlString(c.slug)}, ${c.displayOrder}, 1)`)
  .join(',\n');

const productSql = productRows
  .map(
    (p) =>
      `  (${sqlString(p.productCode)}, ${sqlString(p.productName)}, ${sqlString(p.tamilName)}, ` +
      `(SELECT id FROM categories WHERE slug = ${sqlString(p.categorySlug)}), ${sqlString(p.unit)}, ` +
      `${p.originalPrice.toFixed(2)}, ${p.discountPercentage.toFixed(2)}, ${p.sellingPrice.toFixed(2)}, ${p.displayOrder}, 1)`
  )
  .join(',\n');

const seed = `
-- =====================================================================
-- Seed data (generated from database/seedData.js - do not edit by hand)
-- Re-running is safe: existing rows are updated, not duplicated.
-- =====================================================================

INSERT INTO categories (name, tamil_name, slug, display_order, is_active) VALUES
${categorySql}
ON DUPLICATE KEY UPDATE name = VALUES(name), tamil_name = VALUES(tamil_name), display_order = VALUES(display_order);

INSERT INTO products (product_code, product_name, tamil_name, category_id, unit, original_price, discount_percentage, selling_price, display_order, is_active) VALUES
${productSql}
ON DUPLICATE KEY UPDATE product_name = VALUES(product_name), tamil_name = VALUES(tamil_name), category_id = VALUES(category_id),
  unit = VALUES(unit), original_price = VALUES(original_price), discount_percentage = VALUES(discount_percentage),
  selling_price = VALUES(selling_price), display_order = VALUES(display_order);

-- Sample promotion code (inactive by default - activate from SQL when needed)
INSERT INTO promotion_codes (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active) VALUES
  ('DIWALI5', 'Extra 5% off on orders above Rs.5000', 'PERCENT', 5.00, 5000.00, 1000.00, 0)
ON DUPLICATE KEY UPDATE description = VALUES(description);
`;

writeFileSync(path.join(root, 'database/schema.sql'), base + seed);
console.log(`schema.sql written: ${categoryRows.length} categories, ${productRows.length} products.`);
