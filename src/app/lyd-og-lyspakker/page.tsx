import type { Metadata } from "next";
import LydOgLysPakkerSide from "@/components/LydOgLysPakkerSide";
import { localeAlternates } from "@/lib/hreflang";
import { ogImages } from "@/lib/og";
import { prisKr } from "@/lib/products";

export const metadata: Metadata = {
  title: `Lyd- og lyspakker til fest | Højtalere + lysbar fra ${prisKr("pakke_fest_lille")} | Lejhøjtaler.dk`,
  description:
    "Lej lyd og lys i én pakke i København: højtalere, lysbar og kabler efter antal gæster, billigere end at leje delene hver for sig. Book online, hent i København S eller få det leveret.",
  keywords: ["lyd og lys pakke", "lej lyd og lys", "festpakke leje", "lyd og lys til fest"],
  alternates: { canonical: "https://lejhojtaler.dk/lyd-og-lyspakker", languages: localeAlternates("/lyd-og-lyspakker") },
  openGraph: {
    title: "Lyd- og lyspakker til fest",
    description: "Højtalere, lysbar og kabler i én pakke, efter antal gæster. Book online.",
    url: "https://lejhojtaler.dk/lyd-og-lyspakker",
    images: ogImages("/images/hero/festpakke-stor.webp"),
    locale: "da_DK",
  },
};

export default function Page() {
  return <LydOgLysPakkerSide locale="da" />;
}
