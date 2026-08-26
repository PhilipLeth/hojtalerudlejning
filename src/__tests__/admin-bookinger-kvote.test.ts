/**
 * /admin må ikke bruge dagens KV-kvote op.
 *
 * 26. august 2026 svarede /admin "Failed to list bookings". Det var ikke en
 * fejl i koden: Cloudflares gratis KV tillader 1.000 list-operationer i
 * døgnet, og de var brugt op.
 *
 * Årsagen var admin selv. Siden poller /api/bookings hvert 30. sekund, og
 * hvert kald lavede ét råt KV-list — 120 i timen. En enkelt åben admin-fane
 * brugte hele døgnets kvote på under otte timer.
 *
 * Det samme skete for /api/availability den 21. august og blev løst med
 * bookingIndex. Admin-endepunktet blev bare aldrig flyttet med over.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const src = readFileSync(join(process.cwd(), "functions/api/bookings.ts"), "utf8");
const admin = readFileSync(join(process.cwd(), "src/app/admin/page.tsx"), "utf8");

describe("/api/bookings", () => {
  it("lister ikke KV selv — den bruger det delte indeks", () => {
    expect(src).not.toMatch(/BOOKINGS\.list\(/);
    expect(src).toMatch(/hentBookingIndex/);
  });

  it("henter ikke bookingerne én ad gangen", () => {
    expect(src).not.toMatch(/BOOKINGS\.get\(/);
  });

  it("fortæller admin når tallene er de sidst kendte", () => {
    // Uden det flag ligner en tom liste "ingen bookinger" i stedet for
    // "vi kunne ikke hente dem" — den forkerte konklusion at give Frederik.
    expect(src).toMatch(/foraeldet/);
  });
});

describe("/admin", () => {
  it("viser en advarsel i stedet for at lade en tom liste stå alene", () => {
    expect(admin).toMatch(/foraeldet/);
    expect(admin).toMatch(/ikke at der ingen bookinger er/);
  });

  it("poller stadig, men det er nu gratis", () => {
    // Pollingen er ikke problemet, når svaret kommer fra cachen. Står den her
    // sammen med et råt list igen, er kvoten væk inden aften.
    expect(admin).toMatch(/setInterval\(fetchBookings, \d+\)/);
  });
});
