import { query } from '../db/index.js';
import { toPaise } from '../calculations/index.js';
import { normalizePromotionCode } from '../validation/index.js';

/**
 * Pure eligibility check (tested without a database).
 * Returns { ok: true } or { ok: false, message }.
 */
export function checkPromotionEligibility(promotion, subtotal, now = new Date()) {
  if (!promotion || !promotion.is_active) return { ok: false, message: 'This promotion code is not valid.' };
  if (promotion.valid_from && new Date(promotion.valid_from) > now) {
    return { ok: false, message: 'This promotion code is not active yet.' };
  }
  if (promotion.valid_until && new Date(promotion.valid_until) < now) {
    return { ok: false, message: 'This promotion code has expired.' };
  }
  if (promotion.usage_limit !== null && promotion.usage_limit !== undefined && promotion.used_count >= promotion.usage_limit) {
    return { ok: false, message: 'This promotion code has reached its usage limit.' };
  }
  if (toPaise(subtotal) < toPaise(promotion.min_order_amount)) {
    return { ok: false, message: `This code needs a minimum order of ₹${Number(promotion.min_order_amount).toFixed(0)}.` };
  }
  return { ok: true };
}

/** Shape used by calculateOrderTotals. */
export function toCalculationPromotion(promotion) {
  return {
    discountType: promotion.discount_type,
    discountValue: Number(promotion.discount_value),
    maxDiscountAmount: promotion.max_discount_amount === null ? null : Number(promotion.max_discount_amount),
  };
}

const PROMO_COLUMNS = `id, code, discount_type, discount_value, min_order_amount, max_discount_amount,
  usage_limit, used_count, valid_from, valid_until, is_active`;

export async function findPromotionByCode(code) {
  const normalized = normalizePromotionCode(code);
  if (!normalized) return null;
  const [promotion] = await query(`SELECT ${PROMO_COLUMNS} FROM promotion_codes WHERE code = ?`, [normalized]);
  return promotion || null;
}

/** Locks the promotion row inside the order transaction. */
export async function findPromotionForUpdate(connection, code) {
  const normalized = normalizePromotionCode(code);
  if (!normalized) return null;
  const [rows] = await connection.execute(`SELECT ${PROMO_COLUMNS} FROM promotion_codes WHERE code = ? FOR UPDATE`, [normalized]);
  return rows[0] || null;
}
