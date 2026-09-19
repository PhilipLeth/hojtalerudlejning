"use client";
import {useState} from "react";
import Link from "next/link";
import {DJ_DEFAULT, type DjHours} from "@/lib/dj";
import {bookHref} from "@/lib/bookUrl";
import type {Locale} from "@/lib/i18n";
import DjHoursPicker from "./DjHoursPicker";
import {useProducts} from "@/lib/useProducts";
import {priceDj} from "@/lib/dj";
import DjGearPicker from "./DjGearPicker";
import GoogleReviews from "./GoogleReviews";
import Footer from "./Footer";
import styles from "./EventHome.module.css";
export default function DjProduct({locale="da"}:{locale?:Locale}) {
 const en=locale==='en';const [hours,setHours]=useState<DjHours>(DJ_DEFAULT);
 const [gear,setGear]=useState('dj_pakke_lille');const {rentalProducts}=useProducts();const selectedGear=rentalProducts.find(p=>p.id===gear);const total=priceDj(hours).total+(selectedGear?.price??0);
 const booking=bookHref('dj_musikafvikler',locale).replace('#book',`&djBefore=${hours.before23}&djAfter=${hours.after23}&djGear=${gear}#book`);
 return <main className={styles.page}><section className={styles.hero}><div className={styles.heroCopy}><p className={styles.location}>{en?'Music for your event':'Musik til jeres arrangement'}</p><h1>{en?'DJ & music host':'DJ & musikafvikler'}</h1><p className={styles.lead}>{en?'Enter the hours. Choose the gear. We take care of the music.':'Indtast timerne. Vælg gear. Vi tager os af musikken.'}</p><p>{en?'For Friday bars, receptions and parties. We agree on music style, requests and the schedule before the event. Hire sound and lighting separately or combine the service with an equipment package.':'Til fredagsbar, reception og fest. Vi aftaler musikstil, ønsker og program før arrangementet. Lyd og lys lejes separat eller kombineres med en udstyrspakke.'}</p><DjHoursPicker locale={locale} value={hours} onChange={setHours}/><DjGearPicker value={gear} onChange={setGear} locale={locale}/><p className="mb-4 text-xl font-bold">{en?"DJ + equipment: ":"DJ + gear: "}{total.toLocaleString(en?"en-GB":"da-DK")} {en?"DKK incl. VAT":"kr inkl. moms"}</p><Link className={styles.primary} href={booking}>{en?'Add DJ and equipment to basket':'Læg DJ og gear i kurven'}</Link><p className={styles.note}>{en?'Enter the event address, date and exact start time in your booking. Setup access and travel are agreed separately.':'Angiv adresse, dato og præcist starttidspunkt i bookingen. Adgang til opstilling og transport aftales særskilt.'}</p></div><figure className={styles.heroImage}><img src="/images/product-dj-flx4-white.webp" alt={en?'AlphaTheta XDJ all-in-one DJ system':'AlphaTheta XDJ all-in-one DJ-pult'} width="1024" height="1024" style={{objectFit:"contain",background:"white"}}/><figcaption>{en?'Illustration of the DJ controller in the equipment packages':'Illustration af DJ-pulten i udstyrspakkerne'}</figcaption></figure></section><GoogleReviews locale={locale}/><Footer locale={locale}/></main>;
}
