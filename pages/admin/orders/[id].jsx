import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPenToSquare, faPhone, faEnvelope, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '@/components/AdminLayout';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import SuccessPopup from '@/components/SuccessPopup';
import StatusChangeDialog from '@/components/StatusChangeDialog';
import { apiRequest } from '@/lib/api/client';
import { formatRupees, formatDateTime } from '@/lib/format';
import styles from '@/styles/pages/Admin.module.css';

function Detail({ label, children }) {
  return (
    <div className={styles.detail}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function AdminOrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setData(await apiRequest(`/api/orders/${id}`));
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (error) {
    return <EmptyState icon={faTriangleExclamation} title="Order could not be loaded" message={error} action={<Button href="/admin/orders">Back to orders</Button>} />;
  }
  if (!data) return <LoadingSpinner size="lg" label="Loading order" />;

  const { order, items, history } = data;

  return (
    <>
      <div className={styles.detailTop}>
        <Link href="/admin/orders" className={styles.back}><FontAwesomeIcon icon={faArrowLeft} /> All orders</Link>
        <Button icon={faPenToSquare} onClick={() => setDialogOpen(true)}>Change Status</Button>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.panel}>
          <h2>Order details</h2>
          <dl className={styles.details}>
            <Detail label="Order Number"><span className={styles.orderNo}>{order.order_number}</span></Detail>
            <Detail label="Order Date">{formatDateTime(order.created_at)}</Detail>
            <Detail label="Status"><StatusBadge status={order.status} /></Detail>
            <Detail label="Email verified">{order.email_verified ? 'Yes (OTP)' : 'No'}</Detail>
            {order.promotion_code && <Detail label="Promotion code">{order.promotion_code}</Detail>}
          </dl>
        </section>

        <section className={styles.panel}>
          <h2>Customer details</h2>
          <dl className={styles.details}>
            <Detail label="Name">{order.customer_name}</Detail>
            <Detail label="Mobile"><a href={`tel:+91${order.customer_mobile}`}><FontAwesomeIcon icon={faPhone} /> {order.customer_mobile}</a></Detail>
            <Detail label="Email"><a href={`mailto:${order.customer_email}`}><FontAwesomeIcon icon={faEnvelope} /> {order.customer_email}</a></Detail>
            <Detail label="State">{order.state}</Detail>
            <Detail label="City">{order.city}</Detail>
            <Detail label="Address"><span className={styles.address}>{order.address}</span></Detail>
          </dl>
        </section>
      </div>

      <section className={styles.panel}>
        <h2>Product details</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>#</th><th>Code</th><th>Product</th><th>Tamil Name</th><th className={styles.right}>Quantity</th><th className={styles.right}>Unit Price</th><th className={styles.right}>Amount</th></tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td className={styles.nowrap}>{item.product_code}</td>
                  <td>{item.product_name}</td>
                  <td className="tamil">{item.tamil_name}</td>
                  <td className={styles.right}>{item.quantity}</td>
                  <td className={`${styles.right} money`}>{formatRupees(item.unit_price)}</td>
                  <td className={`${styles.right} money`}>{formatRupees(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className={styles.priceSummary}>
          <div><dt>Subtotal</dt><dd>{formatRupees(order.subtotal)}</dd></div>
          <div><dt>Promotion Discount</dt><dd>- {formatRupees(order.promotion_discount)}</dd></div>
          <div><dt>Packing Charges ({Number(order.packing_charge_percentage)}%)</dt><dd>{formatRupees(order.packing_charge)}</dd></div>
          <div><dt>Round Off</dt><dd>{formatRupees(order.round_off)}</dd></div>
          <div className={styles.priceTotal}><dt>Overall Amount</dt><dd>{formatRupees(order.total_amount)}</dd></div>
        </dl>
      </section>

      <section className={styles.panel}>
        <h2>Status history</h2>
        <ol className={styles.history}>
          {history.map((entry) => (
            <li key={entry.id}>
              <div className={styles.historyHead}>
                {entry.old_status && <><StatusBadge status={entry.old_status} /> <span aria-hidden="true">to</span></>}
                <StatusBadge status={entry.new_status} />
              </div>
              <p className={styles.historyMeta}>{formatDateTime(entry.created_at)}, by {entry.changed_by_name}</p>
              {entry.remarks && <p className={styles.historyRemarks}>{entry.remarks}</p>}
            </li>
          ))}
        </ol>
      </section>

      <StatusChangeDialog
        open={dialogOpen}
        order={order}
        onClose={() => setDialogOpen(false)}
        onUpdated={(result) => {
          setDialogOpen(false);
          setData({ order: result.order, items: result.items, history: result.history });
          setSuccess(result.message);
        }}
      />
      <SuccessPopup open={Boolean(success)} onClose={() => setSuccess('')} title="Order status updated successfully." message={success} />
    </>
  );
}

AdminOrderDetails.getLayout = (page) => <AdminLayout title="Order Details">{page}</AdminLayout>;
