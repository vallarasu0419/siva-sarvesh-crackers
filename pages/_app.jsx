import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@/styles/globals.css';
import { CartProvider } from '@/context/CartContext';
import Layout from '@/components/Layout';

// Font Awesome CSS is imported above, so stop it injecting styles at runtime.
config.autoAddCss = false;

export default function App({ Component, pageProps }) {
  // Pages can opt out of the public layout (admin pages use AdminLayout).
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return <CartProvider>{getLayout(<Component {...pageProps} />)}</CartProvider>;
}
