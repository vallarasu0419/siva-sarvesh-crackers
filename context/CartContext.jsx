import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CART_STORAGE_KEY, MAX_QUANTITY_PER_ITEM } from '@/constants/config';

/**
 * Stores selected quantities as { [productId]: quantity }.
 * Prices are NOT stored here - they always come from the database.
 */
const CartContext = createContext(null);

function readStoredCart() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '{}');
    return Object.fromEntries(
      Object.entries(parsed).filter(([id, qty]) => Number.isInteger(Number(id)) && Number.isInteger(qty) && qty > 0)
    );
  } catch {
    return {};
  }
}

export function CartProvider({ children }) {
  const [quantities, setQuantities] = useState({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setQuantities(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(quantities));
    } catch {
      // Storage full or disabled - the cart still works for this visit.
    }
  }, [quantities, hydrated]);

  const setQuantity = useCallback((productId, quantity) => {
    const qty = Math.min(MAX_QUANTITY_PER_ITEM, Math.max(0, Number.parseInt(quantity, 10) || 0));
    setQuantities((current) => {
      const next = { ...current };
      if (qty > 0) next[productId] = qty;
      else delete next[productId];
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setQuantities({}), []);

  const value = useMemo(
    () => ({
      quantities,
      hydrated,
      setQuantity,
      clearCart,
      itemCount: Object.keys(quantities).length,
      /** [{ productId, quantity }] ready for the API. */
      cartItems: Object.entries(quantities).map(([productId, quantity]) => ({ productId: Number(productId), quantity })),
    }),
    [quantities, hydrated, setQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
