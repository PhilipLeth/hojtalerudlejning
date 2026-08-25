/** Timeout på alt udgående.
 *
 * 24. august 2026 hang /api/book i over to minutter, og kunden fik Cloudflares
 * 524-side — selvom ordren for længst lå i KV, og begge bekræftelsesmails var
 * sendt. Ingen af de udgående kald (Resend, SMS-gatewayen, web-push) havde en
 * timeout, så én tredjepart der holdt op med at svare kunne holde hele
 * bookingen i gidsel.
 *
 * Tiderne herunder er sat generøst med vilje: de skal fange et kald der er
 * HOLDT OP med at svare, ikke et der bare er langsomt. En mail der tager ti
 * sekunder skal stadig nå frem.
 */

/** Resend — mails er det eneste udgående kald kunden venter på med rette */
export const TIMEOUT_MAIL_MS = 15_000;
/** SMS-gatewayen — gatewayen svarer normalt på under et sekund */
export const TIMEOUT_SMS_MS = 10_000;
/** Web-push til Apple og Google */
export const TIMEOUT_PUSH_MS = 10_000;

/**
 * AbortSignal.timeout, men uden at vælte i et miljø der ikke har den.
 *
 * Workers og Node 18+ har den; en gammel jsdom kan mangle den, og et manglende
 * signal må aldrig være det, der får et kald til at kaste.
 */
export function timeoutSignal(ms: number): AbortSignal | undefined {
  return typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
    ? AbortSignal.timeout(ms)
    : undefined;
}
