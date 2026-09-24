/**
 * Central business + ordering configuration.
 * Change values here - never hard-code them inside components or API routes.
 */

export const SITE_NAME = 'Siva Sarvesh Crackers';
export const SITE_TAMIL_NAME = 'சிவசர்வேஷ் கிராக்கர்ஸ்';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const BUSINESS = {
  name: SITE_NAME,
  tamilName: SITE_TAMIL_NAME,
  sisterConcern: 'Akkammal Crackers',
  owner: 'P. Muthuraj B.E.',
  addressLines: [
    'Virudhunagar to Sattur Main Road,',
    'Near Ramco Cement Factory,',
    'Sivakasi - 626 119, Tamil Nadu.',
  ],
  phones: [
    { number: '+91 82201 63916', tel: '+918220163916', name: 'Ilamkavi' },
    { number: '+91 63825 94916', tel: '+916382594916', name: 'Muthuraj' },
    { number: '+91 82485 45011', tel: '+918248545011', name: 'Neethirajan' },
  ],
  whatsapp: '918220163916',
  email: 'info@sivasarveshcrackers.com',
  hours: 'Monday to Sunday, 9:00 AM - 9:00 PM (Diwali season)',
  licenseNumber: 'Update with your PESO / explosives licence number',
  mapEmbedUrl:
    'https://www.google.com/maps?q=Ramco+Cement+Factory+Sattur+Road+Sivakasi&output=embed',
};

// ---------- Ordering rules ----------
export const MIN_ORDER_AMOUNT = 3000;
export const PACKING_CHARGE_PERCENTAGE = 0;
export const DEFAULT_DISCOUNT_PERCENTAGE = 80;
export const MAX_QUANTITY_PER_ITEM = 999;
export const DEFAULT_STATE = 'Tamil Nadu';
export const ORDER_NUMBER_PREFIX = 'SSC';

// ---------- OTP ----------
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_VERIFY_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_SENDS_PER_WINDOW = 5;
export const OTP_SEND_WINDOW_MINUTES = 30;
// After OTP verification, the customer has this long to place the order.
export const VERIFICATION_TOKEN_MINUTES = 30;

// ---------- Admin ----------
export const ADMIN_SESSION_HOURS = 12;
export const ADMIN_COOKIE_NAME = 'ssc_admin_session';
export const ADMIN_PAGE_SIZE = 15;

// ---------- Storage keys ----------
export const CART_STORAGE_KEY = 'ssc-cart-v1';
export const LAST_ORDER_STORAGE_KEY = 'ssc-last-order';
