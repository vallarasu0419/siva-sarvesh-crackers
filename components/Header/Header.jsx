import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import SocialIcons from '../SocialIcons';
import { useCart } from '@/context/CartContext';
import { SITE_NAME, SITE_TAMIL_NAME } from '@/constants/config';
import styles from './Header.module.css';

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products' },
  { href: '/safety-tips', label: 'Safety Tips' },
  { href: '/contact', label: 'Contact Us' },
];

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, hydrated } = useCart();

  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  const isActive = (href) => (href === '/' ? router.pathname === '/' : router.pathname.startsWith(href));

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label={`${SITE_NAME} home`}>
          <span className={styles.mark} aria-hidden="true">✦</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>{SITE_NAME}</span>
            <span className={`${styles.brandTamil} tamil`}>{SITE_TAMIL_NAME}</span>
          </span>
        </Link>

        <nav id="main-navigation" className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Main">
          <ul className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={`${styles.link} ${isActive(link.href) ? styles.active : ''}`} aria-current={isActive(link.href) ? 'page' : undefined}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.navSocial}>
            <SocialIcons tone="light" />
          </div>
        </nav>

        <div className={styles.actions}>
          <Link href="/order" className={styles.cart} aria-label={`Your order, ${itemCount} products selected`}>
            <FontAwesomeIcon icon={faCartShopping} />
            {hydrated && itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </Link>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
          </button>
        </div>
      </div>
    </header>
  );
}
