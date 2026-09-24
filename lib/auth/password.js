import bcrypt from 'bcryptjs';

const ROUNDS = 12;

export function hashPassword(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain, hash) {
  if (!plain || !hash) return Promise.resolve(false);
  return bcrypt.compare(plain, hash);
}

// Used to keep login timing similar when the email does not exist.
export const DUMMY_HASH = '$2a$12$9yp41APfFAM6iSenlO.WfeOaRSQaqsm.koge1J7M0QlbivgNCRCH.';
