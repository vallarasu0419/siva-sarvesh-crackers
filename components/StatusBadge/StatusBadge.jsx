import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTruck, faCircleCheck, faBan } from '@fortawesome/free-solid-svg-icons';
import { STATUS_LABELS } from '@/lib/orders/status';
import styles from './StatusBadge.module.css';

const ICONS = { PENDING: faClock, PICKED_UP: faTruck, DELIVERED: faCircleCheck, REJECTED: faBan };

export default function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[status] || ''}`}>
      <FontAwesomeIcon icon={ICONS[status] || faClock} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
