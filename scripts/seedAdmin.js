/**
 * Creates or updates an admin user. The password is bcrypt-hashed before storage.
 *
 * Usage:
 *   npm run seed:admin                       (prompts for name, email, password)
 *   ADMIN_SEED_EMAIL=... ADMIN_SEED_PASSWORD=... npm run seed:admin
 */
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import mysql from 'mysql2/promise';
import { hashPassword } from '../lib/auth/password.js';
import { isValidEmail } from '../lib/validation/index.js';
import { getDbConfig } from '../lib/db/config.js';

async function ask(rl, question, { hidden = false } = {}) {
  if (!hidden) return (await rl.question(question)).trim();
  // Hide typed characters for the password prompt.
  const original = rl._writeToOutput;
  rl._writeToOutput = (text) => { if (text.includes(question)) original.call(rl, text); else original.call(rl, '*'); };
  const answer = await rl.question(question);
  rl._writeToOutput = original;
  output.write('\n');
  return answer;
}

let dbConfig;
try {
  dbConfig = getDbConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

let name = process.env.ADMIN_SEED_NAME || '';
let email = process.env.ADMIN_SEED_EMAIL || '';
let password = process.env.ADMIN_SEED_PASSWORD || '';

if (!email || !password) {
  const rl = readline.createInterface({ input, output, terminal: true });
  if (!name) name = (await ask(rl, 'Admin name: ')) || 'Admin';
  if (!email) email = await ask(rl, 'Admin email: ');
  if (!password) password = await ask(rl, 'Admin password (min 10 characters): ', { hidden: true });
  rl.close();
}

email = email.trim().toLowerCase();
if (!isValidEmail(email)) {
  console.error('Enter a valid email address.');
  process.exit(1);
}
if (password.length < 10) {
  console.error('Password must be at least 10 characters.');
  process.exit(1);
}

const connection = await mysql.createConnection(dbConfig);
try {
  const passwordHash = await hashPassword(password);
  await connection.execute(
    `INSERT INTO admins (name, email, password_hash, is_active) VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), is_active = 1`,
    [name || 'Admin', email, passwordHash]
  );
  console.log(`Admin ${email} is ready. Log in at /admin/login`);
  if (process.env.ADMIN_SEED_PASSWORD) {
    console.log('Remove ADMIN_SEED_PASSWORD from .env.local now that the admin exists.');
  }
} catch (error) {
  console.error('Could not create admin:', error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
