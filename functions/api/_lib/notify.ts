/**
 * Modtagere af interne notifikationer (nye ordrer, kontaktformular).
 *
 * NOTIFY_EMAIL har historisk været én adresse — Frederiks private gmail — og
 * derfor endte hver eneste ordre med at blive videresendt i hånden til alle
 * andre der skulle se den. Feltet accepterer nu en kommasepareret liste, så
 * både Frederik og virksomhedskontoen får ordren direkte.
 *
 * Tomme felter og gentagelser frasorteres: en dubleret adresse ville give
 * kunden to ens mails, og en tom streng ville få Resend til at afvise hele
 * kaldet — og så ville ordren ikke nå frem til nogen.
 */
export function notifyRecipients(raw: string | undefined | null): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const addr = part.trim();
    if (!addr || seen.has(addr.toLowerCase())) continue;
    seen.add(addr.toLowerCase());
    out.push(addr);
  }
  return out;
}
