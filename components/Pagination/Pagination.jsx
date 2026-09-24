import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from './Pagination.module.css';

function pageList(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
}

export default function Pagination({ page, totalPages, onPageChange, total, pageSize }) {
  if (totalPages <= 1) return total ? <p className={styles.summary}>{total} result{total === 1 ? '' : 's'}</p> : null;
  const pages = pageList(page, totalPages);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <p className={styles.summary}>Showing {start}-{end} of {total}</p>
      <div className={styles.buttons}>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        {pages.map((p, index) => (
          <span key={p} className={styles.group}>
            {index > 0 && p - pages[index - 1] > 1 && <span className={styles.gap}>…</span>}
            <button type="button" onClick={() => onPageChange(p)} aria-current={p === page ? 'page' : undefined} className={p === page ? styles.current : ''}>
              {p}
            </button>
          </span>
        ))}
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </nav>
  );
}
