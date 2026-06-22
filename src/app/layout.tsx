import type { Metadata } from "next";
import Script from "next/script";
import ExitPopup from "@/components/ExitPopup";
import SummerBanner from "@/components/SummerBanner";
import "./globals.css";

const GTM_ID = "GTM-M52R25VF";
const GA_ID = "G-QDXW7S53GF";

export const metadata: Metadata = {
  title: "Lej Højtaler København | Fra 399 kr/weekend | Lejhøjtaler.dk",
  description:
    "Lej højtaler i København fra 399 kr/weekend. PA-anlæg udlejning til fest, event og party. Lydudstyr og festudstyr til leje — hent fredag, aflever mandag. Book online på 2 min.",
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
    title: "Lej Højtaler København | Fra 399 kr/weekend | Lejhøjtaler.dk",
    description:
      "Lej højtaler og PA-anlæg til din fest i København. Lydudstyr udlejning fra 399 kr/weekend. Festudstyr til leje — book online på 2 minutter.",
    url: "https://lejhojtaler.dk",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
  alternates: {
    canonical: "https://lejhojtaler.dk",
    languages: {
      da: "https://lejhojtaler.dk",
      en: "https://lejhojtaler.dk/en",
    },
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
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
        <SummerBanner />
        {children}
        <ExitPopup locale="da" />
      </body>
    </html>
  );
}
