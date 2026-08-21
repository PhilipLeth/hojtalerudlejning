/**
 * Spørgsmål og svar til en produktside, bygget af produktets egne tal.
 *
 * De 30 produktsider havde ingen FAQ. At skrive dem i hånden ville betyde 30
 * tekster der skal rettes hver gang en pris ændrer sig — og de ville drive fra
 * kataloget, præcis som forsidens FAQ gjorde (den påstod 695 kr for den store
 * højtalerpakke, som koster 495, og at bæretasken var inkluderet, selvom den
 * er et tilkøb til 95 kr).
 *
 * Derfor bygges de i stedet af det siden allerede ved: navn, pris, hvad der er
 * med, og hvor mange gæster det rækker til. Svarene bliver forskellige fra
 * produkt til produkt, fordi de tal er forskellige — og de kan ikke komme til
 * at modsige prisen øverst på siden.
 *
 * Sider med noget særligt at forklare sender det med som `extra`; de svar
 * lægger sig først, fordi det specifikke er mere værd end det generelle.
 */
import { DEFAULT_PICKUP_ADDRESS } from "@/lib/pickup";
import { addons, rentalProducts, speakers } from "@/lib/products";
import type { FaqItem } from "@/components/FaqSection";

/** Levering: én vej og begge veje er to selvstændige priser, jf. products.ts */
export const DELIVERY_ONE_WAY = 495;
export const DELIVERY_BOTH_WAYS = 795;

/** Alle dage 1-5 koster det samme — se dayMultiplier i products.ts */
export const MAX_RENTAL_DAYS = 5;

export interface ProductFaqInput {
  /** Produktnavnet som det står på siden, fx "Soundboks 4" */
  name: string;
  /** Weekendprisen i kr */
  price: number;
  /** Booking-id, fx "soundboks" — slår indhold og kapacitet op i kataloget */
  productId: string;
  /**
   * Navnet som det skal lyde midt i en sætning. Produktnavne er dels
   * egennavne ("Soundboks 4"), dels fællesnavne ("Discokugle") — og
   * "Hvad koster det at leje Discokugle?" er ikke dansk. Sider med et
   * fællesnavn sender derfor "en discokugle" med her. Standard: navnet selv.
   */
  phrase?: string;
  /** Kapacitet fra siden, fx "30-50 pers." Falder tilbage på katalogets. */
  capacity?: string;
  /** Sidespecifikke spørgsmål, lagt først */
  extra?: FaqItem[];
}

/**
 * Hvad der er med i pakken, og hvor mange den rækker til.
 *
 * Hentes fra kataloget og ikke fra sidens bullets: bullets er salgsargumenter
 * ("Kraftig bas til udendørs fest", "Hent fredag, aflever mandag"), og listet
 * op som svar på "hvad er inkluderet" bliver de både forkerte og ulæselige.
 * `contents` er den faktiske pakkeliste.
 *
 * Standardkataloget, ikke KV: siden er statisk, og admin-ændringer i
 * products_catalog slår først igennem ved næste deploy. Samme afvejning som
 * LocalBusinessJsonLd.
 */
function catalogFacts(productId: string): { contents?: string[]; capacity?: string } {
  const speaker = speakers.find((s) => s.id === productId);
  if (speaker) return { contents: speaker.contents, capacity: speaker.da.capacity };

  const rental = rentalProducts.find((r) => r.id === productId);
  if (rental) return { contents: rental.contents };

  const addon = addons.find((a) => a.id === productId);
  if (addon) return { contents: addon.contents };

  return {};
}

/** Sætter pakkelisten sammen til én læsbar sætning. */
function joinBullets(parts: string[]): string {
  const clean = parts.map((b) => b.trim().replace(/[.;]+$/, "")).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  return `${clean.slice(0, -1).join(", ")} og ${clean[clean.length - 1]}`;
}

/** Stort begyndelsesbogstav — "en discokugle" må ikke starte en sætning som småt. */
function upperFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function buildProductFaq({ name, price, productId, phrase, capacity, extra = [] }: ProductFaqInput): FaqItem[] {
  const facts = catalogFacts(productId);
  const it = phrase ?? name;
  const items: FaqItem[] = [...extra];

  items.push({
    q: `Hvad koster det at leje ${it}?`,
    a:
      `${upperFirst(it)} koster ${price} kr for en weekend hos Lejhøjtaler.dk i København. ` +
      `Prisen er den samme, uanset om du har udstyret 1 eller ${MAX_RENTAL_DAYS} dage, ` +
      `og alle nødvendige kabler er med i prisen. Du kan betale online med kort eller ved afhentning.`,
  });

  const included = joinBullets(facts.contents ?? []);
  if (included) {
    items.push({
      q: `Hvad er inkluderet, når jeg lejer ${it}?`,
      a: `Med ${it} følger ${included}. Du skal ikke købe eller medbringe noget selv — udstyret er klar til brug, når du henter det.`,
    });
  }

  const guests = capacity ?? facts.capacity;
  if (guests) {
    items.push({
      q: `Hvor mange gæster rækker ${it} til?`,
      a:
        `${upperFirst(it)} er beregnet til ${guests.toLowerCase()}. Gæstetallet gælder indendørs — ` +
        `udendørs bærer lyden kortere, så regn med lidt færre. Er I flere, ringer du til os på 31 13 28 52, ` +
        `så anbefaler vi den rigtige pakke.`,
    });
  }

  items.push({
    q: `Hvor henter jeg ${it}, og kan I levere?`,
    a:
      `Du henter selv ${it} på ${DEFAULT_PICKUP_ADDRESS}. Vil du hellere have det leveret, kører vi ud i hele ` +
      `København: ${DELIVERY_ONE_WAY} kr for levering og opsætning, hvor du selv afleverer bagefter, eller ` +
      `${DELIVERY_BOTH_WAYS} kr hvis vi både skal levere og hente igen efter festen. Du vælger det i bookingen.`,
  });

  items.push({
    q: `Hvor længe kan jeg leje ${it}?`,
    a:
      `Fra 1 til ${MAX_RENTAL_DAYS} dage til samme pris — ${price} kr. De fleste henter fredag og afleverer mandag. ` +
      `Skal du bruge det længere, så ring på 31 13 28 52, så finder vi ud af det.`,
  });

  return items;
}
