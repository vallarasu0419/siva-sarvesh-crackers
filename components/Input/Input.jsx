import { useId } from 'react';
import styles from './Input.module.css';

/**
 * Text input / textarea with label, hint and error message.
 * Pass multiline for a textarea. All other props go to the native element.
 */
export default function Input({ label, name, error, hint, required = false, multiline = false, className = '', prefix, ...rest }) {
  const generatedId = useId();
  const id = rest.id || `${name || 'field'}-${generatedId}`;
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  const Element = multiline ? 'textarea' : 'input';

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={`${styles.control} ${error ? styles.hasError : ''}`}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <Element
          id={id}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${styles.input} ${multiline ? styles.textarea : ''}`}
          {...rest}
        />
      </div>
      {hint && !error && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
      {error && <p id={`${id}-error`} className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
