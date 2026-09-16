import type { Metadata } from "next";
import SeasonCampaign from "@/components/SeasonCampaign";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Halloween party rental Copenhagen | Sound, lights and fog",
  description:
    "Hire Halloween packages in Copenhagen: The Witching Hour, Monster Party and the Midnight Club. Sound, lights and fog, book online.",
  alternates: { canonical: "https://lejhojtaler.dk/en/halloween", languages: localeAlternates("/halloween") },
  openGraph: {
    title: "Halloween party rental Copenhagen",
    description: "Three Halloween packages. Book online.",
    url: "https://lejhojtaler.dk/en/halloween",
    images: ["/images/halloween-hero.webp"],
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return <SeasonCampaign seasonId="halloween" locale="en" />;
}
