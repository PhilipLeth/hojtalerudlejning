import type {Metadata} from "next";
import DjProduct from "@/components/DjProduct";
import {localeAlternates} from "@/lib/hreflang";
export const metadata:Metadata={title: "DJ og musikafvikler København | Start, slut og anlæg",description:"Sæt start og sluttid. 1.800 kr/time, altid. Levering, opsætning og nedtagning er med. Book online.",alternates:{canonical:"https://lejhojtaler.dk/dj",languages:localeAlternates("/dj")}};
export default function Page(){return <DjProduct locale="da"/>;}
