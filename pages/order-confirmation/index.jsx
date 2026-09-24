import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Seo from '@/components/Seo';
import Button from '@/components/Button';
import SocialIcons from '@/components/SocialIcons';
import { formatRupees, formatDateTime } from '@/lib/format';
import { BUSINESS, LAST_ORDER_STORAGE_KEY } from '@/constants/config';
import styles from '@/styles/pages/Confirmation.module.css';

export default function OrderConfirmation() {
  const router = useRouter();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.sessionStorage.getItem(LAST_ORDER_STORAGE_KEY) || 'null');
      if (stored) setOrder(stored);
    } catch {
      setOrder(null);
    }
  }, []);

  const orderNumber = order?.orderNumber || (typeof router.query.order === 'string' ? router.query.order : null);

  return (
    <>
      <Seo title="Order Placed" noIndex />
      <section className="section">
        <div className={`container ${styles.wrapper}`}>
          <div className={styles.ticket}>
            <FontAwesomeIcon icon={faCircleCheck} className={styles.icon} />
            <h1 className={styles.title}>Order placed successfully!</h1>
            {orderNumber ? (
              <p className={styles.number}>Order number <strong>{orderNumber}</strong></p>
            ) : (
              <p className={styles.number}>Your order has been received.</p>
            )}
            <p className={styles.lead}>
              {order ? `Thank you, ${order.customerName}. ` : ''}
              We have emailed your order details{order ? ` to ${order.customerEmail}` : ''}. Our team will call or WhatsApp you
              within 24 hours to confirm stock, payment and delivery.
            </p>

            {order && (
              <>
                <table className={styles.items}>
                  <thead>
                    <tr><th scope="col">Product</th><th scope="col">Qty</th><th scope="col">Rate</th><th scope="col">Amount</th></tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={`${item.productName}-${item.unitPrice}`}>
                        <td>{item.productName}<span className="tamil">{item.tamilName}</span></td>
                        <td>{item.quantity}</td>
                        <td className="money">{formatRupees(item.unitPrice)}</td>
                        <td className="money">{formatRupees(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <dl className={styles.totals}>
                  <div><dt>Sub Total</dt><dd>{formatRupees(order.subtotal)}</dd></div>
                  <div><dt>Promotion Discount</dt><dd>- {formatRupees(order.promotionDiscount)}</dd></div>
                  <div><dt>Packing Charges</dt><dd>{formatRupees(order.packingCharge)}</dd></div>
                  <div><dt>Round Off</dt><dd>{formatRupees(order.roundOff)}</dd></div>
                  <div className={styles.grand}><dt>Overall Amount</dt><dd>{formatRupees(order.totalAmount)}</dd></div>
                </dl>
                <p className="muted">Placed on {formatDateTime(order.createdAt)}. Delivery to {order.city}.</p>
              </>
            )}

            <div className={styles.contact}>
              <p><FontAwesomeIcon icon={faPhone} /> Questions? Call {BUSINESS.phones.map((p) => <a key={p.tel} href={`tel:${p.tel}`}>{p.number}</a>)}</p>
              <p><FontAwesomeIcon icon={faEnvelope} /> <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></p>
            </div>
            <div className={styles.actions}>
              <Button href="/products" variant="outline">Back to price list</Button>
              <Button href="/safety-tips">Read safety tips</Button>
            </div>
            <SocialIcons tone="dark" showLabels />
          </div>
        </div>
      </section>
    </>
  );
}
