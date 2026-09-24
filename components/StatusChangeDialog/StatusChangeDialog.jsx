import { useEffect, useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import Dropdown from '../Dropdown';
import Input from '../Input';
import StatusBadge from '../StatusBadge';
import { STATUS_OPTIONS, STATUS_LABELS } from '@/lib/orders/status';
import { apiRequest } from '@/lib/api/client';
import styles from './StatusChangeDialog.module.css';

/**
 * Admin status change: pick status -> review -> confirm.
 * Calls PATCH /api/orders/:id/status, which writes history and emails the customer.
 */
export default function StatusChangeDialog({ order, open, onClose, onUpdated }) {
  const [status, setStatus] = useState(order?.status);
  const [remarks, setRemarks] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setStatus(order?.status);
      setRemarks('');
      setConfirming(false);
      setError('');
    }
  }, [open, order]);

  if (!order) return null;
  const unchanged = status === order.status;

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const data = await apiRequest(`/api/orders/${order.id}/status`, { method: 'PATCH', body: { status, remarks } });
      onUpdated(data);
    } catch (e) {
      setError(e.message);
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      dismissible={!saving}
      size="sm"
      title={confirming ? 'Confirm status change' : 'Change order status'}
      footer={
        confirming ? (
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={saving}>Back</Button>
            <Button onClick={save} loading={saving} variant={status === 'REJECTED' ? 'danger' : 'primary'}>Yes, update status</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => setConfirming(true)} disabled={unchanged}>Continue</Button>
          </>
        )
      }
    >
      {confirming ? (
        <div className={styles.confirm}>
          <p>
            Change <strong>{order.order_number}</strong> from <StatusBadge status={order.status} /> to <StatusBadge status={status} />?
          </p>
          <p className="muted">The customer will get an email saying the order is now {STATUS_LABELS[status].toLowerCase()}.</p>
          {remarks && <p className={styles.remarks}>Note: {remarks}</p>}
        </div>
      ) : (
        <div className={styles.form}>
          <p className={styles.current}>{order.order_number}, currently <StatusBadge status={order.status} /></p>
          <Dropdown label="New status" value={status} options={STATUS_OPTIONS} onChange={setStatus} renderOption={(o) => <StatusBadge status={o.value} />} />
          <Input label="Note to customer (optional)" name="remarks" multiline maxLength={500} value={remarks} onChange={(e) => setRemarks(e.target.value)} hint="Included in the status email and saved in the order history." />
          {error && <p className={styles.error} role="alert">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
