"use client";

import Link from "next/link";
import { useProducts } from "@/lib/useProducts";
import { bookHref } from "@/lib/bookUrl";
import { thumbSrcSet } from "@/lib/imageSrcSet";
import { localizedHref } from "@/lib/enPages";
import type { Locale } from "@/lib/i18n";
import styles from "./HalloweenHome.module.css";

export const HALLOWEEN_IDS = ["halloween_lys", "halloween_lille", "halloween_stor"];

const COPY = {
  da: {
    season: "Halloween · 31. oktober", headline: "Skru op for uhyggen.",
    intro: "Lej højtalere, lys og røg i København. Vi har samlet grejet til din Halloween-fest — du står for kostumerne.",
    explore: "Find din Halloween-pakke", ordinary: "Se almindelige festpakker",
    promise: ["Én pris · op til 5 dage", "Hent i København S", "Levering kan tilvælges"],
    title: "Hvor uhyggelig skal festen være?", sub: "Tre specialpakker. Fra den første tåge til det sidste nummer.",
    featured: "Til festen derhjemme", book: "Book pakken", details: "Se alt i pakken", currency: "kr", period: "/ op til 5 dage",
    note: "Illustrationer baseret på vores udstyr. Røgvæske og kabler er med. Pynt og græskar er ikke inkluderet. Aftal brug af røg med dit feststed — den kan aktivere røgalarmer.",
    imageNote: "Stemningsillustration", tipTitle: "Du vælger kostumet. Vi har grejet.",
    tip: "Vælg pakken, find din dato, og book online. Brug din egen playliste via Bluetooth i pakkerne med højtalere.",
  },
  en: {
    season: "Halloween · 31 October", headline: "Turn up the fright.",
    intro: "Halloween speaker, lighting and fog rental in Copenhagen. We have the party equipment covered — you bring the costumes.",
    explore: "Find your Halloween package", ordinary: "See regular party packages",
    promise: ["One price · up to 5 days", "Collect in Copenhagen S", "Delivery available"],
    title: "How spooky is your party?", sub: "Three Halloween packages. From the first fog to the final track.",
    featured: "Made for house parties", book: "Book package", details: "See what’s included", currency: "DKK", period: "/ up to 5 days",
    note: "Illustrations based on our equipment. Fog fluid and cables included. Decorations and pumpkins are not included. Check with your venue before using fog — it can trigger smoke alarms.",
    imageNote: "Atmosphere illustration", tipTitle: "Bring the costumes. We’ll bring the sound.",
    tip: "Choose your package, select your dates and book online. Speaker packages connect to your own playlist via Bluetooth.",
  },
};

export default function HalloweenHome({ locale = "da" }: { locale?: Locale }) {
  const c = COPY[locale];
  const { rentalProducts } = useProducts();
  const packages = HALLOWEEN_IDS.map(id => rentalProducts.find(p => p.id === id)).filter(p => !!p);

  return (
    <div className={styles.campaign}>
      <section className={styles.hero} aria-labelledby="halloween-title">
        <img src="/images/halloween-hero.webp" alt="" width={1536} height={1024} fetchPriority="high" className={styles.backdrop} />
        <div className={styles.shade} />
        <div className={styles.heroContent}>
          <p className={styles.season}><span aria-hidden="true">✦</span> {c.season}</p>
          <h1 id="halloween-title" className={styles.title}>Halloween</h1>
          <p className={styles.headline}>{c.headline}</p>
          <p className={styles.intro}>{c.intro}</p>
          <div className={styles.actions}>
            <a href="#halloween-pakker" className={styles.primary}>{c.explore}<span aria-hidden="true">↘</span></a>
            <a href="#pakker" className={styles.secondary}>{c.ordinary}</a>
          </div>
        </div>
        <span className={styles.imageNote}>{c.imageNote}</span>
      </section>
      <div className={styles.promises}>
        {c.promise.map(text => <span key={text}><span aria-hidden="true">✦</span> {text}</span>)}
      </div>
      <section id="halloween-pakker" className={styles.packages} aria-labelledby="halloween-packages-title">
        <div className={styles.sectionHeading}>
          <h2 id="halloween-packages-title">{c.title}</h2>
          <p>{c.sub}</p>
        </div>
        <div className={styles.grid}>
          {packages.map(p => {
            const name = locale === "en" ? p.name_en : p.name_da;
            const featured = p.id === "halloween_lille";
            return (
              <article key={p.id} className={`${styles.card} ${featured ? styles.featured : ""}`}>
                <div className={styles.cardTop}>{featured ? c.featured : p.bundle![locale === "en" ? "usecase_en" : "usecase_da"]}</div>
                <Link href={localizedHref(p.page!, locale)} className={styles.equipment} aria-label={`${c.details}: ${name}`}>
                  <img src={p.image} srcSet={thumbSrcSet(p.image)} sizes="(min-width: 1024px) 370px, (min-width: 641px) 33vw, 95vw" alt={`${name} — ${locale === "en" ? "package equipment in a Halloween setting" : "pakkens udstyr i Halloween-stemning"}`} width={1200} height={800} loading="lazy" />
                </Link>
                <div className={styles.cardBody}>
                  <h3>{name}</h3>
                  <p className={styles.usecase}>{p.bundle![locale === "en" ? "usecase_en" : "usecase_da"]}</p>
                  <ul>{p.bundle!.parts.map(part => <li key={part.productId}><span aria-hidden="true">✓</span>{locale === "en" ? part.label_en : part.label_da}</li>)}</ul>
                  <div className={styles.price}><strong>{p.price.toLocaleString("da-DK")} <small>{c.currency}</small></strong><span>{c.period}</span></div>
                  <Link href={bookHref(p.id, locale)} className={styles.book}>{c.book}</Link>
                  <Link href={localizedHref(p.page!, locale)} className={styles.details}>{c.details}</Link>
                </div>
              </article>
            );
          })}
        </div>
        <p className={styles.note}>{c.note}</p>
        <div className={styles.outro}><h3>{c.tipTitle}</h3><p>{c.tip}</p></div>
      </section>
    </div>
  );
}
