/* ───── Hvilke ordrer skal have en påmindelse i dag ─────
 *
 * Udvalget er ren logik, så det kan testes uden KV og uden at sende beskeder.
 * Kørslen ligger i functions/api/sms-paamindelser.ts og kaldes én gang om
 * dagen — derfor bærer hver ordre et mærke pr. type, så en dobbeltkørsel ikke
 * sender samme påmindelse to gange.
 */

import type { SmsTypeId } from "./smsTemplates";

export interface ReminderBooking {
  id?: unknown;
  status?: unknown;
  pickup?: unknown;
  returnDate?: unknown;
  /** { afhentning_i_morgen: "2026-08-20T07:00:00Z", … } */
  smsSent?: unknown;
}

export interface DueReminder {
  id: string;
  type: Extract<SmsTypeId, "afhentning_i_morgen" | "retur_i_morgen">;
}

/** Dagen i Danmark, uanset hvornår på døgnet cron-jobbet kører (UTC) */
export function copenhagenDateKey(at: Date, offsetDays = 0): string {
  const d = new Date(at.getTime() + offsetDays * 86400000);
  // sv-SE giver YYYY-MM-DD
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Copenhagen" });
}

function dayOf(raw: unknown): string {
  const s = String(raw ?? "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

function alreadySent(b: ReminderBooking, type: string): boolean {
  const sent = b.smsSent;
  if (!sent || typeof sent !== "object") return false;
  return !!(sent as Record<string, unknown>)[type];
}

const CANCELLED = ["annulleret_kunde", "annulleret_admin"];

/**
 * Påmindelser der skal ud i dag: afhentning i dag, og aflevering i dag.
 *
 * Annullerede ordrer springes over, og en ordre der allerede er afleveret skal
 * ikke mindes om at aflevere. Er udstyret hentet, er afhentningspåmindelsen
 * også overflødig.
 */
export function remindersDue(bookings: ReminderBooking[], now: Date): DueReminder[] {
  const today = copenhagenDateKey(now, 0);
  const due: DueReminder[] = [];

  for (const b of bookings) {
    const id = String(b.id ?? "");
    if (!id) continue;
    const status = String(b.status ?? "");
    if (CANCELLED.includes(status)) continue;

    if (
      dayOf(b.pickup) === today &&
      !["afhentet", "afleveret"].includes(status) &&
      !alreadySent(b, "afhentning_i_morgen")
    ) {
      due.push({ id, type: "afhentning_i_morgen" });
    }

    if (
      dayOf(b.returnDate) === today &&
      status !== "afleveret" &&
      !alreadySent(b, "retur_i_morgen")
    ) {
      due.push({ id, type: "retur_i_morgen" });
    }
  }

  return due;
}
