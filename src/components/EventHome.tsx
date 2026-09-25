import EventInquiryForm from "./EventInquiryForm";
import GoogleReviews from "./GoogleReviews";
import SituationDirectory from "./SituationDirectory";
import EventHeroGallery from "./EventHeroGallery";
import CategoryProductGrid from "./CategoryProductGrid";
import FaqSection from "./FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import SeasonalStrip from "./SeasonalStrip";
import { POPULAERE_IDS, prisKr } from "@/lib/products";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/enPages";
import LocalBusinessJsonLd from "./LocalBusinessJsonLd";
import Footer from "./Footer";
import styles from "./EventHome.module.css";

/**
 * Vejene ind i sortimentet, som én linje under de populære produkter.
 *
 * Frederik bad om at alt under "Find jeres pakke" røg af forsiden, og Philip
 * bad samtidig om at udlejningsprodukterne skal være nemme at finde fra
 * forsiden. Begge dele kan lade sig gøre: ikke et helt afsnit med kasser, men
 * én række links lige under gitteret, hvor den, der leder efter en bestemt
 * ting, allerede kigger.
 */
const EQUIPMENT = [
  ["/lej-hojtaler", "Højtalere", "Speakers"],
  ["/festlys", "Lys", "Lighting"],
  ["/roeg", "Røg", "Fog"],
  ["/lej-mikrofon", "Mikrofoner", "Microphones"],
  ["/dj-pult", "DJ-pulte", "DJ controllers"],
  ["/av-udstyr", "Skærm & projektor", "Screens & projectors"],
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
          <img src="/images/events/reception-front-v2.webp" width="1200" height="1600" alt={en ? "Two EV speakers beside a restaurant bar" : "To EV-højtalere ved en restaurantbar"} />
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
            {img: "reception-front-v2", title: en ? "Speakers at the bar" : "Højtalere ved baren", body: en ? "Two EV speakers on stands, mixer to the side. Background music and speeches without filling the room." : "To EV-højtalere på stativer, mixer til siden. Baggrundsmusik og taler uden at fylde rummet.", href: "/events/reception"},
            {img: "reception-detail-v2", title: en ? "Close-up of the same job" : "Nærbillede af samme opgave", body: en ? "Placement follows the furniture and guest flow. Book the reception packages online." : "Placeringen følger møbler og gæsternes færden. Book receptionspakkerne online.", href: "/events/reception"},
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
            <Link className={styles.primary} href={href("/av-udstyr")}>{en ? "Hire individual products" : "Lej enkeltprodukter"}</Link>
            <Link className={styles.textLink} href={href("/kontakt")}>{en ? "Ask about a room we have not seen" : "Spørg om et rum vi ikke har set"} →</Link>
          </div>
        </div>
        <figure className={styles.heroImage}>
          <img src="/images/events/expo.webp" width="1200" height="800" alt={en ? "AV for an exhibition stand" : "AV til en messestand"} />
          <figcaption><span>{en ? "Exhibition stand · illustration" : "Messestand · illustration"}</span></figcaption>
        </figure>
      </section>
      <SituationDirectory locale={locale} />
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>{en ? "The same three steps every time." : "De samme tre skridt hver gang."}</h2>
          <p>{en ? "No quote, no waiting for a reply. The price you see is the price you pay." : "Intet tilbud, ingen ventetid på svar. Prisen du ser, er den du betaler."}</p>
        </div>
        <ol className={styles.process}>
          {(en
            ? [
                ["Pick the occasion", "Each occasion has two packages: one that covers the basics and one with more sound, light or picture. The contents are listed on the card."],
                ["Choose your dates", "One price covers one to five days. Most people collect the day before and return the day after."],
                ["Collect or have it delivered", `Collect free in Copenhagen S, or add delivery from ${prisKr("levering_ud")}. Add setup and a technician if you would rather not touch it.`],
              ]
            : [
                ["Vælg anledningen", "Hver anledning har to pakker: én der dækker det nødvendige, og én med mere lyd, lys eller billede. Indholdet står på kortet."],
                ["Vælg datoerne", "Én pris dækker fra én til fem dage. De fleste henter dagen før og afleverer dagen efter."],
                ["Hent selv, eller få det leveret", `Hent gratis i København S, eller tilvælg levering fra ${prisKr("levering_ud")}. Opsætning og tekniker kan lægges oveni, hvis I helst vil slippe for at røre det.`],
              ]
          ).map(([titel, tekst], i) => (
            <li key={titel}>
              <span aria-hidden>{i + 1}</span>
              <h3>{titel}</h3>
              <p>{tekst}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>{en ? "What is in every package." : "Det er med i hver pakke."}</h2>
          <p>{en ? "Cables and stands are never an extra line on the invoice. If a package needs it to work, it is in the box." : "Kabler og stativer er aldrig en ekstra linje på fakturaen. Skal pakken bruge det for at virke, ligger det i kassen."}</p>
        </div>
        <div className={styles.includes}>
          {(en
            ? [
                ["All cables", "Power, jack, XLR and HDMI. Connect your phone or laptop over Bluetooth or cable."],
                ["Tested before it leaves", "Every item is checked between jobs, and fog fluid and batteries go with the machines that need them."],
                ["A run-through when you collect", "Two minutes at the counter, and a number you can call while the guests are arriving."],
                ["Room for extras", "A microphone, a fog machine or a disco ball can be added to any package in the booking."],
              ]
            : [
                ["Alle kabler", "Strøm, jack, XLR og HDMI. Telefon eller computer tilsluttes over Bluetooth eller kabel."],
                ["Tjekket inden det kører ud", "Hver ting gennemgås mellem opgaverne, og røgvæske og batterier følger de maskiner, der skal bruge dem."],
                ["Gennemgang ved afhentning", "To minutter ved disken, og et nummer I kan ringe til, mens gæsterne ankommer."],
                ["Plads til tilvalg", "En mikrofon, en røgmaskine eller en discokugle kan lægges på enhver pakke i bookingen."],
              ]
          ).map(([titel, tekst]) => (
            <div key={titel}>
              <h3>{titel}</h3>
              <p>{tekst}</p>
            </div>
          ))}
        </div>
        <div className={styles.rangeLinks}>
          <span>{en ? "Or hire the parts on their own:" : "Eller lej delene for sig:"}</span>
          {EQUIPMENT.map(([sti, da, eng]) => <Link href={href(sti)} key={sti}>{en ? eng : da}</Link>)}
        </div>
      </section>
      <FaqSection
        items={CATEGORY_FAQ[en ? "en-eventloesninger" : "eventloesninger"]}
        title={en ? "Questions we get before an event" : "Spørgsmål vi får inden et arrangement"}
      />
      <GoogleReviews locale={locale} />
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
        <p className={styles.location}>{en ? "Party equipment rental in Copenhagen" : "Udlejning af festudstyr i København"}</p>
        <h1>{en ? "Rent sound, light and party equipment in 2 minutes" : "Lej lyd, lys og festudstyr på 2 minutter"}</h1>
        <p className={styles.lead}>{en ? "Equipment for parties, meetings and events: compare packages, see the price straight away and book online." : "Udstyr til fest, møde og event: sammenlign pakker, se prisen med det samme og book online."}</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href={href("/eventloesninger")}>{en ? "See packages by occasion" : "Se pakker til anledninger"}</Link>
          <Link className={styles.textLink} href={href("/av-udstyr")}>{en ? "Hire individual products" : "Lej enkeltprodukter"} →</Link>
        </div>
        <p className={styles.heroNote}>{en ? "Prices include VAT. Collect in Copenhagen S or add delivery." : "Priser inklusive moms. Hent i København S eller tilvælg levering."}</p>
      </div>
      <EventHeroGallery locale={locale} />
    </section>
    {/* Ankeret hedder stadig shop-pakker: otte sider, blogindlæg og menuen
        linker til /#shop-pakker, og de skal lande på pakkerne, ikke på toppen. */}
    <section className={styles.section} id="shop-pakker">
      <div className={styles.sectionHead}>
        <h2>{en ? "The ten we hire out most" : "De ti vi lejer mest ud"}</h2>
        <p>{en ? "The party equipment people book most often, packages and single products side by side. Every price is for up to five days, VAT included." : "Det festudstyr der bliver lejet oftest, pakker og enkeltprodukter side om side. Alle priser er for op til fem dages leje, inklusive moms."}</p>
      </div>
      <CategoryProductGrid locale={locale} tone="light" cols={4} items={POPULAERE_IDS.map((id) => ({ id }))} />
      <div className={styles.rangeLinks}>
        <span>{en ? "Browse the range:" : "Se hele sortimentet:"}</span>
        {EQUIPMENT.map(([p, da, eng]) => <Link href={href(p)} key={p}>{en ? eng : da}</Link>)}
      </div>
    </section>
    <SeasonalStrip locale={locale} />
    <FaqSection
      items={CATEGORY_FAQ[en ? "en-forside" : "forside"]}
      title={en ? "Before you book party equipment" : "Inden du lejer festudstyr"}
    />
    <GoogleReviews locale={locale} />
    <LocalBusinessJsonLd extra={{ description: en ? "Sound, light and AV for events in Copenhagen" : "Lyd, lys og AV til events i København" }} />
    <Footer locale={locale} />
  </main>;
}
