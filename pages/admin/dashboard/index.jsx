import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faClock, faTruck, faCircleCheck, faBan, faEye, faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '@/components/AdminLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import { apiRequest } from '@/lib/api/client';
import { formatRupees, formatDateTime } from '@/lib/format';
import styles from '@/styles/pages/Admin.module.css';

const CARDS = [
  { key: 'total', label: 'Total Orders', icon: faBoxOpen, tone: 'night' },
  { key: 'PENDING', label: 'Pending Orders', icon: faClock, tone: 'warning' },
  { key: 'PICKED_UP', label: 'Picked Up', icon: faTruck, tone: 'info' },
  { key: 'DELIVERED', label: 'Delivered', icon: faCircleCheck, tone: 'success' },
  { key: 'REJECTED', label: 'Rejected', icon: faBan, tone: 'danger' },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/api/admin/stats').then(setData).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      {!data && !error && <LoadingSpinner size="lg" label="Loading dashboard" />}
      {data && (
        <>
          <ul className={styles.statGrid}>
            {CARDS.map((card) => (
              <li key={card.key}>
                <Link href={card.key === 'total' ? '/admin/orders' : `/admin/orders?status=${card.key}`} className={`${styles.stat} ${styles[`tone_${card.tone}`]}`}>
                  <FontAwesomeIcon icon={card.icon} className={styles.statIcon} />
                  <span className={styles.statValue}>{data.stats[card.key]}</span>
                  <span className={styles.statLabel}>{card.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.revenue}>
            <FontAwesomeIcon icon={faIndianRupeeSign} /> Order value excluding rejected orders: <strong className="money">{formatRupees(data.stats.totalAmount)}</strong>
          </p>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Latest orders</h2>
              <Button href="/admin/orders" variant="outline" size="sm">View all orders</Button>
            </div>
            {data.recent.length === 0 ? (
              <EmptyState icon={faBoxOpen} title="No orders yet" message="New orders from the website will appear here." />
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Order Number</th><th>Customer</th><th>City</th><th className={styles.right}>Amount</th><th>Date</th><th>Status</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
                  <tbody>
                    {data.recent.map((order) => (
                      <tr key={order.id}>
                        <td className={styles.orderNo}>{order.order_number}</td>
                        <td>{order.customer_name}</td>
                        <td>{order.city}</td>
                        <td className={`${styles.right} money`}>{formatRupees(order.total_amount)}</td>
                        <td>{formatDateTime(order.created_at)}</td>
                        <td><StatusBadge status={order.status} /></td>
                        <td><Link href={`/admin/orders/${order.id}`} className={styles.iconLink} aria-label={`View ${order.order_number}`}><FontAwesomeIcon icon={faEye} /></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

Dashboard.getLayout = (page) => <AdminLayout title="Dashboard">{page}</AdminLayout>;
