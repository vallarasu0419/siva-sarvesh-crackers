import { useId } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import inputStyles from '../Input/Input.module.css';
import styles from './Select.module.css';

/**
 * Native select for forms (best on mobile).
 * options: [{ value, label }] or plain strings.
 */
export default function Select({ label, name, options = [], placeholder, error, hint, required = false, className = '', ...rest }) {
  const generatedId = useId();
  const id = rest.id || `${name || 'select'}-${generatedId}`;
  const normalized = options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option));

  return (
    <div className={`${inputStyles.field} ${className}`}>
      {label && (
        <label htmlFor={id} className={inputStyles.label}>
          {label}
          {required && <span className={inputStyles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={`${inputStyles.control} ${styles.control} ${error ? inputStyles.hasError : ''}`}>
        <select
          id={id}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputStyles.input} ${styles.select}`}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {normalized.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <FontAwesomeIcon icon={faChevronDown} className={styles.chevron} aria-hidden="true" />
      </div>
      {hint && !error && <p className={inputStyles.hint}>{hint}</p>}
      {error && <p id={`${id}-error`} className={inputStyles.error} role="alert">{error}</p>}
    </div>
  );
}
