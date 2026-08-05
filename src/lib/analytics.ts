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

type Win = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

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
  }
}
