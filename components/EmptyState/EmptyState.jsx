import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './EmptyState.module.css';

export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className={styles.empty}>
      {icon && <FontAwesomeIcon icon={icon} className={styles.icon} />}
      <h2 className={styles.title}>{title}</h2>
      {message && <p className={styles.message}>{message}</p>}
      {action}
    </div>
  );
}
