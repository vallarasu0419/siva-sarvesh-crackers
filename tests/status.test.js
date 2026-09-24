import test from 'node:test';
import assert from 'node:assert/strict';
import { ORDER_STATUSES, INITIAL_ORDER_STATUS, isValidStatus, STATUS_LABELS } from '../lib/orders/status.js';

test('the four allowed statuses', () => {
  assert.deepEqual(ORDER_STATUSES, ['PENDING', 'PICKED_UP', 'DELIVERED', 'REJECTED']);
  ORDER_STATUSES.forEach((status) => {
    assert.equal(isValidStatus(status), true);
    assert.ok(STATUS_LABELS[status]);
  });
});

test('new orders start as PENDING', () => {
  assert.equal(INITIAL_ORDER_STATUS, 'PENDING');
});

test('unknown statuses are rejected', () => {
  ['SHIPPED', 'pending', '', undefined, null].forEach((status) => assert.equal(isValidStatus(status), false));
});
