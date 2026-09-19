import { activeSeasons, seasonNavLabel } from "@/lib/seasons";
import { localizedHref } from "@/lib/enPages";
import type { Locale } from "@/lib/i18n";
import styles from "./EventHome.module.css";

/** Aktive sæsoner som store billedpaneler på forsiden. */
export default function SeasonalStrip({ locale }: { locale: Locale }) {
  const seasons = activeSeasons();
  if (!seasons.length) return null;
  const en = locale === "en";
  return (
    <section className={styles.seasonStrip} aria-label={en ? "Seasonal inspiration" : "Sæson · inspiration"}>
      {seasons.map((s) => (
        <a
          key={s.id}
          href={localizedHref(s.href, locale)}
          className={styles.seasonCard}
          data-season={s.id}
          style={{ ["--season-accent" as string]: s.accent }}
        >
          <img src={s.hero} alt="" width="1280" height="720" />
          <div>
            <p>{en ? s.kickerEn : s.kickerDa}</p>
            <h2>{seasonNavLabel(s, locale)}</h2>
            <span>{en ? s.titleEn : s.titleDa}</span>
            <strong>{en ? "See the packages →" : "Se pakkerne →"}</strong>
          </div>
        </a>
      ))}
    </section>
  );
}
