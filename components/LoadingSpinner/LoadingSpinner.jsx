import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ size = 'md', label = 'Loading', inline = false }) {
  return (
    <span className={`${styles.wrapper} ${inline ? styles.inline : ''}`} role="status">
      <span className={`${styles.spinner} ${styles[size]}`} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
