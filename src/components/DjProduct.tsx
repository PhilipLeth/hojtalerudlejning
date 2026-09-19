"use client";
import { useState } from "react";
import Link from "next/link";
import { DJ_DEFAULT, priceDj, type DjHours } from "@/lib/dj";
import { bookHref } from "@/lib/bookUrl";
import type { Locale } from "@/lib/i18n";
import DjHoursPicker from "./DjHoursPicker";
import { useProducts } from "@/lib/useProducts";
import DjGearPicker from "./DjGearPicker";
import DjLightsPicker from "./DjLightsPicker";
import GoogleReviews from "./GoogleReviews";
import Footer from "./Footer";
import styles from "./EventHome.module.css";

export default function DjProduct({ locale = "da" }: { locale?: Locale }) {
  const en = locale === "en";
  const [hours, setHours] = useState<DjHours>(DJ_DEFAULT);
  const [gear, setGear] = useState("dj_pakke_lille");
  const [light, setLight] = useState<string | null>(null);
  const { rentalProducts, addons } = useProducts();
  const selectedGear = rentalProducts.find((p) => p.id === gear);
  const selectedLight = light ? addons.find((a) => a.id === light) : null;
  const dj = priceDj(hours, new Date());
  const total = dj.total + (selectedGear?.price ?? 0) + (selectedLight?.price ?? 0);
  const booking = bookHref("dj_musikafvikler", locale, {
    djBefore: String(hours.before23),
    djAfter: String(hours.after23),
    djFrom: hours.from,
    djTo: hours.to,
    djGear: gear,
    djLight: light,
  });
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.location}>{en ? "Music for your event" : "Musik til jeres arrangement"}</p>
          <h1>{en ? "DJ & music host" : "DJ & musikafvikler"}</h1>
          <p className={styles.lead}>{en ? "Set start and finish. Choose the sound. We take care of the music." : "Sæt start og slut. Vælg anlægget. Vi tager os af musikken."}</p>
          <p>
            {en
              ? "For Friday bars, Christmas lunches, receptions and parties. Delivery, setup and collection are included in the DJ price. Add lighting and a larger sound system by guest count."
              : "Til fredagsbar, julefrokost, reception og fest. Levering, opsætning og nedtagning er med i DJ-prisen. Tilvælg lys og et større musikanlæg efter antal gæster."}
          </p>
          <DjHoursPicker locale={locale} value={hours} onChange={setHours} date={new Date()} />
          <DjGearPicker value={gear} onChange={setGear} locale={locale} />
          <DjLightsPicker value={light} onChange={setLight} locale={locale} hidden={gear === "dj_pakke_stor"} />
          <p className="mb-4 text-xl font-bold">
            {en ? "Quote: " : "Tilbud: "}
            {total.toLocaleString(en ? "en-GB" : "da-DK")} {en ? "DKK incl. VAT" : "kr inkl. moms"}
          </p>
          <Link className={styles.primary} href={booking}>
            {en ? "Add DJ and equipment to basket" : "Læg DJ og gear i kurven"}
          </Link>
          <p className={styles.note}>
            {en
              ? "Enter the event address when you book. We deliver, set up and collect again."
              : "Skriv adressen i bookingen. Vi leverer, sætter op og henter igen."}
          </p>
        </div>
        <figure className={styles.heroImage}>
          <img src="/images/product-dj-pult-white.webp" alt={en ? "AlphaTheta XDJ all-in-one DJ system" : "AlphaTheta XDJ all-in-one DJ-pult"} width="1024" height="1024" style={{ objectFit: "contain", background: "white" }} />
          <figcaption>{en ? "Illustration of the DJ controller in the equipment packages" : "Illustration af DJ-pulten i udstyrspakkerne"}</figcaption>
        </figure>
      </section>
      <GoogleReviews locale={locale} />
      <Footer locale={locale} />
    </main>
  );
}
