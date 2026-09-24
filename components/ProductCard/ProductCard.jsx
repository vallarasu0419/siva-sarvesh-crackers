import { formatRupees } from '@/lib/format';
import { calculateLineAmount } from '@/lib/calculations';
import QuantityInput from '../QuantityInput';
import ProductThumb from '../ProductTable/ProductThumb';
import styles from './ProductCard.module.css';

/** Mobile-friendly product row: name, prices, quantity and read-only amount. */
export default function ProductCard({ product, categorySlug, quantity, onQuantityChange }) {
  const amount = calculateLineAmount(product.sellingPrice, quantity);

  return (
    <article className={`${styles.card} ${quantity > 0 ? styles.selected : ''}`}>
      <ProductThumb imageUrl={product.imageUrl} name={product.productName} categorySlug={categorySlug} size="lg" />
      <div className={styles.info}>
        <h3 className={styles.name}>{product.productName}</h3>
        {product.tamilName && <p className={`${styles.tamil} tamil`}>{product.tamilName}</p>}
        <p className={styles.meta}><span>{product.productCode}</span><span>{product.unit}</span></p>
        <p className={styles.prices}>
          <span className={`${styles.price} money`}>{formatRupees(product.sellingPrice)}</span>
        </p>
      </div>
      <div className={styles.buy}>
        <QuantityInput value={quantity} label={product.productName} onChange={onQuantityChange} />
        <output className={`${styles.amount} money`} aria-label={`Amount for ${product.productName}`}>
          {amount > 0 ? formatRupees(amount) : '₹0.00'}
        </output>
      </div>
    </article>
  );
}
