import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { faCartShopping, faTrashCan, faArrowLeft, faLock, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Seo from '@/components/Seo';
import PageHero from '@/components/PageHero';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import QuantityInput from '@/components/QuantityInput';
import OrderSummary from '@/components/OrderSummary';
import OtpDialog from '@/components/OtpDialog';
import ErrorPopup from '@/components/ErrorPopup';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { useCart } from '@/context/CartContext';
import { useOrderTotals } from '@/context/useOrderTotals';
import { validateCustomer, isValidOrderMobile, MOBILE_ERROR } from '@/lib/validation';
import { meetsMinimumOrder, calculateLineAmount } from '@/lib/calculations';
import { formatRupees } from '@/lib/format';
import { apiRequest } from '@/lib/api/client';
import { STATES, getCitiesForState } from '@/constants/locations';
import { DEFAULT_STATE, MIN_ORDER_AMOUNT, LAST_ORDER_STORAGE_KEY, OTP_RESEND_COOLDOWN_SECONDS } from '@/constants/config';
import styles from '@/styles/pages/Order.module.css';

const EMPTY_CUSTOMER = { state: DEFAULT_STATE, city: '', name: '', mobile: '', email: '', address: '' };

export default function OrderPage() {
  const router = useRouter();
  const { quantities, setQuantity, cartItems, clearCart, hydrated } = useCart();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [errors, setErrors] = useState({});

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, totals } from the server

  const [otpState, setOtpState] = useState({ open: false, verified: false, token: null, error: '' });
  const [busy, setBusy] = useState({ sending: false, verifying: false, resending: false, placing: false });
  const [popup, setPopup] = useState(null);
  const placedRef = useRef(false);

  useEffect(() => {
    apiRequest('/api/products')
      .then((data) => setProducts(data.products))
      .catch(() => setLoadError(true))
      .finally(() => setLoadingProducts(false));
  }, []);

  const { selected, totals: clientTotals, savings } = useOrderTotals(products, quantities);
  // With a promotion applied, show the server's figures (the discount is never calculated in the browser).
  const totals = appliedPromo?.totals || clientTotals;
  const cities = useMemo(() => getCitiesForState(customer.state), [customer.state]);
  const itemsKey = JSON.stringify(cartItems);

  // Re-check the promotion on the server whenever quantities change.
  useEffect(() => {
    if (!appliedPromo) return undefined;
    const timer = setTimeout(async () => {
      try {
        const quote = await apiRequest('/api/promotions/validate', { method: 'POST', body: { code: appliedPromo.code, items: cartItems } });
        setAppliedPromo({ code: quote.promotionCode, totals: quote.totals });
      } catch (error) {
        setAppliedPromo(null);
        setPromoError(error.message);
      }
    }, 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  const update = (field) => (event) => {
    const value = event.target.value;
    setCustomer((current) => ({ ...current, [field]: value, ...(field === 'state' ? { city: '' } : {}) }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const applyPromo = async () => {
    setPromoError('');
    setApplyingPromo(true);
    try {
      const quote = await apiRequest('/api/promotions/validate', { method: 'POST', body: { code: promoInput, items: cartItems } });
      setAppliedPromo({ code: quote.promotionCode, totals: quote.totals });
    } catch (error) {
      setPromoError(error.message);
    } finally {
      setApplyingPromo(false);
    }
  };

  const sendOtp = useCallback(async () => {
    await apiRequest('/api/otp/send', { method: 'POST', body: { email: customer.email } });
  }, [customer.email]);

  // Steps 1-6: validate, then email the OTP and open the verification dialog.
  const submit = async (event) => {
    event.preventDefault();
    const check = validateCustomer(customer);
    if (!check.valid) {
      setErrors(check.errors);
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    if (cartItems.length === 0) {
      setPopup({ title: 'No products selected', message: 'Select at least one product before placing an order.' });
      return;
    }
    if (!meetsMinimumOrder(totals.totalAmount, MIN_ORDER_AMOUNT)) {
      setPopup({ title: 'Cannot continue yet', message: `Minimum order amount is ₹${MIN_ORDER_AMOUNT}.\nPlease add more products to continue.` });
      return;
    }
    if (otpState.verified && otpState.token) {
      setOtpState((s) => ({ ...s, open: true, error: '' }));
      return;
    }
    setBusy((b) => ({ ...b, sending: true }));
    try {
      await sendOtp();
      setOtpState({ open: true, verified: false, token: null, error: '' });
    } catch (error) {
      setPopup({ title: 'Could not send OTP', message: error.message });
    } finally {
      setBusy((b) => ({ ...b, sending: false }));
    }
  };

  const resendOtp = async () => {
    setBusy((b) => ({ ...b, resending: true }));
    try {
      await sendOtp();
      setOtpState((s) => ({ ...s, error: '' }));
      return true;
    } catch (error) {
      setOtpState((s) => ({ ...s, error: error.message }));
      return false;
    } finally {
      setBusy((b) => ({ ...b, resending: false }));
    }
  };

  // Steps 7-8: verify on the server.
  const verifyOtp = async (otp) => {
    setBusy((b) => ({ ...b, verifying: true }));
    try {
      const data = await apiRequest('/api/otp/verify', { method: 'POST', body: { email: customer.email, otp } });
      setOtpState({ open: true, verified: true, token: data.verificationToken, error: '' });
    } catch (error) {
      setOtpState((s) => ({ ...s, error: error.message }));
    } finally {
      setBusy((b) => ({ ...b, verifying: false }));
    }
  };

  // Steps 9-12: place the order. The server re-prices everything and sends the emails.
  const placeOrder = async () => {
    if (placedRef.current) return;
    placedRef.current = true;
    setBusy((b) => ({ ...b, placing: true }));
    try {
      const data = await apiRequest('/api/orders', {
        method: 'POST',
        body: { customer, items: cartItems, promotionCode: appliedPromo?.code || null, verificationToken: otpState.token },
      });
      try {
        window.sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(data.order));
      } catch {
        // Confirmation page falls back to a generic message.
      }
      clearCart();
      router.replace(`/order-confirmation?order=${encodeURIComponent(data.order.orderNumber)}`);
    } catch (error) {
      placedRef.current = false;
      if (error.details?.reason === 'VERIFICATION_REQUIRED') {
        setOtpState({ open: false, verified: false, token: null, error: '' });
      } else if (error.fields) {
        setErrors(error.fields);
        setOtpState((s) => ({ ...s, open: false }));
      } else {
        setOtpState((s) => ({ ...s, open: false }));
      }
      setPopup({ title: 'Unable to place your order', message: `${error.message}\nPlease try again.` });
    } finally {
      setBusy((b) => ({ ...b, placing: false }));
    }
  };

  const loading = !hydrated || loadingProducts;

  return (
    <>
      <Seo title="Place Your Order" description="Enter your delivery details and verify your email to send your order to Siva Sarvesh Crackers." noIndex />
      <PageHero title="Place Your Order" tamilTitle="ஆர்டர் செய்ய" breadcrumb={[{ label: 'Products', href: '/products' }, { label: 'Order' }]} />

      <div className="section-tight"><div className="container">
        {loading ? (
          <LoadingSpinner size="lg" label="Loading your order" />
        ) : loadError ? (
          <EmptyState icon={faTriangleExclamation} title="Prices could not be loaded" message="Check your connection and refresh the page." action={<Button onClick={() => router.reload()}>Refresh</Button>} />
        ) : selected.length === 0 ? (
          <EmptyState icon={faCartShopping} title="Your order is empty" message="Add quantities on the price list to start an order." action={<Button href="/products">Go to the price list</Button>} />
        ) : (
          <form className={styles.layout} onSubmit={submit} noValidate>
            <div className={styles.main}>
              <section className={styles.card} aria-labelledby="items-heading">
                <div className={styles.cardHeader}>
                  <h2 id="items-heading">Selected products</h2>
                  <Link href="/products" className={styles.backLink}><FontAwesomeIcon icon={faArrowLeft} /> Add more</Link>
                </div>
                <ul className={styles.items}>
                  {selected.map((product) => (
                    <li key={product.id} className={styles.item}>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{product.productName}</span>
                        <span className="tamil muted">{product.tamilName}</span>
                        <span className={`${styles.itemRate} money`}>{formatRupees(product.sellingPrice)} per {product.unit.replace(/^1\s*/, '').toLowerCase()}</span>
                      </div>
                      <QuantityInput compact value={quantities[product.id]} label={product.productName} onChange={(qty) => setQuantity(product.id, qty)} />
                      <output className={`${styles.itemAmount} money`}>{formatRupees(calculateLineAmount(product.sellingPrice, quantities[product.id]))}</output>
                      <button type="button" className={styles.remove} onClick={() => setQuantity(product.id, 0)} aria-label={`Remove ${product.productName}`}>
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={styles.card} aria-labelledby="customer-heading">
                <h2 id="customer-heading">Customer details</h2>
                <div className="form-grid">
                  <Select label="State" name="state" required options={STATES} value={customer.state} onChange={update('state')} error={errors.state} />
                  <Select label="City" name="city" required options={cities} placeholder="Select city" value={customer.city} onChange={update('city')} error={errors.city} />
                  <Input label="Name" name="name" required value={customer.name} onChange={update('name')} error={errors.name} autoComplete="name" />
                  <Input
                    label="Mobile No."
                    name="mobile"
                    required
                    value={customer.mobile}
                    onChange={(event) => {
                      // Digits only, no leading 0, at most 10 digits.
                      const digits = event.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10);
                      update('mobile')({ target: { value: digits } });
                    }}
                    onBlur={() => {
                      if (customer.mobile && !isValidOrderMobile(customer.mobile)) {
                        setErrors((current) => ({ ...current, mobile: MOBILE_ERROR }));
                      }
                    }}
                    error={errors.mobile}
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    autoComplete="tel-national"
                    prefix="+91"
                    maxLength={10}
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    required
                    value={customer.email}
                    onChange={(event) => { update('email')(event); setOtpState({ open: false, verified: false, token: null, error: '' }); }}
                    error={errors.email}
                    autoComplete="email"
                    hint="We email a one-time password to confirm your order."
                    className="span-2"
                  />
                  <Input label="Address" name="address" required multiline value={customer.address} onChange={update('address')} error={errors.address} autoComplete="street-address" hint="Door no, street, area, landmark and pincode" className="span-2" />
                </div>
              </section>
            </div>

            <aside className={styles.aside}>
              <OrderSummary
                totals={totals}
                savings={savings}
                promotion={{
                  code: promoInput,
                  onCodeChange: (value) => { setPromoInput(value); setPromoError(''); },
                  onApply: applyPromo,
                  onRemove: () => { setAppliedPromo(null); setPromoInput(''); },
                  applying: applyingPromo,
                  appliedCode: appliedPromo?.code,
                  error: promoError,
                }}
              >
                <Button type="submit" size="lg" fullWidth loading={busy.sending} icon={faLock}>Submit</Button>
                <p className={styles.note}>Final amount is calculated from our current prices. We call you to confirm before taking payment.</p>
              </OrderSummary>
            </aside>
          </form>
        )}
      </div></div>

      <OtpDialog
        open={otpState.open}
        email={customer.email}
        verified={otpState.verified}
        error={otpState.error}
        resendAfter={OTP_RESEND_COOLDOWN_SECONDS}
        verifying={busy.verifying}
        resending={busy.resending}
        placing={busy.placing}
        onVerify={verifyOtp}
        onResend={resendOtp}
        onPlaceOrder={placeOrder}
        onClose={() => setOtpState((s) => ({ ...s, open: false, error: '' }))}
      />
      <ErrorPopup open={Boolean(popup)} onClose={() => setPopup(null)} title={popup?.title} message={popup?.message} />
    </>
  );
}
