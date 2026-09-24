import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

process.env.AUTH_SECRET = 'test-auth-secret-that-is-definitely-longer-than-32-chars';
const { authenticateAdmin } = await import('../lib/auth/authenticate.js');
const { getAdminRedirect } = await import('../lib/auth/routes.js');
const { createSessionToken, verifySessionToken } = await import('../lib/auth/token.js');

const storedAdmin = {
  id: 1,
  name: 'Owner',
  email: 'owner@example.com',
  password_hash: bcrypt.hashSync('correct horse battery', 4),
  is_active: 1,
};
const findAdmin = async (email) => (email === storedAdmin.email ? storedAdmin : null);

test('valid credentials -> login', async () => {
  const admin = await authenticateAdmin('Owner@Example.com', 'correct horse battery', findAdmin);
  assert.deepEqual(admin, { id: 1, name: 'Owner', email: 'owner@example.com' });
  assert.equal(admin.password_hash, undefined);
});

test('invalid credentials -> reject', async () => {
  assert.equal(await authenticateAdmin('owner@example.com', 'wrong password', findAdmin), null);
  assert.equal(await authenticateAdmin('nobody@example.com', 'correct horse battery', findAdmin), null);
  assert.equal(await authenticateAdmin('', '', findAdmin), null);
  const inactive = async () => ({ ...storedAdmin, is_active: 0 });
  assert.equal(await authenticateAdmin('owner@example.com', 'correct horse battery', inactive), null);
});

test('unauthorized admin -> redirect to login', () => {
  assert.equal(getAdminRedirect('/admin/dashboard', false), '/admin/login?next=%2Fadmin%2Fdashboard');
  assert.equal(getAdminRedirect('/admin/orders/5', false), '/admin/login?next=%2Fadmin%2Forders%2F5');
  assert.equal(getAdminRedirect('/admin/login', false), null);
  assert.equal(getAdminRedirect('/admin/dashboard', true), null);
  assert.equal(getAdminRedirect('/admin/login', true), '/admin/dashboard');
  assert.equal(getAdminRedirect('/products', false), null);
});

test('session tokens are signed and tamper-proof', async () => {
  const token = await createSessionToken({ id: 1, name: 'Owner', email: 'owner@example.com' });
  assert.deepEqual(await verifySessionToken(token), { id: 1, name: 'Owner', email: 'owner@example.com' });
  const tampered = `${token.slice(0, -4)}AAAA`;
  assert.equal(await verifySessionToken(tampered), null);
  assert.equal(await verifySessionToken(undefined), null);
});
