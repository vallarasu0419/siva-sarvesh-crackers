import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import SocialIcons from '../SocialIcons';
import { BUSINESS, SITE_NAME, MIN_ORDER_AMOUNT } from '@/constants/config';
import { formatRupees } from '@/lib/format';
import styles from './Footer.module.css';

const COMPANY_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products' },
  { href: '/safety-tips', label: 'Safety Tips' },
  { href: '/contact', label: 'Contact' },
];

const CUSTOMER_LINKS = [
  { href: '/#how-to-order', label: 'How to Order' },
  { href: '/#order-information', label: `Minimum Order: ${formatRupees(MIN_ORDER_AMOUNT).replace('.00', '')}` },
  { href: '/#order-information', label: 'Order Information' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.about}>
          <p className={styles.brand}>{SITE_NAME}</p>
          <p className={styles.tagline}>Crackers packed at our Sivakasi unit and shipped to your door across Tamil Nadu.</p>
          <ul className={styles.contact}>
            <li><FontAwesomeIcon icon={faLocationDot} fixedWidth /> <span>{BUSINESS.addressLines.join(' ')}</span></li>
            <li><FontAwesomeIcon icon={faPhone} fixedWidth /> <span>{BUSINESS.phones.map((p) => <a key={p.tel} href={`tel:${p.tel}`}>{p.number}</a>)}</span></li>
            <li><FontAwesomeIcon icon={faEnvelope} fixedWidth /> <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></li>
          </ul>
        </div>
        <nav aria-label="Company">
          <p className={styles.heading}>Company</p>
          <ul className={styles.links}>
            {COMPANY_LINKS.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Customer">
          <p className={styles.heading}>Customer</p>
          <ul className={styles.links}>
            {CUSTOMER_LINKS.map((link) => <li key={link.label}><Link href={link.href}>{link.label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <p className={styles.heading}>Social</p>
          <SocialIcons tone="light" showLabels />
        </div>
      </div>
      <div className={styles.legal}>
        <div className="container">
          <p>
            As per the 2018 Supreme Court order, crackers are not sold online. This website only collects your order enquiry;
            we confirm every order by phone or WhatsApp and ship through licensed transporters as per law.
          </p>
          <p>© 2026 {SITE_NAME}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
