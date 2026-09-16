import type { Metadata } from "next";
import SituationPage from "@/components/SituationPage";
import { localeAlternates } from "@/lib/hreflang";
export const metadata: Metadata = {"title": "Filmaftener & fællesvisning, lyd, lys og AV i København", "description": "Et stort billede og lyd, der følger med. Til filmklub, fællesvisning og en aften med sport på skærmen. Skærm fungerer i lyse rum; projektion kræver kontrol med lyset. I sørger for indhold og visningsrettigheder.", alternates: { canonical: "https://lejhojtaler.dk/events/filmaften", languages: localeAlternates("/events/filmaften") }};
export default function Page(){return <SituationPage slug="filmaften" locale="da"/>;}
