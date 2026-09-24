import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getCategoryIcon } from './productIcons';
import styles from './ProductThumb.module.css';

export default function ProductThumb({ imageUrl, name, categorySlug, size = 'md' }) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={name} className={`${styles.thumb} ${styles[size]}`} loading="lazy" />;
  }
  return (
    <span className={`${styles.thumb} ${styles.placeholder} ${styles[size]}`} aria-hidden="true">
      <FontAwesomeIcon icon={getCategoryIcon(categorySlug)} />
    </span>
  );
}
