/** Konverteringssporing til GA4 + GTM.
 *
 * Historik: bookinger blev ikke registreret som konverteringer i GA4, fordi
 *  1) koden kun pushede til dataLayer HVIS window.dataLayer allerede fandtes —
 *     var GTM ikke nået at loade (afterInteractive/adblocker), forsvandt eventet tavst
 *  2) et custom dataLayer-event ("booking_complete") kun når GA4, hvis GTM er sat
 *     op med trigger + GA4-tag. Vi sender derfor OGSÅ GA4's standard purchase-event
 *     direkte via gtag, så konverteringen registreres uden GTM-konfiguration
 *  3) online-betalinger sporede FØR betaling og mistede eventet ved redirect til
 *     Stripe. Purchase sendes nu fra kvitteringssiden når betalingen er bekræftet.
 */

/**
 * Google Ads-konverteringen "Køb" (handling 7659189774 på konto 441-020-7627).
 *
 * Indtil 17. august 2026 nåede bookinger kun frem til Ads via GA4-importen, som
 * er langsom og taber attribution undervejs. Kontoen registrerede ét køb på 30
 * dage, mens Performance Max brugte 1000 kr/dag uden noget at optimere mod.
 * Dette event rapporterer direkte.
 *
 * Etiketten kommer fra konverteringshandlingens eget tag-snippet og hører
 * sammen med konverterings-id'et — skift ikke det ene uden det andet.
 */
export const ADS_CONVERSION_ID = "AW-18265431278";
export const ADS_PURCHASE_SEND_TO = `${ADS_CONVERSION_ID}/BHAoCI7sl8QcEO650YVE`;

export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

export interface PurchaseEvent {
  /** Booking-id — bruges som transaction_id så GA4 kan deduplikere */
  transactionId: string;
  value: number;
  currency?: string;
  items?: PurchaseItem[];
  /** "online" eller "pickup" — med som parameter, så I kan segmentere */
  paymentMethod?: string;
}

export interface BookingFormStartEvent {
  /** Kurvens værdi ved formular-start (step 4) */
  value?: number;
  /** Antal produkter/linjer i kurven */
  itemCount?: number;
}

type Win = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

/** Én form_start pr. session — undgår dobbelttælling ved tilbage/ frem i flowet */
function bookingFormStartAlreadyTracked(): boolean {
  try {
    const key = "booking_form_start_tracked";
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, "1");
    return false;
  } catch {
    return false;
  }
}

/** Har vi allerede sporet denne booking? (sessionStorage overlever redirect til Stripe) */
function alreadyTracked(transactionId: string): boolean {
  try {
    const key = `purchase_tracked_${transactionId}`;
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, "1");
    return false;
  } catch {
    return false; // privat browsing e.l. — hellere spore end at miste eventet
  }
}

/**
 * Booking-formular start (step 4: navn/e-mail/telefon).
 * Sender GA4's standard form_start med form_id=booking, så key event
 * kan filtreres fra kontakt/nyhedsbrev (Enhanced Measurement).
 */
export function trackBookingFormStart(e: BookingFormStartEvent = {}): void {
  if (typeof window === "undefined") return;
  if (bookingFormStartAlreadyTracked()) return;

  const w = window as Win;
  const currency = "DKK";

  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: "form_start",
    form_id: "booking",
    form_name: "Book udstyr",
    form_destination: "https://lejhojtaler.dk/#book",
    value: e.value,
    currency,
    item_count: e.itemCount,
  });
  w.dataLayer.push({
    event: "booking_form_start",
    booking_value: e.value,
    item_count: e.itemCount,
  });

  if (typeof w.gtag === "function") {
    w.gtag("event", "form_start", {
      form_id: "booking",
      form_name: "Book udstyr",
      value: e.value,
      currency,
    });
  }
}

/**
 * Sender konverteringen til både GA4 (gtag purchase) og GTM (dataLayer).
 * Kaldes når en booking er gennemført — for online betaling først når
 * betalingen er bekræftet.
 */
export function trackPurchase(e: PurchaseEvent): void {
  if (typeof window === "undefined") return;
  const w = window as Win;
  const currency = e.currency ?? "DKK";

  if (e.transactionId && alreadyTracked(e.transactionId)) return;

  // 1) GTM: dataLayer initialiseres hvis den ikke findes endnu, så eventet
  //    aldrig forsvinder tavst. GTM tømmer køen når containeren loader.
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: e.transactionId,
      value: e.value,
      currency,
      payment_type: e.paymentMethod,
      items: (e.items ?? []).map((i) => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity ?? 1,
      })),
    },
  });
  // Bevar det gamle event-navn, hvis der allerede er triggers på det i GTM
  w.dataLayer.push({
    event: "booking_complete",
    booking_value: e.value,
    booking_currency: currency,
    booking_id: e.transactionId,
  });

  // 2) GA4 direkte — registreres som purchase uden GTM-opsætning
  if (typeof w.gtag === "function") {
    w.gtag("event", "purchase", {
      transaction_id: e.transactionId,
      value: e.value,
      currency,
      payment_type: e.paymentMethod,
      items: (e.items ?? []).map((i) => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity ?? 1,
      })),
    });

    // 3) Google Ads direkte. Samme gtag.js betjener flere destinationer, så
    //    dette kræver kun at layoutet også har kaldt config for AW-id'et.
    //    transaction_id er det samme som til GA4, så Ads kan deduplikere hvis
    //    GA4-importen stadig er slået til imens.
    w.gtag("event", "conversion", {
      send_to: ADS_PURCHASE_SEND_TO,
      transaction_id: e.transactionId,
      value: e.value,
      currency,
    });
  }
}
