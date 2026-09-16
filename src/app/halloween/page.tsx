import type { Metadata } from "next";
import SeasonCampaign from "@/components/SeasonCampaign";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Lej Halloween-udstyr København | Heksetimen, Monsterfesten, Midnatsklubben",
  description:
    "Lej Halloween-pakker i København: Heksetimen, Monsterfesten og Midnatsklubben. Lyd, lys og røg, book online.",
  keywords: ["lej halloween udstyr", "halloween højtaler leje", "halloween lys røg københavn"],
  alternates: { canonical: "https://lejhojtaler.dk/halloween", languages: localeAlternates("/halloween") },
  openGraph: {
    title: "Halloween-pakker | Lejhøjtaler.dk",
    description: "Heksetimen, Monsterfesten og Midnatsklubben. Book online.",
    url: "https://lejhojtaler.dk/halloween",
    images: ["/images/halloween-hero.webp"],
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return <SeasonCampaign seasonId="halloween" locale="da" />;
}
