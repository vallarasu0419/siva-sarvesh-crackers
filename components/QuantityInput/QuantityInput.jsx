import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { MAX_QUANTITY_PER_ITEM } from '@/constants/config';
import styles from './QuantityInput.module.css';

/**
 * Whole-number quantity with - / + buttons. Large touch targets for mobile.
 * Digits only, no leading zero, and typing above `max` is rejected with a short notice.
 */
export default function QuantityInput({ value = 0, onChange, label, max = MAX_QUANTITY_PER_ITEM, compact = false }) {
  const current = Number(value) || 0;
  const [limitHit, setLimitHit] = useState(false);
  const timer = useRef(null);
  const set = (next) => onChange(Math.min(max, Math.max(0, next)));

  useEffect(() => () => clearTimeout(timer.current), []);

  const showLimit = () => {
    setLimitHit(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLimitHit(false), 2000);
  };

  return (
    <div className={styles.field}>
      <div className={`${styles.wrapper} ${current > 0 ? styles.selected : ''} ${limitHit ? styles.invalid : ''} ${compact ? styles.compact : ''}`}>
        <button type="button" className={styles.step} onClick={() => set(current - 1)} disabled={current <= 0} aria-label={`Decrease quantity of ${label}`}>
          <FontAwesomeIcon icon={faMinus} />
        </button>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          pattern="[1-9][0-9]*"
          maxLength={String(max).length}
          value={current === 0 ? '' : current}
          placeholder="0"
          aria-label={`Quantity of ${label}`}
          aria-invalid={limitHit || undefined}
          onChange={(event) => {
            // Keep digits only and drop leading zeros ("0", "05" -> "", "5").
            const digits = event.target.value.replace(/\D/g, '').replace(/^0+/, '');
            const next = digits === '' ? 0 : Number.parseInt(digits, 10);
            if (next > max) {
              showLimit();
              return;
            }
            set(next);
          }}
          onFocus={(event) => event.target.select()}
        />
        <button type="button" className={styles.step} onClick={() => set(current + 1)} disabled={current >= max} aria-label={`Increase quantity of ${label}`}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
      {limitHit && <span className={styles.limit} role="alert">Max {max} per product</span>}
    </div>
  );
}
