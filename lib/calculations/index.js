/**
 * Pure price calculations shared by the browser (display only) and the
 * server (source of truth). All maths is done in integer paise to avoid
 * floating point errors.
 */

export const toPaise = (rupees) => Math.round(Number(rupees || 0) * 100);
export const toRupees = (paise) => Math.round(paise) / 100;

/** Line amount = selling price x quantity (in rupees). */
export function calculateLineAmount(sellingPrice, quantity) {
  const qty = Number.isInteger(quantity) && quantity > 0 ? quantity : 0;
  return toRupees(toPaise(sellingPrice) * qty);
}

/**
 * Promotion discount in paise for a subtotal in paise.
 * promotion: { discountType: 'PERCENT' | 'FLAT', discountValue, maxDiscountAmount }
 */
export function calculatePromotionDiscountPaise(subtotalPaise, promotion) {
  if (!promotion || subtotalPaise <= 0) return 0;
  let discount = 0;
  if (promotion.discountType === 'PERCENT') {
    discount = Math.floor((subtotalPaise * Number(promotion.discountValue)) / 100);
  } else if (promotion.discountType === 'FLAT') {
    discount = toPaise(promotion.discountValue);
  }
  if (promotion.maxDiscountAmount !== null && promotion.maxDiscountAmount !== undefined) {
    discount = Math.min(discount, toPaise(promotion.maxDiscountAmount));
  }
  return Math.max(0, Math.min(discount, subtotalPaise));
}

/**
 * Full order totals.
 * items: [{ sellingPrice, quantity }]
 * Returns rupee values: subtotal, promotionDiscount, packingCharge, roundOff, totalAmount.
 */
export function calculateOrderTotals({ items = [], promotion = null, packingChargePercentage = 0 }) {
  const subtotalPaise = items.reduce(
    (sum, item) => sum + toPaise(calculateLineAmount(item.sellingPrice, item.quantity)),
    0
  );
  const discountPaise = calculatePromotionDiscountPaise(subtotalPaise, promotion);
  const afterDiscount = subtotalPaise - discountPaise;
  const packingPaise = Math.round((afterDiscount * Number(packingChargePercentage || 0)) / 100);
  const rawTotal = afterDiscount + packingPaise;
  const roundedTotal = Math.round(rawTotal / 100) * 100;

  return {
    itemCount: items.filter((item) => item.quantity > 0).length,
    totalQuantity: items.reduce((sum, item) => sum + (item.quantity > 0 ? item.quantity : 0), 0),
    subtotal: toRupees(subtotalPaise),
    promotionDiscount: toRupees(discountPaise),
    packingChargePercentage: Number(packingChargePercentage || 0),
    packingCharge: toRupees(packingPaise),
    roundOff: toRupees(roundedTotal - rawTotal),
    totalAmount: toRupees(roundedTotal),
  };
}

/** Savings compared with the printed list price (for display). */
export function calculateSavings(items = []) {
  const paise = items.reduce(
    (sum, item) =>
      sum + (toPaise(item.originalPrice) - toPaise(item.sellingPrice)) * (item.quantity > 0 ? item.quantity : 0),
    0
  );
  return toRupees(Math.max(0, paise));
}

export function meetsMinimumOrder(amount, minimum) {
  return toPaise(amount) >= toPaise(minimum);
}
