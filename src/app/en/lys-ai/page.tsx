import type { Metadata } from "next";
import LysAi from "@/components/LysAi";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "See the lights in your venue | AI lighting setup | Lejhøjtaler.dk",
  description:
    "Upload a photo of the room. We place fairy lights, uplights and effects, and you add the setup to the basket. Event lighting rental in Copenhagen.",
  keywords: ["event lighting rental copenhagen", "uplighting rental", "fairy lights hire copenhagen", "AI lighting setup"],
  alternates: { canonical: "https://lejhojtaler.dk/en/lys-ai", languages: localeAlternates("/lys-ai") },
  openGraph: {
    title: "See the lights in your venue | Lejhøjtaler.dk",
    description: "Upload a photo. We visualise fairy lights, uplights and effects, ready to book.",
    url: "https://lejhojtaler.dk/en/lys-ai",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return <LysAi locale="en" />;
}
