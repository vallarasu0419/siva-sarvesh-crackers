import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAward, faIndianRupeeSign, faLayerGroup, faBoxesPacking, faHeadset, faShieldHeart, faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import Seo from '@/components/Seo';
import Button from '@/components/Button';
import FireworksArt from '@/components/FireworksArt';
import SocialIcons from '@/components/SocialIcons';
import { getCategoryIcon } from '@/components/ProductTable/productIcons';
import { BUSINESS, MIN_ORDER_AMOUNT, DEFAULT_DISCOUNT_PERCENTAGE, SITE_TAMIL_NAME } from '@/constants/config';
import { formatRupees } from '@/lib/format';
import styles from '@/styles/pages/Home.module.css';

const REASONS = [
  { icon: faAward, title: 'Quality products', text: 'Every item is made and packed in Sivakasi and checked before it leaves our unit.' },
  { icon: faIndianRupeeSign, title: 'Competitive pricing', text: `Up to ${DEFAULT_DISCOUNT_PERCENTAGE}% off the printed list price, with the final rate shown before you order.` },
  { icon: faLayerGroup, title: 'Wide product selection', text: 'More than 200 items across 20 categories, from kids specials to 240 shot aerials.' },
  { icon: faBoxesPacking, title: 'Safe packaging', text: 'Orders are packed in sealed cartons and sent through licensed transporters.' },
  { icon: faHeadset, title: 'Reliable service', text: 'A real person calls you to confirm every order, payment and delivery date.' },
];

const STEPS = [
  { title: 'Choose your crackers', text: 'Enter quantities on the price list. Totals update as you type.' },
  { title: 'Enter delivery details', text: 'Name, mobile number, email and full address.' },
  { title: 'Verify your email', text: 'Type the OTP we email you, then place the order.' },
  { title: 'Confirm by phone', text: 'We call or WhatsApp within 24 hours to confirm stock and take payment by GPay or PhonePe.' },
  { title: 'Receive your parcel', text: 'Your order is dispatched through a licensed transporter to your city.' },
];

export default function Home({ categories }) {
  return (
    <>
      <Seo title="Sivakasi Crackers" description="Order Diwali crackers directly from Sivakasi. 200+ products at up to 80% off list price, delivered across Tamil Nadu." />

      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={`${styles.heroTamil} tamil`}>{SITE_TAMIL_NAME}</p>
            <h1 className={styles.heroTitle}>Sivakasi crackers, sent straight from our factory road.</h1>
            <p className={styles.heroText}>
              Pick from over 200 crackers at up to {DEFAULT_DISCOUNT_PERCENTAGE}% off the list price.
              Send your order online and we call you to confirm.
            </p>
            <div className={styles.heroActions}>
              <Button href="/products" size="lg" variant="light">Shop Now</Button>
              <Button href="/products#price-list" size="lg" variant="outline" className={styles.heroOutline}>View Products</Button>
            </div>
          </div>
          <div className={styles.heroArt}>
            <FireworksArt />
            <div className={styles.label}>
              <span className={styles.labelTop}>Diwali 2026 price list</span>
              <span className={styles.labelBig}>{DEFAULT_DISCOUNT_PERCENTAGE}% off</span>
              <span className={styles.labelBottom}>on list price</span>
              <span className={styles.labelBottom}>Minimum order {formatRupees(MIN_ORDER_AMOUNT).replace('.00', '')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2>Shop by category</h2>
            <p>Jump straight to the part of the price list you need.</p>
          </div>
          <ul className={styles.categories}>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/products#category-${category.slug}`} className={styles.category}>
                  <span className={styles.categoryIcon}><FontAwesomeIcon icon={getCategoryIcon(category.slug)} /></span>
                  <span className={styles.categoryText}>
                    <span className={styles.categoryName}>{category.name}</span>
                    <span className={`${styles.categoryTamil} tamil`}>{category.tamilName}</span>
                  </span>
                  <span className={styles.categoryCount}>{category.productCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`section ${styles.reasonsSection}`}>
        <div className={`container ${styles.reasonsGrid}`}>
          <div>
            <h2>Why families across Tamil Nadu order from us</h2>
            <p className="muted">
              {BUSINESS.name} and our sister concern {BUSINESS.sisterConcern} work from Sivakasi, the home of Indian fireworks.
            </p>
          </div>
          <ul className={styles.reasons}>
            {REASONS.map((reason) => (
              <li key={reason.title} className={styles.reason}>
                <FontAwesomeIcon icon={reason.icon} className={styles.reasonIcon} fixedWidth />
                <div>
                  <h3>{reason.title}</h3>
                  <p>{reason.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="how-to-order">
        <div className="container">
          <div className="section-heading">
            <h2>How to order</h2>
            <p>Five steps from price list to doorstep.</p>
          </div>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-tight" id="order-information">
        <div className={`container ${styles.infoGrid}`}>
          <div className={styles.infoBlock}>
            <h2>Order information</h2>
            <ul>
              <li>Minimum order value is <strong>{formatRupees(MIN_ORDER_AMOUNT)}</strong>.</li>
              <li>We currently deliver within Tamil Nadu. Transport charges are paid at the delivery point.</li>
              <li>Payment is taken only after we confirm your order by phone.</li>
              <li>Gift boxes are sold at net rate; all other items get the listed discount.</li>
            </ul>
          </div>
          <div className={styles.safety}>
            <FontAwesomeIcon icon={faShieldHeart} className={styles.safetyIcon} />
            <h2>Celebrate safely</h2>
            <p>Light crackers in open spaces, keep water and sand nearby, and let an adult supervise children.</p>
            <Link href="/safety-tips" className={styles.safetyLink}>
              Read the safety tips <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className={`container ${styles.social}`}>
          <div>
            <h2>See this year&apos;s crackers in action</h2>
            <p className="muted">Product videos, new arrivals and Diwali offers on our channels.</p>
          </div>
          <SocialIcons tone="dark" size="lg" showLabels />
        </div>
      </section>
    </>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  try {
    const { getCategories } = await import('@/lib/products');
    const categories = await getCategories();
    return { props: { categories: categories.map((c) => ({ ...c, productCount: Number(c.productCount) })) } };
  } catch (error) {
    console.error('[home] Falling back to static categories:', error.message);
    const { getFallbackCategories } = await import('@/lib/products/fallbackCategories');
    return { props: { categories: getFallbackCategories() } };
  }
}
