import type {Metadata} from "next";
import DjProduct from "@/components/DjProduct";
import {localeAlternates} from "@/lib/hreflang";
export const metadata:Metadata={title: "DJ og musikafvikler København — DJ-pult inkluderet",description:"Minimum 3 timer. 1.000 kr/time før kl. 23 og 1.500 kr/time efter kl. 23, inklusive moms. Vælg antal timer online.",alternates:{canonical:"https://lejhojtaler.dk/dj",languages:localeAlternates("/dj")}};
export default function Page(){return <DjProduct locale="da"/>;}
