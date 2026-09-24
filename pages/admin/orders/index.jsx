import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPenToSquare, faFilter, faRotateLeft, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '@/components/AdminLayout';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Dropdown from '@/components/Dropdown';
import DatePicker from '@/components/DatePicker';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import SuccessPopup from '@/components/SuccessPopup';
import StatusChangeDialog from '@/components/StatusChangeDialog';
import { apiRequest } from '@/lib/api/client';
import { formatRupees, formatDate, formatTime } from '@/lib/format';
import { STATUS_OPTIONS } from '@/lib/orders/status';
import { getCitiesForState } from '@/constants/locations';
import { DEFAULT_STATE } from '@/constants/config';
import styles from '@/styles/pages/Admin.module.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'amount_desc', label: 'Highest amount' },
  { value: 'amount_asc', label: 'Lowest amount' },
];
const FILTER_KEYS = ['orderNumber', 'name', 'mobile', 'email', 'status', 'city', 'from', 'to'];
const EMPTY_FILTERS = Object.fromEntries(FILTER_KEYS.map((key) => [key, '']));

export default function AdminOrders() {
  const router = useRouter();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusTarget, setStatusTarget] = useState(null);
  const [success, setSuccess] = useState('');

  const query = router.query;
  const sort = typeof query.sort === 'string' ? query.sort : 'newest';

  // Keep the form in sync with the URL (so filters survive refresh and back button).
  useEffect(() => {
    if (!router.isReady) return;
    setFilters(Object.fromEntries(FILTER_KEYS.map((key) => [key, typeof query[key] === 'string' ? query[key] : ''])));
  }, [router.isReady, query]);

  const load = useCallback(async () => {
    if (!router.isReady) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(Object.entries(query).filter(([, v]) => typeof v === 'string' && v !== ''));
      setResult(await apiRequest(`/api/orders?${params.toString()}`));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [router.isReady, query]);

  useEffect(() => { load(); }, [load]);

  const pushQuery = (next) => {
    const merged = { ...query, ...next };
    const clean = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== '' && v !== undefined && v !== null));
    router.push({ pathname: router.pathname, query: clean }, undefined, { shallow: true });
  };

  const applyFilters = (event) => {
    event.preventDefault();
    pushQuery({ ...filters, page: '' });
  };

  const setField = (key) => (event) => setFilters((f) => ({ ...f, [key]: event.target.value }));

  return (
    <>
      <form className={styles.filters} onSubmit={applyFilters}>
        <Input label="Order number" name="orderNumber" value={filters.orderNumber} onChange={setField('orderNumber')} placeholder="SSC-2026..." />
        <Input label="Customer name" name="name" value={filters.name} onChange={setField('name')} />
        <Input label="Mobile" name="mobile" value={filters.mobile} onChange={setField('mobile')} inputMode="tel" />
        <Input label="Email" name="email" value={filters.email} onChange={setField('email')} />
        <Select label="Status" name="status" value={filters.status} onChange={setField('status')} placeholder="All statuses" options={STATUS_OPTIONS} />
        <Select label="City" name="city" value={filters.city} onChange={setField('city')} placeholder="All cities" options={getCitiesForState(DEFAULT_STATE)} />
        <DatePicker label="From date" name="from" value={filters.from} onChange={setField('from')} max={filters.to || undefined} />
        <DatePicker label="To date" name="to" value={filters.to} onChange={setField('to')} min={filters.from || undefined} />
        <div className={styles.filterActions}>
          <Button type="submit" icon={faFilter}>Apply filters</Button>
          <Button variant="ghost" icon={faRotateLeft} onClick={() => { setFilters(EMPTY_FILTERS); router.push({ pathname: router.pathname, query: sort !== 'newest' ? { sort } : {} }, undefined, { shallow: true }); }}>
            Reset
          </Button>
        </div>
      </form>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>{result ? `${result.total} order${result.total === 1 ? '' : 's'}` : 'Orders'}</h2>
          <Dropdown label="Sort by" value={sort} options={SORT_OPTIONS} onChange={(value) => pushQuery({ sort: value === 'newest' ? '' : value, page: '' })} />
        </div>

        {error && <p className={styles.formError} role="alert">{error}</p>}
        {loading && !result ? (
          <LoadingSpinner size="lg" label="Loading orders" />
        ) : result && result.orders.length === 0 ? (
          <EmptyState icon={faBoxOpen} title="No orders found" message="Change or reset the filters to see more orders." />
        ) : result ? (
          <>
            <div className={`${styles.tableWrap} ${loading ? styles.dimmed : ''}`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order Number</th><th>Customer Name / Email</th><th>Mobile</th><th>City</th>
                    <th className={styles.right}>Total Amount</th><th>Order Date</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.orders.map((order) => (
                    <tr key={order.id}>
                      <td className={styles.orderNo}>{order.order_number}</td>
                      <td>
                        {order.customer_name}
                        <span className={styles.subText} title={order.customer_email}>{order.customer_email}</span>
                      </td>
                      <td className={styles.nowrap}><a href={`tel:+91${order.customer_mobile}`}>{order.customer_mobile}</a></td>
                      <td>{order.city}</td>
                      <td className={`${styles.right} money`}>{formatRupees(order.total_amount)}</td>
                      <td className={styles.nowrap}>{formatDate(order.created_at)}<span className={styles.subText}>{formatTime(order.created_at)}</span></td>
                      <td><StatusBadge status={order.status} /></td>
                      <td>
                        <div className={styles.rowActions}>
                          <Link href={`/admin/orders/${order.id}`} className={styles.iconLink} aria-label={`View ${order.order_number}`} title="View">
                            <FontAwesomeIcon icon={faEye} />
                          </Link>
                          <button type="button" className={styles.iconLink} onClick={() => setStatusTarget(order)} aria-label={`Change status of ${order.order_number}`} title="Change status">
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={result.page} totalPages={result.totalPages} total={result.total} pageSize={result.pageSize} onPageChange={(p) => pushQuery({ page: p > 1 ? String(p) : '' })} />
          </>
        ) : null}
      </section>

      <StatusChangeDialog
        open={Boolean(statusTarget)}
        order={statusTarget}
        onClose={() => setStatusTarget(null)}
        onUpdated={(data) => { setStatusTarget(null); setSuccess(data.message); load(); }}
      />
      <SuccessPopup open={Boolean(success)} onClose={() => setSuccess('')} title="Order status updated successfully." message={success} />
    </>
  );
}

AdminOrders.getLayout = (page) => <AdminLayout title="Orders">{page}</AdminLayout>;
