/* ───── Fejl hos kunden ─────
 *
 * En kunde der får en fejl midt i en booking skriver sjældent til os — han
 * lukker fanen. Vi så derfor kun de bookinger der lykkedes, og aldrig dem der
 * gik galt. Det her sender fejlen hjem, mens kunden stadig står i den.
 *
 * Rapporterne indeholder ALDRIG navn, mail eller telefon. Vi gemmer hvad der
 * gik galt og nok om situationen til at kunne genskabe den: hvilket trin,
 * hvilket produkt, hvilke datoer, hvilken slags enhed.
 */

export type FejlType =
  /** Booking kunne ikke sendes — det dyreste, kunden var klar til at købe */
  | "booking_fejlede"
  /** Betalingen kunne ikke startes (Stripe) */
  | "betaling_fejlede"
  /** Ledigheden kunne ikke hentes, så kunden bookede i blinde */
  | "ledighed_fejlede"
  /** Kunden blev mødt af "udsolgt" — ikke en fejl, men værd at tælle */
  | "udsolgt"
  /** Ufanget JavaScript-fejl et sted på sitet */
  | "javascript"
  /** Et løfte der fejlede uden at nogen tog imod det */
  | "promise";

export interface FejlContext {
  /** Hvor i booking-forløbet: 1 datoer, 2 tilvalg, 3 kontakt … */
  trin?: number;
  produkt?: string;
  fra?: string;
  til?: string;
  /** HTTP-status fra det kald der fejlede */
  status?: number;
  /** Serverens egen fejltekst, hvis der var en */
  svar?: string;
  side?: string;
}

/** Støj vi ikke vil vækkes af: browserudvidelser og afbrudte kald */
const IGNORER = [
  "ResizeObserver loop",
  "Script error.",
  "chrome-extension://",
  "moz-extension://",
  "safari-extension://",
  "The operation was aborted",
  "Load failed",
  "NetworkError when attempting to fetch resource",
];

/** Max rapporter pr. sidevisning — én ødelagt side må ikke kunne spamme os */
const MAX_PR_SESSION = 5;
let sendt = 0;
const set = new Set<string>();

export function skalIgnoreres(besked: string): boolean {
  return IGNORER.some((m) => besked.includes(m));
}

/**
 * Kort beskrivelse af enheden. Ikke fingeraftryk — kun nok til at kunne se, om
 * fejlene sidder på telefoner, på en bestemt browser, eller i en app-browser
 * som Instagrams, der blokerer tredjeparts-scripts.
 */
export function enhedsbeskrivelse(ua: string, bredde: number): string {
  const app = /Instagram/i.test(ua)
    ? "Instagram-app"
    : /FBAN|FBAV/i.test(ua)
      ? "Facebook-app"
      : /Snapchat/i.test(ua)
        ? "Snapchat-app"
        : null;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua) && !/Chromium/.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua)
          ? "Safari"
          : "ukendt browser";
  const os = /iPhone|iPad|iPod/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Macintosh/.test(ua)
        ? "Mac"
        : /Windows/.test(ua)
          ? "Windows"
          : "ukendt";
  const form = bredde > 0 && bredde < 700 ? "telefon" : bredde < 1100 ? "tablet" : "computer";
  return [app ?? browser, os, form].join(" · ");
}

export function rapporterFejl(type: FejlType, besked: string, ctx: FejlContext = {}): void {
  if (typeof window === "undefined") return;
  const kort = String(besked ?? "").slice(0, 300);
  if (!kort || skalIgnoreres(kort)) return;

  // Samme fejl to gange i træk siger ikke mere end én gang
  const nøgle = `${type}:${kort}:${ctx.trin ?? ""}`;
  if (set.has(nøgle) || sendt >= MAX_PR_SESSION) return;
  set.add(nøgle);
  sendt++;

  const krop = JSON.stringify({
    type,
    besked: kort,
    enhed: enhedsbeskrivelse(navigator.userAgent, window.innerWidth),
    ua: navigator.userAgent.slice(0, 200),
    bredde: window.innerWidth,
    side: ctx.side ?? window.location.pathname + window.location.search,
    ...ctx,
  });

  try {
    // keepalive, så rapporten når frem selv om kunden lukker fanen bagefter
    fetch("/api/fejl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: krop,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* en fejlrapport må aldrig selv kunne vælte siden */
  }
}

/** Ufangede fejl på hele sitet — installeres én gang fra layoutet */
export function installerFejlopsamling(): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { __fejlopsamling?: boolean };
  if (w.__fejlopsamling) return;
  w.__fejlopsamling = true;

  window.addEventListener("error", (e) => {
    const kilde = e.filename ? ` (${e.filename.split("/").pop()}:${e.lineno})` : "";
    rapporterFejl("javascript", `${e.message}${kilde}`);
  });

  window.addEventListener("unhandledrejection", (e) => {
    const grund = e.reason;
    const besked = grund instanceof Error ? grund.message : String(grund ?? "ukendt");
    rapporterFejl("promise", besked);
  });
}
