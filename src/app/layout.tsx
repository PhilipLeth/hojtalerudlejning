import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lej Højtaler København | Fra 400 kr/weekend | Lejhøjtaler.dk",
  description:
    "Lej højtaler i København fra 400 kr/weekend. PA-anlæg udlejning til fest, event og party. Lydudstyr og festudstyr til leje — hent fredag, aflever mandag. Book online på 2 min.",
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
    title: "Lej Højtaler København | Fra 400 kr/weekend | Lejhøjtaler.dk",
    description:
      "Lej højtaler og PA-anlæg til din fest i København. Lydudstyr udlejning fra 400 kr/weekend. Festudstyr til leje — book online på 2 minutter.",
    url: "https://lejhojtaler.dk",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
  alternates: {
    canonical: "https://lejhojtaler.dk",
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
