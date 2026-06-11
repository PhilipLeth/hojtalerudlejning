import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Højtalerudlejning i København | Fra 400 kr/weekend",
  description:
    "Lej en kraftig højtaler til din fest i København. Party-højtaler (40 pers.) fra 400 kr eller festival-lyd (100 pers.) fra 700 kr. Hent fredag, aflever mandag.",
  openGraph: {
    title: "Højtalerudlejning i København | Fra 400 kr/weekend",
    description:
      "Lej en kraftig højtaler til din fest. Fra 400 kr for en hel weekend. Book online på 2 minutter.",
    url: "https://hojtalerudlejning.dk",
    siteName: "Højtalerudlejning.dk",
    locale: "da_DK",
    type: "website",
  },
  alternates: {
    canonical: "https://hojtalerudlejning.dk",
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
