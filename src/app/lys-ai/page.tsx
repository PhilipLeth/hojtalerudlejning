import type { Metadata } from "next";
import LysAi from "@/components/LysAi";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Se lyset i jeres lokale | AI-lysopsætning | Lejhøjtaler.dk",
  description:
    "Upload et foto af lokalet. Vi sætter lyskæder, uplights og lyseffekter op, og I lægger setuppet i kurven. Lysudlejning i København.",
  keywords: ["lys til lokale", "uplights leje", "lyskæder leje københavn", "AI lysopsætning"],
  alternates: { canonical: "https://lejhojtaler.dk/lys-ai", languages: localeAlternates("/lys-ai") },
  openGraph: {
    title: "Se lyset i jeres lokale | Lejhøjtaler.dk",
    description: "Upload et foto. Vi visualiserer lyskæder, uplights og effekter, klar til booking.",
    url: "https://lejhojtaler.dk/lys-ai",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return <LysAi locale="da" />;
}
