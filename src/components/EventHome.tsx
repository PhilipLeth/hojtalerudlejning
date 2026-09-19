import EventInquiryForm from "./EventInquiryForm";
import GoogleReviews from "./GoogleReviews";
import SituationDirectory from "./SituationDirectory";
import EventHeroGallery from "./EventHeroGallery";
import ShopPackagePicker from "./ShopPackagePicker";
import SeasonalStrip from "./SeasonalStrip";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/enPages";
import LocalBusinessJsonLd from "./LocalBusinessJsonLd";
import Footer from "./Footer";
import styles from "./EventHome.module.css";

const EQUIPMENT = [
  ["/dj-pult", "DJ-pulte", "DJ controllers"],
  ["/skaerm", "Skærme", "Displays"],
  ["/projektor", "Projektorer", "Projectors"],
  ["/lej-mikrofon", "Mikrofoner", "Microphones"],
  ["/lej-hojtaler", "Højtalere", "Speakers"],
  ["/festlys", "Lys", "Lighting"],
  ["/uplights", "Uplights", "Uplights"],
  ["/mixer", "Mixere", "Mixers"],
] as const;

export default function EventHome({locale = "da", detail = false, cases = false}: {locale?: Locale; detail?: boolean; cases?: boolean}) {
  const en = locale === "en";
  const href = (p: string) => localizedHref(p, locale);

  if (cases) {
    return <main className={styles.page} lang={locale}>
      <section className={`${styles.hero} ${styles.compactHero}`}>
        <div className={styles.heroCopy}>
          <p className={styles.location}>{en ? "Setups we have run" : "Opstillinger, vi har sat"}</p>
          <h1>{en ? "How the equipment sits in the room." : "Sådan sidder grejet i rummet."}</h1>
          <p className={styles.lead}>{en ? "Real photos from jobs in Copenhagen. See the setup, then book the matching package online." : "Rigtige fotos fra opgaver i København. Se opstillingen, og book den tilsvarende pakke online."}</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href={href("/events/reception")}>{en ? "Book a reception package" : "Book en receptionspakke"}</Link>
            <Link className={styles.textLink} href={href("/")}>{en ? "Shop all packages" : "Se alle pakker"}</Link>
          </div>
        </div>
        <figure className={styles.heroImage}>
          <img src="/images/events/reception-front.webp" width="1200" height="1600" alt={en ? "Two EV speakers beside a restaurant bar" : "To EV-højtalere ved en restaurantbar"} />
          <figcaption><span>{en ? "Reception · actual setup" : "Reception · konkret opstilling"}</span></figcaption>
        </figure>
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>{en ? "Three setups, three different jobs." : "Tre opstillinger, tre forskellige opgaver."}</h2>
          <p>{en ? "We do not reuse the same photo across the site. Each picture is from a specific room." : "Vi genbruger ikke det samme foto over hele sitet. Hvert billede er fra et konkret rum."}</p>
        </div>
        <div className={styles.caseGallery}>
          {[
            {img: "reception-front", title: en ? "Speakers at the bar" : "Højtalere ved baren", body: en ? "Two EV speakers on stands, mixer to the side. Background music and speeches without filling the room." : "To EV-højtalere på stativer, mixer til siden. Baggrundsmusik og taler uden at fylde rummet.", href: "/events/reception"},
            {img: "reception-detail", title: en ? "Close-up of the same job" : "Nærbillede af samme opgave", body: en ? "Placement follows the furniture and guest flow. Book the reception packages online." : "Placeringen følger møbler og gæsternes færden. Book receptionspakkerne online.", href: "/events/reception"},
            {img: "concert", title: en ? "A small stage" : "En lille scene", body: en ? "Starting point for a duo or a short live set. Compare concert packages and book." : "Udgangspunkt for en duo eller et kort livesæt. Sammenlign koncertpakker og book.", href: "/events/koncert"},
          ].map((c) => (
            <Link className={styles.caseCard} href={href(c.href)} key={c.img}>
              <img src={`/images/events/${c.img}.webp`} alt={c.title} width="800" height="600" loading="lazy" />
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <strong>{en ? "Book this setup →" : "Book den her opstilling →"}</strong>
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.shopHelp}>
        <div>
          <h2>{en ? "Want the equipment, not the photo?" : "Vil I have grejet, ikke billedet?"}</h2>
          <p>{en ? "Choose an occasion and book the package online." : "Vælg en anledning og book pakken online."}</p>
        </div>
        <Link className={styles.primary} href={href("/eventloesninger")}>{en ? "Shop by occasion" : "Shop efter anledning"}</Link>
      </section>
      <LocalBusinessJsonLd extra={{ description: en ? "Event AV setups in Copenhagen" : "AV-opstillinger til events i København" }} />
      <Footer locale={locale} />
    </main>;
  }

  if (detail) {
    return <main className={styles.page} lang={locale}>
      <section className={`${styles.hero} ${styles.compactHero}`}>
        <div className={styles.heroCopy}>
          <p className={styles.location}>{en ? "Packages by occasion" : "Pakker efter anledning"}</p>
          <h1>{en ? "Find the package. Book it online." : "Find pakken. Book den online."}</h1>
          <p className={styles.lead}>{en ? "Sixteen occasions with ready-made equipment packages. Compare what is included, then add it to the basket. A quote is only needed for unusual rooms." : "Seksten anledninger med færdige udstyrspakker. Sammenlign indholdet, og læg i kurven. Tilbud er kun nødvendigt ved særlige rum."}</p>
          <div className={styles.actions}>
            <a className={styles.primary} href="#situationer">{en ? "See occasions" : "Se anledninger"}</a>
            <Link className={styles.textLink} href={href("/av-udstyr")}>{en ? "Browse equipment" : "Lej enkeltprodukter"}</Link>
          </div>
        </div>
        <figure className={styles.heroImage}>
          <img src="/images/events/expo.webp" width="1200" height="800" alt={en ? "AV for an exhibition stand" : "AV til en messestand"} />
          <figcaption><span>{en ? "Exhibition stand · illustration" : "Messestand · illustration"}</span></figcaption>
        </figure>
      </section>
      <SituationDirectory locale={locale} />
      <section id="foresp" className={styles.shopHelp}>
        <div>
          <h2>{en ? "Need a custom setup?" : "Brug for en særlig opstilling?"}</h2>
          <p>{en ? "Most events are booked from the packages above. If the room is unusual, send a short brief and we will quote." : "De fleste arrangementer bookes fra pakkerne ovenfor. Er rummet usædvanligt, send en kort brief, så laver vi et tilbud."}</p>
        </div>
      </section>
      <details id="tilbud" className="mx-auto max-w-3xl px-6 pb-12">
        <summary className="cursor-pointer text-sm text-brand-600">{en ? "Ask about a custom setup" : "Spørg om en særlig opstilling"}</summary>
        <EventInquiryForm locale={locale} />
      </details>
      <LocalBusinessJsonLd extra={{ description: en ? "Event packages in Copenhagen, booked online" : "Eventpakker i København, booket online" }} />
      <Footer locale={locale} />
    </main>;
  }

  return <main className={styles.page} lang={locale}>
    <section className={`${styles.hero} ${styles.shopHero}`}>
      <div className={styles.heroCopy}>
        <p className={styles.location}>{en ? "Sound, light & AV in Copenhagen" : "Lyd, lys & AV i København"}</p>
        <h1>{en ? "Sound, light and AV. Ready to book." : "Lyd, lys og AV. Klar til at booke."}</h1>
        <p className={styles.lead}>{en ? "Choose your occasion, compare packages and book online. From a meeting with a screen to a Friday bar with sound, lights and a DJ." : "Vælg anledning, sammenlign pakker og book online. Fra et møde med skærm til en fredagsbar med lyd, lys og DJ."}</p>
        <div className={styles.actions}>
          <a className={styles.primary} href="#shop-pakker">{en ? "Shop packages" : "Se pakker og priser"}</a>
          <Link className={styles.textLink} href={href("/av-udstyr")}>{en ? "Browse equipment" : "Lej enkeltprodukter"} →</Link>
        </div>
        <p className={styles.heroNote}>{en ? "Prices include VAT. Collect yourself or add delivery." : "Priser inklusive moms. Hent selv eller tilvælg levering."}</p>
      </div>
      <EventHeroGallery locale={locale} />
    </section>
    <div className={styles.serviceLine}>
      <span>{en ? "Book online" : "Book online"}</span>
      <span>{en ? "Delivery & setup" : "Levering & opsætning"}</span>
      <span>{en ? "Soundcheck & handover" : "Lydprøve & gennemgang"}</span>
      <span>{en ? "Technician if you add it" : "Tekniker, hvis I tilvælger det"}</span>
    </div>
    <SeasonalStrip locale={locale} />
    <GoogleReviews locale={locale} />
    <ShopPackagePicker locale={locale} />
    <section className={styles.equipment}>
      <h2>{en ? "Hire individual products" : "Lej enkeltprodukter"}</h2>
      <p>{en ? "Add the equipment you need to your basket." : "Læg det udstyr, I mangler, direkte i kurven."}</p>
      <div>{EQUIPMENT.map(([p, da, eng]) => <Link href={href(p)} key={p}>{en ? eng : da} <span aria-hidden>↗</span></Link>)}</div>
      <p className={styles.note}><Link href={href("/festpakke-150")}>{en ? "Party package 150" : "Festpakke 150"}</Link> · <Link href={href("/festpakke-250")}>{en ? "Party package 250" : "Festpakke 250"}</Link> · <Link href={href("/festlys")}>{en ? "Lighting" : "Lys"}</Link></p>
    </section>
    <section className={styles.shopHelp}>
      <div>
        <h2>{en ? "Need help choosing?" : "Brug for hjælp til at vælge?"}</h2>
        <p>{en ? "Start with the packages. Contact is for delivery notes, not to replace booking." : "Start med pakkerne. Kontakt er til leveringsnoter, ikke i stedet for booking."}</p>
      </div>
      <Link className={styles.textLink} href={href("/kontakt")}>{en ? "Contact" : "Kontakt"}</Link>
    </section>
    <LocalBusinessJsonLd extra={{ description: en ? "Sound, light and AV for events in Copenhagen" : "Lyd, lys og AV til events i København" }} />
    <Footer locale={locale} />
  </main>;
}
