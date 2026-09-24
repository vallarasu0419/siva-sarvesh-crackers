import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminSidebar from '../AdminSidebar';
import Seo from '../Seo';
import { apiRequest } from '@/lib/api/client';
import styles from './AdminLayout.module.css';

/** Shell for authenticated admin pages. Middleware already blocks unauthenticated access. */
export default function AdminLayout({ title, actions, children }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    apiRequest('/api/auth/me')
      .then((data) => setAdmin(data.admin))
      .catch(() => router.replace(`/admin/login?next=${encodeURIComponent(router.asPath)}`));
  }, [router]);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/admin/login');
    }
  };

  return (
    <div className={styles.shell}>
      <Seo title={`${title} - Admin`} noIndex />
      <AdminSidebar admin={admin} onLogout={logout} loggingOut={loggingOut} />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
        {children}
      </main>
    </div>
  );
}
