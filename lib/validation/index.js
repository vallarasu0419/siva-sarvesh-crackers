import { isValidLocation } from '../../constants/locations.js';
import { MAX_QUANTITY_PER_ITEM } from '../../constants/config.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns the 10 digit mobile number, or null if it is not a valid Indian mobile. */
export function normalizeIndianMobile(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  let digits = String(value).replace(/[\s\-()]/g, '');
  if (digits.startsWith('+91')) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export const MOBILE_ERROR = 'Enter a valid 10 digit mobile number (numbers only, cannot start with 0).';

/** Order form mobile: exactly 10 digits, starting 6-9 (no +91, spaces or leading 0). */
export function isValidOrderMobile(value) {
  return typeof value === 'string' && /^[6-9]\d{9}$/.test(value);
}

export function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 191 && EMAIL_PATTERN.test(value.trim());
}

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

const clean = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/**
 * Validates customer details for an order.
 * Email is mandatory because order confirmation requires email OTP.
 */
export function validateCustomer(input = {}) {
  const errors = {};
  const value = {
    name: clean(input.name, 120),
    mobile: isValidOrderMobile(input.mobile) ? input.mobile : null,
    email: normalizeEmail(input.email),
    state: clean(input.state, 60),
    city: clean(input.city, 80),
    address: String(input.address ?? '').trim().slice(0, 1000),
  };

  if (value.name.length < 2) errors.name = 'Enter your full name.';
  if (!value.mobile) errors.mobile = MOBILE_ERROR;
  if (!value.email) errors.email = 'Email is required to verify your order.';
  else if (!isValidEmail(value.email)) errors.email = 'Enter a valid email address.';
  if (!value.state) errors.state = 'Select your state.';
  if (!value.city) errors.city = 'Select your city.';
  else if (value.state && !isValidLocation(value.state, value.city)) errors.city = 'Select a city from the list.';
  if (value.address.length < 10) errors.address = 'Enter your full delivery address (door no, street, area, pincode).';

  return { valid: Object.keys(errors).length === 0, errors, value };
}

/**
 * Validates [{ productId, quantity }] from the client.
 * Merges duplicate product IDs; rejects anything that is not a positive integer.
 */
export function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, error: 'Select at least one product.', items: [] };
  }
  const merged = new Map();
  for (const item of items) {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(productId) || productId <= 0) {
      return { valid: false, error: 'One of the selected products is invalid.', items: [] };
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { valid: false, error: 'Quantity must be a whole number of 1 or more.', items: [] };
    }
    const total = (merged.get(productId) || 0) + quantity;
    if (total > MAX_QUANTITY_PER_ITEM) {
      return { valid: false, error: `Quantity cannot exceed ${MAX_QUANTITY_PER_ITEM} per product.`, items: [] };
    }
    merged.set(productId, total);
  }
  return {
    valid: true,
    error: null,
    items: [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity })),
  };
}

export function validateContactMessage(input = {}) {
  const errors = {};
  const value = {
    name: clean(input.name, 120),
    email: normalizeEmail(input.email),
    mobile: normalizeIndianMobile(input.mobile ?? ''),
    message: String(input.message ?? '').trim().slice(0, 2000),
  };
  if (value.name.length < 2) errors.name = 'Enter your name.';
  if (!isValidEmail(value.email)) errors.email = 'Enter a valid email address.';
  if (!value.mobile) errors.mobile = 'Enter a valid 10 digit Indian mobile number.';
  if (value.message.length < 10) errors.message = 'Write a message of at least 10 characters.';
  return { valid: Object.keys(errors).length === 0, errors, value };
}

export function normalizePromotionCode(code) {
  return String(code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 50);
}
