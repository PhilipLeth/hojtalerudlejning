import EventInquiryForm from "./EventInquiryForm";
import GoogleReviews from "./GoogleReviews";
import SituationDirectory from "./SituationDirectory";
import EventHeroGallery from "./EventHeroGallery";
import ShopPackagePicker from "./ShopPackagePicker";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/enPages";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import Footer from "@/components/Footer";
import styles from "./EventHome.module.css";

export default function EventHome({locale = "da", detail = false, cases = false}: {locale?: Locale; detail?: boolean; cases?: boolean}) {
  const en = locale === "en";
  const href = (p: string) => localizedHref(p, locale);
  return <main className={styles.page} lang={locale}>
    <section className={`${styles.hero} ${styles.shopHero}`}>
      <div className={styles.heroCopy}>
        <p className={styles.location}>{en ? "Sound, light & AV in Copenhagen" : "Lyd, lys & AV i København"}</p>
        <h1>{cases ? (en ? "Technology that fits the room." : "Teknik, der passer ind i rummet.") : detail ? (en ? "Find the right package for your event." : "Find pakken til jeres arrangement.") : (en ? "Sound, light and AV. Ready to book." : "Lyd, lys og AV. Klar til at booke.")}</h1>
        <p className={styles.lead}>{en ? "Choose your occasion, compare packages and book online. From a meeting with a screen to a Friday bar with sound, lights and a DJ." : "Vælg anledning, sammenlign pakker og book online. Fra et møde med skærm til en fredagsbar med lyd, lys og DJ."}</p>
        <div className={styles.actions}><a className={styles.primary} href={detail?"#situationer":"#shop-pakker"}>{en ? "Shop packages" : "Se pakker og priser"}</a><Link className={styles.textLink} href={href("/av-udstyr")}>{en ? "Browse equipment" : "Lej enkeltprodukter"} →</Link></div>
        <p className={styles.heroNote}>{en ? "Prices include VAT. Collect yourself or add delivery." : "Priser inklusive moms. Hent selv eller tilvælg levering."}</p>
      </div>
      <EventHeroGallery locale={locale}/>
    </section>
    <div className={styles.serviceLine}><span>{en ? "Planning & advice" : "Planlægning & rådgivning"}</span><span>{en ? "Delivery & setup" : "Levering & opsætning"}</span><span>{en ? "Soundcheck & handover" : "Lydprøve & gennemgang"}</span><span>{en ? "Technician by agreement" : "Tekniker efter aftale"}</span></div>
    <GoogleReviews locale={locale}/>
    {!detail && !cases && <ShopPackagePicker locale={locale}/>}
    <SituationDirectory locale={locale}/>
    <section id="cases" className={styles.caseSection}>
      <div className={styles.casePhoto}><img src="/images/events/reception-front.webp" alt={en ? "Two EV speakers discreetly placed beside a restaurant bar" : "To EV-højtalere placeret diskret ved en restaurantbar"} width="1200" height="1600" loading="lazy"/></div>
      <div className={styles.caseCopy}><p>{en ? "From a real setup" : "Fra en konkret opstilling"}</p><h2>{en ? "The room comes first." : "Rummet kommer først."}</h2><p>{en ? "Good event sound does not have to dominate the space. Here, two speakers sit beside the bar, with the mixer kept to the side. A simple starting point for music and spoken presentations." : "God eventlyd behøver ikke fylde i indretningen. Her står to højtalere ved baren, mens mixeren er placeret til siden. Et enkelt udgangspunkt for musik og taler."}</p><dl><div><dt>{en ? "The setup" : "Opstillingen"}</dt><dd>{en ? "Two EV speakers on stands and a mixing desk" : "To EV-højtalere på stativer og en mixer"}</dd></div><div><dt>{en ? "The approach" : "Tilgangen"}</dt><dd>{en ? "Placement that works with the room and guest flow" : "Placering med respekt for rum og gæsternes færden"}</dd></div></dl><Link className={styles.textLink} href={href("/events/reception")}>{en ? "Shop reception packages" : "Se pakker til receptionen"} <span aria-hidden>↗</span></Link></div>
    </section>
    <section className={styles.equipment}><h2>{en ? "Choose individual products" : "Vælg enkeltprodukter"}</h2><p>{en ? "Add the equipment you need to your basket." : "Læg det udstyr, I mangler, direkte i kurven."}</p><div>{[["/dj-pult",en?"DJ controllers":"DJ-pulte"],["/dj",en?"DJ/music host":"DJ/musikafvikler"],["/skaerm",en?"Displays":"Skærme"],["/projektor",en?"Projectors":"Projektorer"],["/lej-mikrofon",en?"Microphones":"Mikrofoner"],["/lej-hojtaler",en?"Speakers":"Højtalere"],["/uplights","Uplights"],["/mixer",en?"Mixers":"Mixere"]].map(([p,label])=><Link href={href(p)} key={p}>{label} <span aria-hidden>↗</span></Link>)}</div><p className={styles.note}><Link href={href("/festpakke-150")}>{en ? "Party package 150" : "Festpakke 150"}</Link> · <Link href={href("/festpakke-250")}>{en ? "Party package 250" : "Festpakke 250"}</Link></p></section>
    <section id="foresp" className={styles.shopHelp}><div><h2>{en?"Need help choosing?":"Brug for hjælp til at vælge?"}</h2><p>{en?"We can help with equipment, delivery and setup.":"Vi hjælper gerne med udstyr, levering og opsætning."}</p></div><Link className={styles.textLink} href={href("/kontakt")}>{en?"Contact us":"Kontakt os"}</Link></section>
    {detail && <details id="tilbud" className="mx-auto max-w-3xl px-6 pb-12"><summary className="cursor-pointer text-sm text-brand-600">{en?"Ask about a custom setup":"Spørg om en særlig opstilling"}</summary><EventInquiryForm locale={locale}/></details>}
    <LocalBusinessJsonLd extra={{ description: en ? "Sound, light and AV for events in Copenhagen" : "Lyd, lys og AV til events i København" }}/><Footer locale={locale}/>
  </main>;
}
