import Head from 'next/head';
import { useRouter } from 'next/router';
import { SITE_NAME, SITE_URL } from '@/constants/config';

const DEFAULT_DESCRIPTION =
  'Siva Sarvesh Crackers, Sivakasi - order Diwali crackers, sparklers, flower pots, rockets, multi-colour shots and gift boxes at factory discount prices.';

/** Page metadata: title, description, canonical, Open Graph and Twitter tags. */
export default function Seo({ title, description = DEFAULT_DESCRIPTION, noIndex = false, image = '/og-image.svg' }) {
  const { asPath } = useRouter();
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Sivakasi Crackers`;
  const url = `${SITE_URL}${asPath.split('?')[0].split('#')[0]}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content="en_IN" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  );
}
