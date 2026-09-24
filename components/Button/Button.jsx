import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LoadingSpinner from '../LoadingSpinner';
import styles from './Button.module.css';

/**
 * Reusable button. Renders a Next.js Link when `href` is given.
 * variant: primary | secondary | outline | ghost | danger | light
 * size: sm | md | lg
 * `loading` disables the button and prevents duplicate submissions.
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'start',
  fullWidth = false,
  href,
  className = '',
  ...rest
}) {
  const classes = [styles.button, styles[variant], styles[size], fullWidth ? styles.full : '', className].join(' ');
  const iconNode = icon ? <FontAwesomeIcon icon={icon} fixedWidth /> : null;
  const content = (
    <>
      {loading ? <LoadingSpinner size="sm" inline label="Please wait" /> : iconPosition === 'start' && iconNode}
      {children && <span>{children}</span>}
      {!loading && iconPosition === 'end' && iconNode}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
