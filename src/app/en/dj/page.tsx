import type {Metadata} from "next";
import DjProduct from "@/components/DjProduct";
import {localeAlternates} from "@/lib/hreflang";
export const metadata:Metadata={title: "DJ hire Copenhagen — DJ booth included",description:"Minimum 3 hours. DKK 1,000/hour before 23:00 and DKK 1,500/hour after 23:00. VAT included. Choose your hours online.",alternates:{canonical:"https://lejhojtaler.dk/en/dj",languages:localeAlternates("/dj")}};
export default function Page(){return <DjProduct locale="en"/>;}
