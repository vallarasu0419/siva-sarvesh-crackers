import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faArrowRight, faRotateLeft, faBoxOpen, faTriangleExclamation, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import Seo from '@/components/Seo';
import PageHero from '@/components/PageHero';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';
import ProductTable from '@/components/ProductTable';
import OrderSummary from '@/components/OrderSummary';
import ErrorPopup from '@/components/ErrorPopup';
import ConfirmationModal from '@/components/ConfirmationModal';
import EmptyState from '@/components/EmptyState';
import { useCart } from '@/context/CartContext';
import { useOrderTotals } from '@/context/useOrderTotals';
import { meetsMinimumOrder } from '@/lib/calculations';
import { formatRupees } from '@/lib/format';
import { MIN_ORDER_AMOUNT } from '@/constants/config';
import styles from '@/styles/pages/Products.module.css';

/** Printed price list, served from /public/downloads. Replace the file to update it. */
const PRICE_LIST_PDF = '/downloads/siva-sarvesh-crackers-price-list-2026.pdf';

const SORT_OPTIONS = [
  { value: 'default', label: 'Price list order' },
  { value: 'name', label: 'Name A to Z' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'category', label: 'Category A to Z' },
];

const SORTERS = {
  name: (a, b) => a.productName.localeCompare(b.productName),
  price_asc: (a, b) => a.sellingPrice - b.sellingPrice,
  price_desc: (a, b) => b.sellingPrice - a.sellingPrice,
};

export default function Products({ catalog, loadError }) {
  const router = useRouter();
  const { quantities, setQuantity, clearCart, itemCount } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('default');
  const [popup, setPopup] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const allProducts = useMemo(() => catalog.flatMap((c) => c.products), [catalog]);
  const { totals, savings } = useOrderTotals(allProducts, quantities);

  const visibleCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    let groups = catalog
      .filter((c) => !category || c.slug === category)
      .map((c) => ({
        ...c,
        products: c.products.filter(
          (p) =>
            !term ||
            p.productName.toLowerCase().includes(term) ||
            p.productCode.toLowerCase().includes(term) ||
            (p.tamilName || '').includes(search.trim())
        ),
      }))
      .filter((c) => c.products.length > 0);

    if (SORTERS[sort]) groups = groups.map((c) => ({ ...c, products: [...c.products].sort(SORTERS[sort]) }));
    if (sort === 'category') groups = [...groups].sort((a, b) => a.name.localeCompare(b.name));
    return groups;
  }, [catalog, search, category, sort]);

  const proceed = () => {
    if (itemCount === 0) {
      setPopup('Select at least one product by entering a quantity.');
      return;
    }
    if (!meetsMinimumOrder(totals.totalAmount, MIN_ORDER_AMOUNT)) {
      setPopup(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}.\nPlease add more products to continue.`);
      return;
    }
    router.push('/order');
  };

  const resultCount = visibleCategories.reduce((sum, c) => sum + c.products.length, 0);

  return (
    <>
      <Seo title="Products & Price List" description="Siva Sarvesh Crackers 2026 price list: sparklers, flower pots, chakkars, rockets, bombs, multi-colour shots and gift boxes at up to 80% off." />
      <PageHero
        title="Products & Price List"
        tamilTitle="விலைப் பட்டியல் 2026"
        description={`Enter the quantity for each item. Minimum order is ${formatRupees(MIN_ORDER_AMOUNT)}.`}
        breadcrumb={[{ label: 'Products' }]}
        actions={
          <Button href={PRICE_LIST_PDF} download prefetch={false} variant="light" icon={faFilePdf}>
            Download Price List (PDF)
          </Button>
        }
      />

      <div className={`container ${styles.layout}`}>
        <div className={styles.main}>
          <div className={styles.toolbar} id="price-list">
            <Input
              name="search"
              type="search"
              label="Search"
              placeholder="Product name, code or Tamil name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              prefix={<FontAwesomeIcon icon={faMagnifyingGlass} />}
              className={styles.search}
            />
            <Select
              name="category"
              label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="All categories"
              options={catalog.map((c) => ({ value: c.slug, label: c.name }))}
            />
            <Dropdown label="Sort by" value={sort} options={SORT_OPTIONS} onChange={setSort} />
          </div>

          {loadError ? (
            <EmptyState icon={faTriangleExclamation} title="The price list could not be loaded" message="Refresh the page in a minute. If it keeps happening, call us to place your order." action={<Button onClick={() => router.replace(router.asPath)}>Try again</Button>} />
          ) : resultCount === 0 ? (
            <EmptyState icon={faBoxOpen} title="No products match your search" message="Try a shorter word or choose All categories." action={<Button variant="outline" onClick={() => { setSearch(''); setCategory(''); }}>Clear filters</Button>} />
          ) : (
            <ProductTable categories={visibleCategories} quantities={quantities} onQuantityChange={setQuantity} />
          )}
        </div>

        <aside className={styles.aside}>
          <OrderSummary totals={totals} savings={savings} variant="compact" title="Your order">
            <Button fullWidth onClick={proceed} icon={faArrowRight} iconPosition="end">Proceed to Order</Button>
            {itemCount > 0 && (
              <Button variant="ghost" fullWidth onClick={() => setConfirmClear(true)} icon={faRotateLeft}>Clear all</Button>
            )}
          </OrderSummary>
        </aside>
      </div>

      <div className={styles.mobileBar} role="region" aria-label="Order total">
        <div>
          <span className={styles.mobileLabel}>{totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}, overall</span>
          <span className={`${styles.mobileTotal} money`}>{formatRupees(totals.totalAmount)}</span>
        </div>
        <Button onClick={proceed} icon={faArrowRight} iconPosition="end">Proceed to Order</Button>
      </div>

      <ErrorPopup open={Boolean(popup)} onClose={() => setPopup(null)} title="Cannot continue yet" message={popup} actionLabel="Add more products" />
      <ConfirmationModal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => { clearCart(); setConfirmClear(false); }}
        title="Clear all quantities?"
        message="This removes every product from your order."
        confirmLabel="Clear all"
        tone="danger"
      />
    </>
  );
}

export async function getServerSideProps({ res }) {
  try {
    const { getCatalog } = await import('@/lib/products');
    const catalog = await getCatalog();
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return { props: { catalog: JSON.parse(JSON.stringify(catalog)), loadError: false } };
  } catch (error) {
    console.error('[products] Failed to load catalog:', error.message);
    return { props: { catalog: [], loadError: true } };
  }
}
