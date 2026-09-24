import { formatRupees } from '@/lib/format';
import { calculateLineAmount } from '@/lib/calculations';
import QuantityInput from '../QuantityInput';
import ProductCard from '../ProductCard';
import ProductThumb from './ProductThumb';
import styles from './ProductTable.module.css';

/**
 * Category-grouped price list.
 * Desktop: table. Mobile (<= 820px): ProductCard list, so nobody scrolls sideways.
 * Amount is always calculated (selling price x quantity) and is read-only.
 */
export default function ProductTable({ categories, quantities, onQuantityChange }) {
  let serial = 0;

  return (
    <div className={styles.wrapper}>
      {categories.map((category) => (
        <section key={category.id} id={`category-${category.slug}`} className={styles.category} aria-labelledby={`heading-${category.slug}`}>
          <header className={styles.categoryHeader}>
            <h2 id={`heading-${category.slug}`} className={styles.categoryTitle}>{category.name}</h2>
            {category.tamilName && <span className={`${styles.categoryTamil} tamil`}>{category.tamilName}</span>}
          </header>

          <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.num}>S.No</th>
                <th scope="col" className={styles.imageCol}><span className="visually-hidden">Image</span></th>
                <th scope="col">Product Name <span className={`${styles.thTamil} tamil`}>பட்டாசின் பெயர்கள்</span></th>
                <th scope="col">Per</th>
                <th scope="col" className={styles.right}>Rate</th>
                <th scope="col" className={styles.center}>Qty</th>
                <th scope="col" className={styles.right}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {category.products.map((product) => {
                serial += 1;
                const quantity = quantities[product.id] || 0;
                const amount = calculateLineAmount(product.sellingPrice, quantity);
                return (
                  <tr key={product.id} className={quantity > 0 ? styles.selectedRow : ''}>
                    <td className={styles.num}>{serial}</td>
                    <td className={styles.imageCol}><ProductThumb imageUrl={product.imageUrl} name={product.productName} categorySlug={category.slug} /></td>
                    <td className={styles.name}>
                      {product.productName}
                      {product.tamilName && <span className={`${styles.tamilName} tamil`}>{product.tamilName}</span>}
                      <span className={styles.code}>{product.productCode}</span>
                    </td>
                    <td className={styles.unit}>{product.unit}</td>
                    <td className={`${styles.right} ${styles.price} money`}>{formatRupees(product.sellingPrice)}</td>
                    <td className={styles.center}>
                      <QuantityInput compact value={quantity} label={product.productName} onChange={(qty) => onQuantityChange(product.id, qty)} />
                    </td>
                    <td className={`${styles.right} money`}>
                      <output className={`${styles.amount} ${amount > 0 ? styles.amountActive : ''}`} aria-label={`Amount for ${product.productName}`}>
                        {formatRupees(amount)}
                      </output>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          <ul className={styles.cards}>
            {category.products.map((product) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  categorySlug={category.slug}
                  quantity={quantities[product.id] || 0}
                  onQuantityChange={(qty) => onQuantityChange(product.id, qty)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
