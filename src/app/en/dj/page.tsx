import type {Metadata} from "next";
import DjProduct from "@/components/DjProduct";
import {localeAlternates} from "@/lib/hreflang";
export const metadata:Metadata={title: "DJ hire Copenhagen | Start, finish and sound system",description:"Set start and finish. DKK 1,800/hour, always. Delivery, setup and collection included. Book online.",alternates:{canonical:"https://lejhojtaler.dk/en/dj",languages:localeAlternates("/dj")}};
export default function Page(){return <DjProduct locale="en"/>;}
