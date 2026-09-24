import { categories } from '../../database/seedData.js';

/** Category list for the home page when the database is unreachable. Server-side only. */
export function getFallbackCategories() {
  return categories.map((category, index) => ({
    id: index + 1,
    name: category.name,
    tamilName: category.tamil,
    slug: category.slug,
    productCount: category.products.length,
  }));
}
