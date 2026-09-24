import test from 'node:test';
import assert from 'node:assert/strict';

process.env.OTP_SECRET = 'test-otp-secret-that-is-long-enough-1234567890';
const { generateOtp, hashOtp, checkOtp } = await import('../lib/otp/core.js');

const email = 'customer@example.com';
const future = () => new Date(Date.now() + 5 * 60 * 1000);

function record(otp, overrides = {}) {
  return { email, otp_hash: hashOtp(email, otp), expires_at: future(), attempt_count: 0, verified_at: null, ...overrides };
}

test('generates 6 digit numeric OTPs', () => {
  for (let i = 0; i < 50; i += 1) assert.match(generateOtp(), /^\d{6}$/);
});

test('OTP is stored as a hash, never in plain text', () => {
  const hash = hashOtp(email, '123456');
  assert.notEqual(hash, '123456');
  assert.match(hash, /^[a-f0-9]{64}$/);
});

test('valid OTP -> success', () => {
  assert.deepEqual(checkOtp(record('482913'), '482913'), { ok: true });
});

test('expired OTP -> failure', () => {
  const expired = record('482913', { expires_at: new Date(Date.now() - 1000) });
  assert.deepEqual(checkOtp(expired, '482913'), { ok: false, reason: 'EXPIRED' });
});

test('incorrect OTP -> failure', () => {
  assert.deepEqual(checkOtp(record('482913'), '000000'), { ok: false, reason: 'INVALID' });
  assert.deepEqual(checkOtp(record('482913'), 'abc'), { ok: false, reason: 'INVALID' });
});

test('used OTP and too many attempts -> failure', () => {
  assert.equal(checkOtp(record('482913', { verified_at: new Date() }), '482913').reason, 'ALREADY_USED');
  assert.equal(checkOtp(record('482913', { attempt_count: 5 }), '482913').reason, 'TOO_MANY_ATTEMPTS');
  assert.equal(checkOtp(null, '482913').reason, 'NOT_FOUND');
});

test('OTP for one email does not work for another', () => {
  const other = { ...record('482913'), email: 'someone@example.com' };
  assert.equal(checkOtp(other, '482913').ok, false);
});
