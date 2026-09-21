import type {Metadata} from "next";
import DjProduct from "@/components/DjProduct";
import {prisKr} from "@/lib/products";
import {localeAlternates} from "@/lib/hreflang";
export const metadata:Metadata={title: "DJ og musikafvikler København | Start, slut og anlæg",description:`Sæt start og sluttid. ${prisKr("dj_musikafvikler")}/time, altid. Levering, opsætning og nedtagning er med. Book online.`,alternates:{canonical:"https://lejhojtaler.dk/dj",languages:localeAlternates("/dj")}};
export default function Page(){return <DjProduct locale="da"/>;}
