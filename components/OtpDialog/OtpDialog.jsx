import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeOpenText, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import Modal from '../Modal';
import Button from '../Button';
import Input from '../Input';
import { OTP_LENGTH } from '@/constants/config';
import styles from './OtpDialog.module.css';

/**
 * Email OTP step of the order flow.
 * 1. Customer enters the OTP -> onVerify(otp)
 * 2. After success the dialog shows "Confirm & Place Order" -> onPlaceOrder()
 */
export default function OtpDialog({ open, email, verified, resendAfter = 60, onVerify, onResend, onPlaceOrder, onClose, verifying, resending, placing, error }) {
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(resendAfter);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setOtp('');
    setSecondsLeft(resendAfter);
    timerRef.current = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timerRef.current);
  }, [open, resendAfter]);

  const handleResend = async () => {
    const ok = await onResend();
    if (ok) {
      setOtp('');
      setSecondsLeft(resendAfter);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={verified ? 'Email verified' : 'Verify your email'} size="sm" dismissible={!placing}>
      {!verified ? (
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            if (otp.length === OTP_LENGTH) onVerify(otp);
          }}
        >
          <span className={styles.icon}><FontAwesomeIcon icon={faEnvelopeOpenText} /></span>
          <p className={styles.text}>We sent a {OTP_LENGTH} digit OTP to <strong>{email}</strong>. It is valid for 5 minutes.</p>
          <Input
            name="otp"
            label="Enter OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
            className={styles.otpField}
            error={error}
            autoFocus
          />
          <Button type="submit" fullWidth loading={verifying} disabled={otp.length !== OTP_LENGTH}>Verify OTP</Button>
          <p className={styles.resend}>
            Did not get it? Check spam, or{' '}
            {secondsLeft > 0 ? (
              <span className={styles.wait}>resend in {secondsLeft}s</span>
            ) : (
              <button type="button" className={styles.link} onClick={handleResend} disabled={resending}>
                {resending ? 'sending…' : 'resend OTP'}
              </button>
            )}
          </p>
        </form>
      ) : (
        <div className={styles.form}>
          <span className={`${styles.icon} ${styles.success}`}><FontAwesomeIcon icon={faCircleCheck} /></span>
          <p className={styles.text}>OTP verified successfully. Place your order now to send it to our team.</p>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <Button fullWidth size="lg" onClick={onPlaceOrder} loading={placing}>Confirm &amp; Place Order</Button>
        </div>
      )}
    </Modal>
  );
}
