import Header from '../Header';
import Footer from '../Footer';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skip}>Skip to content</a>
      <Header />
      <main id="main-content" className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
