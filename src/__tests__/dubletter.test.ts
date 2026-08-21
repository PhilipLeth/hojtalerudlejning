/**
 * To ordrer på samme udstyr, fordi kunden trykkede to gange, er ikke en
 * bestilling — det er en fejl, nogen skal rydde op i, og en kunde der tror han
 * har booket dobbelt. Og ledigheden må ikke kunne vælte, fordi KV's kvote er
 * brugt op: så bookede kunderne i blinde.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const læs = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("Dobbelttryk giver ikke to ordrer", () => {
  const src = læs("functions/api/book.ts");

  it("kender ordren igen på kunde, datoer og beløb", () => {
    expect(src).toContain("dubletNøgle");
    for (const felt of ["email", "phone", "pickup", "returnDate", "total"]) {
      expect(src, `${felt} indgår ikke i nøglen`).toMatch(new RegExp(`data\\.${felt}`));
    }
  });

  it("svarer med den FØRSTE ordres nummer, ikke en fejl", () => {
    // Kunden skal se sin kvittering — ikke tro at der gik noget galt
    expect(src).toMatch(/duplikat: true/);
    expect(src).toMatch(/bookingId: tidligere/);
  });

  it("sætter først spærren når ordren ligger i KV", () => {
    const put = src.indexOf("BOOKINGS.put(key,");
    const spærre = src.indexOf("BOOKINGS.put(dubletKey");
    expect(put).toBeGreaterThan(0);
    expect(spærre).toBeGreaterThan(put);
  });

  it("lader ordren gå igennem, hvis spærren ikke kan læses", () => {
    // En fejl i dubletkontrollen må aldrig koste en booking
    expect(src).toMatch(/kunne ikke tjekke dublet/);
  });

  it("vinduet er ti minutter — ikke så langt at en ægte gentagelse spærres", () => {
    expect(src).toMatch(/DUBLET_VINDUE_SEK = 600/);
  });
});

describe("Ledigheden overlever en opbrugt KV-kvote", () => {
  const index = læs("functions/api/_lib/bookingIndex.ts");
  const avail = læs("functions/api/availability.ts");

  it("lister ikke KV ved hvert besøg længere", () => {
    expect(avail).not.toContain('list({ prefix: "booking_" })');
    expect(avail).not.toContain('list({ prefix: "blocked_" })');
    expect(avail).toContain("hentBookingIndex");
  });

  it("falder tilbage på sidst kendte tal frem for at fejle", () => {
    expect(index).toContain("NOEDKOPI_URL");
    expect(index).toMatch(/forældet: true/);
  });

  it("svarer med tomt indeks frem for at kaste, når intet kan hentes", () => {
    // En kalender med rigtige lagertal og ukendt belægning er stadig brugbar.
    // En 500-fejl er ikke — og det er den, der får kunder til at prøve igen.
    expect(index).toMatch(/return \{ bookinger: \[\], blokerede: \[\]/);
    expect(index).not.toMatch(/^\s*throw e;$/m);
  });

  it("cachen ryddes når en booking oprettes eller ændres", () => {
    expect(læs("functions/api/book.ts")).toContain("nulstilBookingIndex");
    expect(læs("functions/api/bookings-update.ts")).toContain("nulstilBookingIndex");
  });
});

describe("Kvitteringen fjerner tvivlen", () => {
  const flow = læs("src/components/BookingFlow.tsx");
  const i18n = læs("src/lib/i18n.ts");

  it("viser ordrenummeret, kunden kan henvise til", () => {
    expect(flow).toContain("ordreNr");
    expect(i18n).toContain("orderNumber");
  });

  it("siger eksplicit at man ikke skal bestille igen — på begge sprog", () => {
    expect(flow).toContain("noNeedToRebook");
    expect(i18n).toMatch(/du skal ikke sende den igen/);
    expect(i18n).toMatch(/no need to submit it again/);
  });
});
