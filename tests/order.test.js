import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrderItems, validateCustomer, normalizeIndianMobile } from '../lib/validation/index.js';
import { checkPromotionEligibility } from '../lib/promotions/index.js';

test('no products -> reject', () => {
  assert.equal(validateOrderItems([]).valid, false);
  assert.equal(validateOrderItems(undefined).valid, false);
});

test('invalid quantity -> reject', () => {
  assert.equal(validateOrderItems([{ productId: 1, quantity: 0 }]).valid, false);
  assert.equal(validateOrderItems([{ productId: 1, quantity: -3 }]).valid, false);
  assert.equal(validateOrderItems([{ productId: 1, quantity: 2.5 }]).valid, false);
  assert.equal(validateOrderItems([{ productId: 1, quantity: '4abc' }]).valid, false);
  assert.equal(validateOrderItems([{ productId: 1, quantity: 5000 }]).valid, false);
});

test('invalid product -> reject', () => {
  assert.equal(validateOrderItems([{ productId: 'abc', quantity: 1 }]).valid, false);
  assert.equal(validateOrderItems([{ productId: 0, quantity: 1 }]).valid, false);
  assert.equal(validateOrderItems([{ quantity: 1 }]).valid, false);
});

test('valid items are accepted and duplicates merged', () => {
  const result = validateOrderItems([{ productId: 3, quantity: 2 }, { productId: '3', quantity: 3 }, { productId: 7, quantity: 1 }]);
  assert.equal(result.valid, true);
  assert.deepEqual(result.items, [{ productId: 3, quantity: 5 }, { productId: 7, quantity: 1 }]);
});

test('customer validation requires name, Indian mobile, email, city from list and address', () => {
  const bad = validateCustomer({ state: 'Tamil Nadu', city: 'Atlantis', name: '', mobile: '12345', email: 'x', address: 'short' });
  assert.equal(bad.valid, false);
  assert.deepEqual(Object.keys(bad.errors).sort(), ['address', 'city', 'email', 'mobile', 'name']);

  const good = validateCustomer({ state: 'Tamil Nadu', city: 'Sivakasi', name: 'Ravi Kumar', mobile: '+91 98765 43210', email: 'Ravi@Example.com ', address: '12, North Car Street, Sivakasi 626123' });
  assert.equal(good.valid, true);
  assert.equal(good.value.mobile, '9876543210');
  assert.equal(good.value.email, 'ravi@example.com');
});

test('Indian mobile number normalisation', () => {
  assert.equal(normalizeIndianMobile('9876543210'), '9876543210');
  assert.equal(normalizeIndianMobile('09876543210'), '9876543210');
  assert.equal(normalizeIndianMobile('919876543210'), '9876543210');
  assert.equal(normalizeIndianMobile('5876543210'), null);
  assert.equal(normalizeIndianMobile('98765'), null);
});

test('promotion eligibility is checked on the server', () => {
  const promo = { is_active: 1, min_order_amount: 5000, usage_limit: null, used_count: 0, valid_from: null, valid_until: null };
  assert.equal(checkPromotionEligibility(promo, 6000).ok, true);
  assert.equal(checkPromotionEligibility(promo, 4000).ok, false);
  assert.equal(checkPromotionEligibility({ ...promo, is_active: 0 }, 6000).ok, false);
  assert.equal(checkPromotionEligibility({ ...promo, valid_until: '2020-01-01' }, 6000).ok, false);
  assert.equal(checkPromotionEligibility({ ...promo, usage_limit: 1, used_count: 1 }, 6000).ok, false);
  assert.equal(checkPromotionEligibility(null, 6000).ok, false);
});
