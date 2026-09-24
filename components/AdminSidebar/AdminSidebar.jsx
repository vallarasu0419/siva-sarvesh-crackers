import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faBoxOpen, faArrowUpRightFromSquare, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { SITE_NAME } from '@/constants/config';
import styles from './AdminSidebar.module.css';

const LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: faGauge },
  { href: '/admin/orders', label: 'Orders', icon: faBoxOpen },
];

export default function AdminSidebar({ onLogout, loggingOut, admin }) {
  const { pathname } = useRouter();
  return (
    <aside className={styles.sidebar}>
      <p className={styles.brand}>{SITE_NAME}<span>Admin</span></p>
      <nav aria-label="Admin">
        <ul className={styles.links}>
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link href={link.href} className={`${styles.link} ${active ? styles.active : ''}`} aria-current={active ? 'page' : undefined}>
                  <FontAwesomeIcon icon={link.icon} fixedWidth /> <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <a href="/" target="_blank" rel="noreferrer" className={styles.link}>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} fixedWidth /> <span>View website</span>
            </a>
          </li>
        </ul>
      </nav>
      <div className={styles.footer}>
        {admin && <p className={styles.admin}>{admin.name}<span>{admin.email}</span></p>}
        <button type="button" className={styles.logout} onClick={onLogout} disabled={loggingOut}>
          <FontAwesomeIcon icon={faRightFromBracket} fixedWidth /> <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}
