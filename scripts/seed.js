/**
 * Upserts categories and products from database/seedData.js.
 * Safe to run again after editing seedData.js: existing codes are updated.
 * Usage: npm run seed
 */
import mysql from 'mysql2/promise';
import { buildSeedRows } from '../database/seedData.js';
import { getDbConfig } from '../lib/db/config.js';

let dbConfig;
try {
  dbConfig = getDbConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const connection = await mysql.createConnection(dbConfig);
const { categoryRows, productRows } = buildSeedRows();

try {
  await connection.beginTransaction();
  for (const c of categoryRows) {
    await connection.execute(
      `INSERT INTO categories (name, tamil_name, slug, display_order, is_active) VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE name = VALUES(name), tamil_name = VALUES(tamil_name), display_order = VALUES(display_order)`,
      [c.name, c.tamilName, c.slug, c.displayOrder]
    );
  }
  const [categories] = await connection.query('SELECT id, slug FROM categories');
  const idBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  for (const p of productRows) {
    await connection.execute(
      `INSERT INTO products (product_code, product_name, tamil_name, category_id, unit, original_price, discount_percentage, selling_price, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE product_name = VALUES(product_name), tamil_name = VALUES(tamil_name), category_id = VALUES(category_id),
         unit = VALUES(unit), original_price = VALUES(original_price), discount_percentage = VALUES(discount_percentage),
         selling_price = VALUES(selling_price), display_order = VALUES(display_order)`,
      [p.productCode, p.productName, p.tamilName, idBySlug.get(p.categorySlug), p.unit, p.originalPrice, p.discountPercentage, p.sellingPrice, p.displayOrder]
    );
  }
  await connection.commit();
  console.log(`Seeded ${categoryRows.length} categories and ${productRows.length} products.`);
} catch (error) {
  await connection.rollback();
  console.error('Seeding failed:', error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
