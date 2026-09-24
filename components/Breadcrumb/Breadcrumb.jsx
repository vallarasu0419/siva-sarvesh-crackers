import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from './Breadcrumb.module.css';

/** items: [{ label, href? }] - the last item is the current page. */
export default function Breadcrumb({ items = [], tone = 'light' }) {
  return (
    <nav aria-label="Breadcrumb" className={`${styles.breadcrumb} ${styles[tone]}`}>
      <ol>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.label}>
              {item.href && !last ? <Link href={item.href}>{item.label}</Link> : <span aria-current={last ? 'page' : undefined}>{item.label}</span>}
              {!last && <FontAwesomeIcon icon={faChevronRight} className={styles.separator} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
