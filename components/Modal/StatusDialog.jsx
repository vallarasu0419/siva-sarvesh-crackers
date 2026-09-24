import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from './Modal';
import Button from '../Button';
import styles from './StatusDialog.module.css';

/** Shared body for SuccessPopup / ErrorPopup. */
export default function StatusDialog({ open, onClose, tone, icon, title, message, actionLabel, onAction }) {
  const lines = Array.isArray(message) ? message : String(message || '').split('\n').filter(Boolean);
  return (
    <Modal open={open} onClose={onClose} size="sm" labelledBy={`status-${tone}-title`}>
      <div className={`${styles.content} ${styles[tone]}`}>
        <span className={styles.icon}><FontAwesomeIcon icon={icon} /></span>
        <h2 id={`status-${tone}-title`} className={styles.title}>{title}</h2>
        {lines.map((line) => <p key={line} className={styles.message}>{line}</p>)}
        <Button variant={tone === 'danger' ? 'secondary' : 'primary'} onClick={onAction || onClose} fullWidth>
          {actionLabel}
        </Button>
      </div>
    </Modal>
  );
}
