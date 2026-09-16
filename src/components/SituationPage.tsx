import Link from "next/link";
import { eventSituations } from "@/lib/eventSituations";
import { localizedHref } from "@/lib/enPages";
import type { Locale } from "@/lib/i18n";
import BundleGrid from "./BundleGrid";
import GoogleReviews from "./GoogleReviews";
import Footer from "./Footer";
import EventInquiryForm from "./EventInquiryForm";
import styles from "./EventHome.module.css";
export function SituationDirectory({locale="da"}:{locale?:Locale}) {
 const en=locale==="en";
 return <section className={styles.section} id="situationer"><div className={styles.sectionHead}><h2>{en?"What are you planning?":"Hvad skal der ske?"}</h2><p>{en?"Choose the occasion. Find the practical details and two equipment packages for each.":"Vælg situationen. Find de praktiske afklaringer og to udstyrspakker til hver."}</p></div><div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">{eventSituations.map(s=><Link className="border-b border-slate-200 py-5 text-lg font-semibold text-brand-600 hover:underline" key={s.slug} href={localizedHref(`/events/${s.slug}`,locale)}>{s[locale].title} <span aria-hidden>↗</span></Link>)}</div></section>;
}
export default function SituationPage({slug,locale}:{slug:string;locale:Locale}) {
 const s=eventSituations.find(s=>s.slug===slug)!; const c=s[locale];const en=locale==="en";
 return <main className={styles.page} lang={locale}>
 <section className={styles.hero}><div className={styles.heroCopy}><Link href={localizedHref('/eventloesninger',locale)} className={styles.location}>{en?"All event solutions":"Alle eventløsninger"}</Link><h1>{c.title}</h1><p className={styles.lead}>{c.lead}</p><p>{c.body}</p><div className={styles.actions}><a href="#pakker" className={styles.primary}>{en?"Compare packages":"Se de to pakker"}</a><a href="#foresp" className={styles.textLink}>{en?"Get help with the full event":"Få hjælp til hele arrangementet"}</a></div></div><figure className={styles.heroImage}><img src={`/images/events/${s.image}.webp`} width="1200" height="800" alt={en?"Example AV setup":"Eksempel på AV-opstilling"}/><figcaption>{s.image==='reception-front'?(en?"Photo of an actual setup":"Foto af en konkret opstilling"):(en?"Illustrative setup":"Illustreret opstilling")}</figcaption></figure></section>
 <section className={styles.section}><div className={styles.sectionHead}><h2>{en?"Plan the practical details.":"Få styr på det praktiske."}</h2><p>{en?"These details help us choose and position the equipment.":"De her afklaringer hjælper os med at vælge og placere udstyret."}</p></div><ul className="grid gap-5 md:grid-cols-3">{c.check.map(t=><li className="border-l-2 border-brand-500 pl-5 text-lg" key={t}>{t}</li>)}</ul></section>
 <BundleGrid locale={locale} ids={[...s.packageIds]} title={en?"Two starting points for your event":"To udgangspunkter til jeres arrangement"} subtitle={en?"Equipment prices include VAT. Delivery, setup and staffing are selected separately. Final suitability depends on your venue and programme.":"Udstyrspriser inklusive moms. Levering, opsætning og bemanding tilvælges separat. Den endelige løsning afhænger af lokale og program."}/>
 {s.dj&&<section className={styles.equipment}><h2>{en?"Let a DJ take care of the music.":"Lad en DJ tage sig af musikken."}</h2><p>{en?"DJ/music host with DJ booth. Minimum 3 hours. DKK 1,000 per hour before 23:00 and DKK 1,500 after 23:00, including VAT. Sound and lighting are hired separately.":"DJ/musikafvikler med DJ-pult. Minimum 3 timer. 1.000 kr/time før kl. 23 og 1.500 kr/time efter kl. 23, inklusive moms. Lyd og lys lejes separat."}</p><Link className={styles.primary} href={localizedHref('/dj',locale)}>{en?"Choose your DJ hours":"Vælg antal DJ-timer"}</Link></section>}
 <section className={styles.section}><div className={styles.sectionHead}><h2>{en?"Equipment or a complete service?":"Udstyr eller en samlet opgave?"}</h2><p>{en?"Book equipment online, or tell us what you need delivered, set up and operated.":"Book udstyret online, eller fortæl hvad I skal have leveret, sat op og afviklet."}</p></div><p>{en?"For a complete service, the quote specifies delivery, setup, collection and technician time. Access, power, room size and any venue charges are clarified before confirmation.":"Ved en samlet opgave specificerer tilbuddet levering, opsætning, afhentning og teknikertid. Adgang, strøm, lokalets størrelse og eventuelle venuegebyrer afklares før bekræftelse."}</p></section>
 <section id="foresp" className={styles.inquiry}><div><h2>{en?"Tell us about your event":"Fortæl om jeres arrangement"}</h2><p>{c.lead}</p></div><EventInquiryForm locale={locale} initialSituation={slug}/></section>
 <GoogleReviews locale={locale}/><SituationDirectory locale={locale}/><Footer locale={locale}/></main>;
}
