import { useEffect, useId, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './Dropdown.module.css';

/**
 * Custom dropdown (listbox) for non-form choices such as order status and sorting.
 * options: [{ value, label, icon? }]
 * Keyboard: Enter/Space/ArrowDown open, arrows move, Enter selects, Escape closes.
 */
export default function Dropdown({ label, value, options = [], onChange, disabled = false, placeholder = 'Select', renderOption, className = '' }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const id = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
      listRef.current?.focus();
    }
  }, [open, options, value]);

  const choose = (option) => {
    setOpen(false);
    if (option.value !== value) onChange?.(option.value);
  };

  const onListKeyDown = (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex((i) => Math.min(options.length - 1, i + 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex((i) => Math.max(0, i - 1)); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (options[activeIndex]) choose(options[activeIndex]); }
    else if (event.key === 'Escape' || event.key === 'Tab') { setOpen(false); }
  };

  const display = (option) => (renderOption ? renderOption(option) : option.label);

  return (
    <div className={`${styles.root} ${className}`} ref={rootRef}>
      {label && <span id={`${id}-label`} className={styles.label}>{label}</span>}
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${id}-label ${id}-button` : undefined}
        id={`${id}-button`}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); }
        }}
      >
        <span className={styles.value}>{selected ? display(selected) : placeholder}</span>
        <FontAwesomeIcon icon={faChevronDown} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </button>
      {open && (
        <ul
          ref={listRef}
          className={styles.menu}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined}
          onKeyDown={onListKeyDown}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-opt-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={`${styles.option} ${index === activeIndex ? styles.active : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option)}
            >
              <span>{display(option)}</span>
              {option.value === value && <FontAwesomeIcon icon={faCheck} className={styles.check} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
