import { verifyPassword, DUMMY_HASH } from './password.js';

/**
 * Checks admin credentials.
 * findAdminByEmail is injected so this can be unit-tested without a database.
 * Returns the admin (without password hash) or null.
 */
export async function authenticateAdmin(email, password, findAdminByEmail) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) return null;

  const admin = await findAdminByEmail(normalizedEmail);
  const passwordOk = await verifyPassword(String(password), admin?.password_hash || DUMMY_HASH);

  if (!admin || !admin.is_active || !passwordOk) return null;
  return { id: admin.id, name: admin.name, email: admin.email };
}
