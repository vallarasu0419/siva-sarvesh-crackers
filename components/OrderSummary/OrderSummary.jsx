// Promotion code UI is commented out below; restore these imports with it.
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTag, faXmark, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
// import Input from '../Input';
// import Button from '../Button';
import { formatRupees } from '@/lib/format';
import { meetsMinimumOrder } from '@/lib/calculations';
import { MIN_ORDER_AMOUNT } from '@/constants/config';
import styles from './OrderSummary.module.css';

/**
 * Price summary. variant="compact" (products sidebar) or "full" (order page with promotion code).
 * promotion: { code, onCodeChange, onApply, onRemove, applying, appliedCode, error }
 */
// eslint-disable-next-line no-unused-vars -- `promotion` is used by the commented-out promotion code block.
export default function OrderSummary({ totals, savings = 0, variant = 'full', promotion, children, title = 'Order Summary' }) {
  const minimumMet = meetsMinimumOrder(totals.totalAmount, MIN_ORDER_AMOUNT);
  const remaining = Math.max(0, MIN_ORDER_AMOUNT - totals.totalAmount);
  const progress = Math.min(100, (totals.totalAmount / MIN_ORDER_AMOUNT) * 100);

  return (
    <section className={`${styles.summary} ${styles[variant]}`} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>Products selected</dt>
          <dd>{totals.itemCount} ({totals.totalQuantity} qty)</dd>
        </div>
        <div className={styles.row}>
          <dt>Sub Total</dt>
          <dd className="money">{formatRupees(totals.subtotal)}</dd>
        </div>
        {savings > 0 && (
          <div className={`${styles.row} ${styles.savings}`}>
            <dt>You save on list price</dt>
            <dd className="money">{formatRupees(savings)}</dd>
          </div>
        )}

        {/* "Have Promotion Code?" is switched off for now; uncomment this block (and the imports above) to bring it back.
        {variant === 'full' && promotion && (
          <div className={styles.promo}>
            {promotion.appliedCode ? (
              <p className={styles.promoApplied}>
                <FontAwesomeIcon icon={faCircleCheck} /> Code <strong>{promotion.appliedCode}</strong> applied
                <button type="button" className={styles.promoRemove} onClick={promotion.onRemove} aria-label="Remove promotion code">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </p>
            ) : (
              <>
                <p className={styles.promoLabel}><FontAwesomeIcon icon={faTag} /> Have Promotion Code?</p>
                <div className={styles.promoForm}>
                  <Input
                    name="promotionCode"
                    aria-label="Promotion code"
                    placeholder="Enter code"
                    value={promotion.code}
                    onChange={(event) => promotion.onCodeChange(event.target.value.toUpperCase())}
                    error={promotion.error}
                    autoComplete="off"
                  />
                  <Button variant="secondary" onClick={promotion.onApply} loading={promotion.applying} disabled={!promotion.code}>
                    Apply
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        */}

        {variant === 'full' && (
          <>
            <div className={styles.row}>
              <dt>Promotion Discount</dt>
              <dd className="money">- {formatRupees(totals.promotionDiscount)}</dd>
            </div>
            <div className={styles.row}>
              <dt>Min. Order Amount</dt>
              <dd className="money">{formatRupees(MIN_ORDER_AMOUNT)}</dd>
            </div>
            <div className={styles.row}>
              <dt>Packing Charges ({totals.packingChargePercentage}%)</dt>
              <dd className="money">{formatRupees(totals.packingCharge)}</dd>
            </div>
            <div className={styles.row}>
              <dt>Round Off</dt>
              <dd className="money">{formatRupees(totals.roundOff)}</dd>
            </div>
          </>
        )}

        <div className={`${styles.row} ${styles.total}`}>
          <dt>Overall Amount</dt>
          <dd className="money">{formatRupees(totals.totalAmount)}</dd>
        </div>
      </dl>

      <div className={styles.minimum}>
        <div className={styles.progress} aria-hidden="true"><span style={{ width: `${progress}%` }} className={minimumMet ? styles.progressDone : ''} /></div>
        <p className={minimumMet ? styles.minimumMet : styles.minimumPending}>
          {minimumMet
            ? 'Minimum order reached.'
            : `Add ${formatRupees(remaining)} more to reach the ${formatRupees(MIN_ORDER_AMOUNT)} minimum order.`}
        </p>
      </div>

      {children && <div className={styles.actions}>{children}</div>}
    </section>
  );
}
