import { useMemo } from 'react';
import { calculateOrderTotals, calculateSavings } from '@/lib/calculations';
import { PACKING_CHARGE_PERCENTAGE } from '@/constants/config';

/**
 * Display-only totals for the selected products.
 * The server recalculates everything from database prices when the order is placed.
 */
export function useOrderTotals(products, quantities, promotion = null) {
  return useMemo(() => {
    const selected = products
      .filter((product) => quantities[product.id] > 0)
      .map((product) => ({ ...product, quantity: quantities[product.id] }));
    return {
      selected,
      totals: calculateOrderTotals({ items: selected, promotion, packingChargePercentage: PACKING_CHARGE_PERCENTAGE }),
      savings: calculateSavings(selected),
    };
  }, [products, quantities, promotion]);
}
