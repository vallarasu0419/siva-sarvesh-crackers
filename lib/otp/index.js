import { query, getPool } from '../db/index.js';
import {
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_MAX_SENDS_PER_WINDOW,
  OTP_SEND_WINDOW_MINUTES,
  VERIFICATION_TOKEN_MINUTES,
} from '../../constants/config.js';
import { generateOtp, hashOtp, checkOtp, generateVerificationToken, hashToken, OTP_ERROR_MESSAGES } from './core.js';
import { sendMail } from '../email/index.js';
import { otpEmail } from '../../emails/otpEmail.js';
import { AppError } from '../api/errors.js';

/** Creates and emails a new OTP. Enforces resend cooldown and a per-email send limit. */
export async function sendOtp(email, ipAddress) {
  const [recent] = await query(
    `SELECT COUNT(*) AS sends, MAX(created_at) AS last_sent
       FROM email_verifications
      WHERE email = ? AND created_at > (NOW() - INTERVAL ? MINUTE)`,
    [email, OTP_SEND_WINDOW_MINUTES]
  );

  if (recent.last_sent) {
    const secondsSince = (Date.now() - new Date(recent.last_sent).getTime()) / 1000;
    if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
      const wait = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSince);
      throw new AppError(429, `Please wait ${wait} seconds before requesting another OTP.`, { retryAfter: wait });
    }
  }
  if (recent.sends >= OTP_MAX_SENDS_PER_WINDOW) {
    throw new AppError(429, `Too many OTP requests. Try again in ${OTP_SEND_WINDOW_MINUTES} minutes.`);
  }

  const otp = generateOtp();
  // Invalidate any earlier unused OTPs for this email.
  await query(
    `UPDATE email_verifications SET expires_at = NOW() WHERE email = ? AND verified_at IS NULL AND expires_at > NOW()`,
    [email]
  );
  await query(
    `INSERT INTO email_verifications (email, otp_hash, expires_at, ip_address)
     VALUES (?, ?, NOW() + INTERVAL ? MINUTE, ?)`,
    [email, hashOtp(email, otp), OTP_EXPIRY_MINUTES, ipAddress || null]
  );

  const message = otpEmail({ otp, expiryMinutes: OTP_EXPIRY_MINUTES });
  await sendMail({ to: email, ...message });

  if (process.env.NODE_ENV !== 'production' && process.env.OTP_DEV_LOG === 'true') {
    console.info(`[dev] OTP for ${email}: ${otp}`);
  }
  return { expiresInSeconds: OTP_EXPIRY_MINUTES * 60, resendAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS };
}

/** Verifies an OTP and returns a single-use verification token for placing the order. */
export async function verifyOtp(email, otp) {
  const [record] = await query(
    `SELECT id, email, otp_hash, expires_at, attempt_count, verified_at
       FROM email_verifications
      WHERE email = ? AND verified_at IS NULL
      ORDER BY id DESC LIMIT 1`,
    [email]
  );

  const result = checkOtp(record, otp);
  if (!result.ok) {
    if (record && result.reason === 'INVALID') {
      await query('UPDATE email_verifications SET attempt_count = attempt_count + 1 WHERE id = ?', [record.id]);
    }
    throw new AppError(400, OTP_ERROR_MESSAGES[result.reason], { reason: result.reason });
  }

  const token = generateVerificationToken();
  // verified_at IS NULL guard makes the OTP single-use even under concurrent requests.
  const [update] = await getPool().execute(
    `UPDATE email_verifications
        SET verified_at = NOW(), verification_token_hash = ?, token_expires_at = NOW() + INTERVAL ? MINUTE
      WHERE id = ? AND verified_at IS NULL`,
    [hashToken(token), VERIFICATION_TOKEN_MINUTES, record.id]
  );
  if (update.affectedRows !== 1) {
    throw new AppError(400, OTP_ERROR_MESSAGES.ALREADY_USED);
  }
  return { verificationToken: token, expiresInMinutes: VERIFICATION_TOKEN_MINUTES };
}

/**
 * Consumes a verification token inside the order transaction.
 * Returns true only if the token belongs to this email, is unexpired and unused.
 */
export async function consumeVerificationToken(connection, email, token) {
  if (!token || typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return false;
  const [result] = await connection.execute(
    `UPDATE email_verifications
        SET consumed_at = NOW()
      WHERE email = ? AND verification_token_hash = ? AND consumed_at IS NULL
        AND verified_at IS NOT NULL AND token_expires_at > NOW()`,
    [email, hashToken(token)]
  );
  return result.affectedRows === 1;
}
