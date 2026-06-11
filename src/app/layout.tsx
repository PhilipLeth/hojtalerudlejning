import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Højtalerudlejning København | Lej højtaler fra 400 kr/weekend",
  description:
    "Lej højtaler i København fra 400 kr/weekend. PA-anlæg udlejning til fest, event og party. Lydudstyr og festudstyr til leje — hent fredag, aflever mandag. Book online på 2 min.",
  keywords: [
    "højtalerudlejning københavn",
    "lej højtaler københavn",
    "lydudstyr udlejning københavn",
    "højtaler leje",
    "PA anlæg udlejning",
    "festudstyr leje københavn",
    "speaker rental copenhagen",
    "højtaler udlejning",
    "lej lydanlæg",
    "festhøjtaler leje",
  ],
  openGraph: {
    title: "Højtalerudlejning København | Lej højtaler fra 400 kr/weekend",
    description:
      "Lej højtaler og PA-anlæg til din fest i København. Lydudstyr udlejning fra 400 kr/weekend. Festudstyr til leje — book online på 2 minutter.",
    url: "https://hojtalerudlejning.dk",
    siteName: "Højtalerudlejning.dk",
    locale: "da_DK",
    type: "website",
  },
  alternates: {
    canonical: "https://hojtalerudlejning.dk",
    languages: {
      "en": "https://hojtalerudlejning.dk",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
