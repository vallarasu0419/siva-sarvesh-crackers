import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLineAmount, calculateOrderTotals, calculatePromotionDiscountPaise, meetsMinimumOrder } from '../lib/calculations/index.js';
import { MIN_ORDER_AMOUNT } from '../constants/config.js';

test('amount = selling price x quantity', () => {
  assert.equal(calculateLineAmount(80, 5), 400);
  assert.equal(calculateLineAmount(25, 3), 75);
  assert.equal(calculateLineAmount(0.1, 3), 0.3); // no floating point drift
  assert.equal(calculateLineAmount(80, 0), 0);
  assert.equal(calculateLineAmount(80, -2), 0);
  assert.equal(calculateLineAmount(80, 1.5), 0);
});

test('order totals: subtotal, packing, round off and overall amount', () => {
  const totals = calculateOrderTotals({
    items: [{ sellingPrice: 25, quantity: 100 }, { sellingPrice: 60.5, quantity: 55 }],
    packingChargePercentage: 0,
  });
  assert.equal(totals.subtotal, 5827.5);
  assert.equal(totals.packingCharge, 0);
  assert.equal(totals.roundOff, 0.5);
  assert.equal(totals.totalAmount, 5828);
});

test('packing charge percentage is applied after discount', () => {
  const totals = calculateOrderTotals({
    items: [{ sellingPrice: 1000, quantity: 4 }],
    promotion: { discountType: 'FLAT', discountValue: 500, maxDiscountAmount: null },
    packingChargePercentage: 3,
  });
  assert.equal(totals.subtotal, 4000);
  assert.equal(totals.promotionDiscount, 500);
  assert.equal(totals.packingCharge, 105);
  assert.equal(totals.totalAmount, 3605);
});

test('percentage promotion is capped by max discount and subtotal', () => {
  assert.equal(calculatePromotionDiscountPaise(1_000_000, { discountType: 'PERCENT', discountValue: 5, maxDiscountAmount: 100 }), 10_000);
  assert.equal(calculatePromotionDiscountPaise(10_000, { discountType: 'FLAT', discountValue: 500, maxDiscountAmount: null }), 10_000);
  assert.equal(calculatePromotionDiscountPaise(10_000, null), 0);
});

test('minimum order: below ₹3000 is rejected, ₹3000 and above continues', () => {
  assert.equal(MIN_ORDER_AMOUNT, 3000);
  assert.equal(meetsMinimumOrder(2999.99, MIN_ORDER_AMOUNT), false);
  assert.equal(meetsMinimumOrder(0, MIN_ORDER_AMOUNT), false);
  assert.equal(meetsMinimumOrder(3000, MIN_ORDER_AMOUNT), true);
  assert.equal(meetsMinimumOrder(5800, MIN_ORDER_AMOUNT), true);
});
