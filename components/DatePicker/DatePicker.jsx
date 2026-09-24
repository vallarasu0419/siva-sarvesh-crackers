import Input from '../Input';

/** Date field (YYYY-MM-DD) built on the native date input for reliable mobile support. */
export default function DatePicker({ label, name, value, onChange, min, max, error, ...rest }) {
  return (
    <Input
      type="date"
      label={label}
      name={name}
      value={value || ''}
      onChange={onChange}
      min={min}
      max={max}
      error={error}
      {...rest}
    />
  );
}
