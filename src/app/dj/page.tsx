import type {Metadata} from "next";
import DjProduct from "@/components/DjProduct";
import {localeAlternates} from "@/lib/hreflang";
export const metadata:Metadata={title: "DJ og musikafvikler København | Start, slut og anlæg",description:"Sæt start og sluttid. 1.000 kr/time før kl. 23 og 1.500 kr/time efter. Levering, opsætning og nedtagning er med. 20 % højere i julefrokost-perioden. Book online.",alternates:{canonical:"https://lejhojtaler.dk/dj",languages:localeAlternates("/dj")}};
export default function Page(){return <DjProduct locale="da"/>;}
