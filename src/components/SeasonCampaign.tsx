"use client";

import Link from "next/link";
import Footer from "./Footer";
import { useProducts } from "@/lib/useProducts";
import { bookHref } from "@/lib/bookUrl";
import { thumbSrcSet } from "@/lib/imageSrcSet";
import { localizedHref } from "@/lib/enPages";
import { seasonById } from "@/lib/seasons";
import type { Locale } from "@/lib/i18n";
import styles from "./HalloweenHome.module.css";

const COPY = {
  halloween: {
    da: {
      explore: "Find din Halloween-pakke",
      ordinary: "Se alle pakker",
      promise: ["Én pris · op til 5 dage", "Hent i København S", "Levering kan tilvælges"],
      title: "Hvor uhyggelig skal festen være?",
      sub: "Tre Halloween-pakker. Heksetimen, Monsterfesten og Midnatsklubben.",
      featured: "Til festen derhjemme",
      book: "Book pakken",
      bookItem: "Book",
      details: "Se alt i pakken",
      currency: "kr",
      period: "/ op til 5 dage",
      note: "Illustrationer baseret på vores udstyr. Røgvæske og kabler er med. Pynt og græskar er ikke inkluderet. Aftal brug af røg med dit feststed, den kan aktivere røgalarmer.",
      imageNote: "Stemningsillustration",
      tipTitle: "Du vælger kostumet. Vi har grejet.",
      tip: "Vælg pakken, find din dato, og book online. Brug din egen playliste via Bluetooth.",
      extras: "Enkeltprodukter",
      extrasSub: "Røg og lys uden en hel pakke. Stroboskop er ikke i udlejning endnu. LED-effekten og discokuglen dækker det meste.",
    },
    en: {
      explore: "Find your Halloween package",
      ordinary: "See all packages",
      promise: ["One price · up to 5 days", "Collect in Copenhagen S", "Delivery available"],
      title: "How spooky is your party?",
      sub: "Three Halloween packages. The Witching Hour, Monster Party and the Midnight Club.",
      featured: "Made for house parties",
      book: "Book package",
      bookItem: "Book",
      details: "See what’s included",
      currency: "DKK",
      period: "/ up to 5 days",
      note: "Illustrations based on our equipment. Fog fluid and cables included. Decorations and pumpkins are not included. Check with your venue before using fog.",
      imageNote: "Atmosphere illustration",
      tipTitle: "Bring the costumes. We’ll bring the sound.",
      tip: "Choose your package, pick your dates and book online. Speaker packages connect via Bluetooth.",
      extras: "Single products",
      extrasSub: "Fog and lights without a full package. Strobe is not for hire yet. The LED effect and disco ball cover most parties.",
    },
  },
  julefrokost: {
    da: {
      explore: "Find julefrokost-pakken",
      ordinary: "Se alle pakker",
      promise: ["Én pris · op til 5 dage", "Hent i København S", "Levering kan tilvælges"],
      title: "Hvilken julefrokost er det?",
      sub: "Kontorets hygge, kantinens tale og dansegulv, eller fredagsbaren i december.",
      featured: "Anbefalet til firmajulefrokost",
      book: "Book pakken",
      bookItem: "Book",
      details: "Se alt i pakken",
      currency: "kr",
      period: "/ op til 5 dage",
      note: "Pynt og julemad er jeres. Kabler er med. Røg skal aftales med feststedet, den kan aktivere røgalarmer.",
      imageNote: "Stemningsillustration",
      tipTitle: "Talen skal høres. Bagefter skal der danses.",
      tip: "Book online. Skriv i kommentaren hvis I vil have levering til kantinen.",
      extras: "Enkeltprodukter",
      extrasSub: "Lyskæder, uplights, mikrofon og lyseffekt, hvis pakken skal justeres.",
    },
    en: {
      explore: "Find the Christmas party package",
      ordinary: "See all packages",
      promise: ["One price · up to 5 days", "Collect in Copenhagen S", "Delivery available"],
      title: "Which Christmas party is it?",
      sub: "Office hygge, a canteen speech and dance floor, or the December Friday bar.",
      featured: "Recommended for the company lunch",
      book: "Book package",
      bookItem: "Book",
      details: "See what’s included",
      currency: "DKK",
      period: "/ up to 5 days",
      note: "Decorations and food are yours. Cables included. Agree fog with the venue, it can trigger smoke alarms.",
      imageNote: "Atmosphere illustration",
      tipTitle: "The speech has to carry. Then people dance.",
      tip: "Book online. Add a note if you want delivery to the canteen.",
      extras: "Single products",
      extrasSub: "Fairy lights, uplights, a microphone and a light effect if you want to adjust the package.",
    },
  },
} as const;

const CARD_KICKER: Record<string, { da: string; en: string }> = {
  halloween_lys: { da: "Den lille fest", en: "The small party" },
  halloween_lille: { da: "Til festen derhjemme", en: "Made for house parties" },
  halloween_stor: { da: "Dansegulvet", en: "The dance floor" },
  jul_hygge: { da: "Kontoret / den lille julefrokost", en: "The office / small lunch" },
  pakke_firmafest: { da: "Julefrokost med tale", en: "Christmas lunch with a speech" },
  event_fredagsbar_2: { da: "December-fredagsbar", en: "December Friday bar" },
};

export default function SeasonCampaign({
  seasonId,
  locale = "da",
}: {
  seasonId: "halloween" | "julefrokost";
  locale?: Locale;
}) {
  const season = seasonById(seasonId)!;
  const en = locale === "en";
  const c = COPY[seasonId][locale];
  const { rentalProducts, addons, speakers } = useProducts();
  const packages = season.productIds
    .map((id) => rentalProducts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const extras = (season.extraIds ?? []).map((id) => {
    const r = rentalProducts.find((p) => p.id === id);
    if (r) return { id, name: en ? r.name_en : r.name_da, price: r.price, image: r.image, page: r.page };
    const a = addons.find((p) => p.id === id);
    if (a) return { id, name: en ? a.en.label : a.da.label, price: a.price, image: a.image, page: a.page };
    const s = speakers.find((p) => p.id === id);
    if (s) return { id, name: en ? s.en.name : s.da.name, price: s.price, image: s.product, page: s.page };
    return null;
  }).filter((p): p is NonNullable<typeof p> => !!p);
  const href = (p: string) => localizedHref(p, locale);
  const headingId = `${season.id}-title`;
  const packId = `${season.id}-pakker`;

  return (
    <>
      <div className={styles.campaign} data-theme={season.id === "julefrokost" ? "jul" : "halloween"}>
        <section className={styles.hero} aria-labelledby={headingId}>
          <img src={season.hero} alt="" width={1536} height={1024} fetchPriority="high" className={styles.backdrop} />
          <div className={styles.shade} />
          <div className={styles.heroContent}>
            <p className={styles.season}><span aria-hidden="true">✦</span> {en ? season.kickerEn : season.kickerDa}</p>
            <h1 id={headingId} className={styles.title}>{en ? season.navEn : season.navDa}</h1>
            <p className={styles.headline}>{en ? season.titleEn : season.titleDa}</p>
            <p className={styles.intro}>{en ? season.leadEn : season.leadDa}</p>
            <div className={styles.actions}>
              <a href={`#${packId}`} className={styles.primary}>{c.explore}<span aria-hidden="true">↘</span></a>
              <Link href={href("/") + "#shop-pakker"} className={styles.secondary}>{c.ordinary}</Link>
            </div>
          </div>
          <span className={styles.imageNote}>{c.imageNote}</span>
        </section>
        <div className={styles.promises}>
          {c.promise.map((text) => <span key={text}><span aria-hidden="true">✦</span> {text}</span>)}
        </div>
        <section id={packId} className={styles.packages} aria-labelledby={`${season.id}-packages-title`}>
          <div className={styles.sectionHeading}>
            <h2 id={`${season.id}-packages-title`}>{c.title}</h2>
            <p>{c.sub}</p>
          </div>
          <div className={styles.grid}>
            {packages.map((p) => {
              const name = en ? p.name_en : p.name_da;
              const featured = p.id === season.featuredId;
              const kicker = CARD_KICKER[p.id]?.[locale] ?? (en ? p.bundle?.usecase_en : p.bundle?.usecase_da) ?? "";
              const page = p.page ? href(p.page) : bookHref(p.id, locale);
              return (
                <article key={p.id} className={`${styles.card} ${featured ? styles.featured : ""}`}>
                  <div className={styles.cardTop}>{featured ? c.featured : kicker}</div>
                  <Link href={page} className={styles.equipment} aria-label={`${c.details}: ${name}`}>
                    <img src={p.image} srcSet={thumbSrcSet(p.image)} sizes="(min-width: 1024px) 370px, (min-width: 641px) 33vw, 95vw" alt="" width={1200} height={800} loading="lazy" />
                  </Link>
                  <div className={styles.cardBody}>
                    <h3>{name}</h3>
                    <p className={styles.usecase}>{en ? p.bundle?.usecase_en ?? p.desc_en : p.bundle?.usecase_da ?? p.desc_da}</p>
                    <ul>
                      {(p.bundle?.parts ?? []).map((part) => (
                        <li key={part.productId}><span aria-hidden="true">✓</span>{en ? part.label_en : part.label_da}</li>
                      ))}
                    </ul>
                    <div className={styles.price}><strong>{p.price.toLocaleString("da-DK")} <small>{c.currency}</small></strong><span>{c.period}</span></div>
                    <Link href={bookHref(p.id, locale)} className={styles.book}>{c.book}</Link>
                    <Link href={page} className={styles.details}>{c.details}</Link>
                  </div>
                </article>
              );
            })}
          </div>
          <p className={styles.note}>{c.note}</p>
          {extras.length > 0 && (
            <div className={styles.extras}>
              <div className={styles.sectionHeading}>
                <h2>{c.extras}</h2>
                <p>{c.extrasSub}</p>
              </div>
              <div className={styles.extrasGrid}>
                {extras.map((p) => (
                  <article key={p.id} className={styles.extraCard}>
                    <Link href={p.page ? href(p.page) : bookHref(p.id, locale)} className={styles.extraImg}>
                      {p.image ? <img src={p.image} srcSet={thumbSrcSet(p.image)} sizes="160px" alt="" width={400} height={400} loading="lazy" /> : null}
                    </Link>
                    <h3>{p.name}</h3>
                    <strong>{p.price.toLocaleString("da-DK")} {c.currency}</strong>
                    {/* Enkeltprodukterne er ikke pakker — der skal ikke stå "Book pakken" på en røgmaskine */}
                    <Link href={bookHref(p.id, locale)} className={styles.extraBook}>{c.bookItem}</Link>
                  </article>
                ))}
              </div>
            </div>
          )}
          <div className={styles.outro}><h3>{c.tipTitle}</h3><p>{c.tip}</p></div>
        </section>
        <Footer locale={locale} />
      </div>
    </>
  );
}
