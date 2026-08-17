import type { Metadata } from "next";
import Script from "next/script";
import BurgerMenu from "@/components/BurgerMenu";
import TopBar from "@/components/TopBar";
import SiteHeader from "@/components/SiteHeader";
import BookingDrawer from "@/components/BookingDrawer";
import WeekendSalePopup from "@/components/WeekendSalePopup";
import { localeAlternates } from "@/lib/hreflang";
import { ADS_CONVERSION_ID } from "@/lib/analytics";
import "./globals.css";

const GTM_ID = "GTM-M52R25VF";
const GA_ID = "G-QDXW7S53GF";

export const metadata: Metadata = {
  metadataBase: new URL("https://lejhojtaler.dk"),
  // Hjemmeskærms-appen — se /admin/notifikationer. iOS henter ikonet herfra,
  // når siden lægges på hjemmeskærmen.
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Lejhøjtaler", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  title: "Lej Højtaler København | Fra 345 kr/weekend | Lejhøjtaler.dk",
  description:
    "Lej højtaler i København fra 345 kr/weekend. PA-anlæg udlejning til fest, event og party. Lydudstyr og festudstyr til leje — hent fredag, aflever mandag. Book online på 2 min.",
  keywords: [
    "lej højtaler københavn",
    "højtalerudlejning københavn",
    "lydudstyr udlejning københavn",
    "højtaler leje",
    "PA anlæg udlejning",
    "festudstyr leje københavn",
    "speaker rental copenhagen",
    "højtaler udlejning",
    "lej lydanlæg",
    "festhøjtaler leje",
    "lejhojtaler",
  ],
  openGraph: {
    title: "Lej Højtaler København | Fra 345 kr/weekend | Lejhøjtaler.dk",
    description:
      "Lej højtaler og PA-anlæg til din fest i København. Lydudstyr udlejning fra 345 kr/weekend. Festudstyr til leje — book online på 2 minutter.",
    url: "https://lejhojtaler.dk",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
  // Bemærk: en side der sætter sin egen alternates.canonical erstatter HELE
  // dette objekt og taber languages. Sider med en engelsk tvilling skal derfor
  // sætte begge — se localeAlternates i src/lib/hreflang.ts.
  alternates: {
    canonical: "https://lejhojtaler.dk",
    languages: localeAlternates("/"),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <head>
        {/* The hero is the LCP element on the front page, every product page
            and every occasion page, but it is applied as a CSS background — so
            the browser only discovers it after the stylesheet has parsed and
            laid out. Preloading moves that discovery to the first bytes of the
            document. */}
        <link
          rel="preload"
          as="image"
          href="/images/hero.webp"
          type="image/webp"
          fetchPriority="high"
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        {/* Samme gtag.js betjener flere destinationer — script-URL'en skal blot
            bære ét af id'erne. Uden config-linjen for AW-id'et bliver
            conversion-eventet i trackPurchase tavst kasseret. */}
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
          gtag('config', '${ADS_CONVERSION_ID}');
        `}</Script>
      </head>
      <body className="antialiased">
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}</Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <TopBar />
        <BurgerMenu />
        <SiteHeader />
        {children}
        <BookingDrawer />
        <WeekendSalePopup />
      </body>
    </html>
  );
}
