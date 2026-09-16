"use client";
import {useState} from "react";
import Link from "next/link";
import {DJ_DEFAULT, type DjHours} from "@/lib/dj";
import {bookHref} from "@/lib/bookUrl";
import type {Locale} from "@/lib/i18n";
import DjHoursPicker from "./DjHoursPicker";
import GoogleReviews from "./GoogleReviews";
import Footer from "./Footer";
import styles from "./EventHome.module.css";
export default function DjProduct({locale="da"}:{locale?:Locale}) {
 const en=locale==='en';const [hours,setHours]=useState<DjHours>(DJ_DEFAULT);
 const booking=bookHref('dj_musikafvikler',locale).replace('#book',`&djBefore=${hours.before23}&djAfter=${hours.after23}#book`);
 return <main className={styles.page}><section className={styles.hero}><div className={styles.heroCopy}><p className={styles.location}>{en?'Music for your event':'Musik til jeres arrangement'}</p><h1>{en?'DJ & music host':'DJ & musikafvikler'}</h1><p className={styles.lead}>{en?'A person to take care of the music — with a DJ booth included.':'En person, der tager sig af musikken — med DJ-pult inkluderet.'}</p><p>{en?'For Friday bars, receptions and parties. We agree on music style, requests and the schedule before the event. Hire sound and lighting separately or combine the service with an equipment package.':'Til fredagsbar, reception og fest. Vi aftaler musikstil, ønsker og program før arrangementet. Lyd og lys lejes separat eller kombineres med en udstyrspakke.'}</p><DjHoursPicker locale={locale} value={hours} onChange={setHours}/><Link className={styles.primary} href={booking}>{en?'Book your selected DJ hours':'Book de valgte DJ-timer'}</Link><p className={styles.note}>{en?'Enter the event address, date and exact start time in your booking. Setup access and travel are agreed separately.':'Angiv adresse, dato og præcist starttidspunkt i bookingen. Adgang til opstilling og transport aftales særskilt.'}</p></div><figure className={styles.heroImage}><img src="/images/product-dj.webp" alt={en?'DJ booth with controller, headphones and laptop':'DJ-pult med controller, hovedtelefoner og computer'} width="1024" height="1024"/><figcaption>{en?'Illustration of the included DJ setup':'Illustration af den medfølgende DJ-opstilling'}</figcaption></figure></section><GoogleReviews locale={locale}/><Footer locale={locale}/></main>;
}
