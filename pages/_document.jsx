import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Baloo+Thambi+2:wght@500;700;800&family=Hind+Madurai:wght@400;500;600&family=Noto+Sans+Tamil:wght@400;600&display=swap"
        />
        <meta name="theme-color" content="#1b1446" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
