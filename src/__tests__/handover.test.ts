/**
 * Udlevering med underskrift på mobilen + at leveringen rent faktisk bliver
 * sat på ordren. Kilde-niveau, fordi begge dele lever i Cloudflare-funktioner
 * og i sider der kræver KV/canvas for at køre.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("Udleveringskvittering (/api/handover)", () => {
  const src = read("functions/api/handover.ts");

  it("kræver admin-hemmeligheden", () => {
    expect(src).toContain("ADMIN_SECRET");
    expect(src).toContain("Unauthorized");
  });

  it("gemmer underskriften for sig, ikke inde i bookingen", () => {
    expect(src).toContain("handover_sig_");
    // Bookingen bærer kun metadata — ellers vokser /api/bookings ud af proportion
    expect(src).toMatch(/booking\.handover = \{[\s\S]*signedAt/);
    expect(src).not.toMatch(/booking\.handover[\s\S]{0,200}signature:/);
  });

  it("afviser alt der ikke er et PNG, og sætter en størrelsesgrænse", () => {
    expect(src).toContain("data:image/png;base64,");
    expect(src).toContain("MAX_SIGNATURE_CHARS");
  });

  it("sætter bookingen til udleveret når kunden har kvitteret", () => {
    expect(src).toMatch(/booking\.status = "afhentet"/);
  });
});

describe("Udleveringssiden", () => {
  const src = read("src/app/admin/udlevering/page.tsx");

  it("bruger de fælles ordrelinjer til afkrydsningslisten", () => {
    expect(src).toContain('from "@/lib/orderLines"');
    expect(src).toContain("orderLines(booking)");
  });

  it("har et underskriftsfelt der virker med finger (pointer + touchAction)", () => {
    expect(src).toContain("onPointerDown");
    expect(src).toContain('touchAction: "none"');
    expect(src).toContain('toDataURL("image/png")');
  });

  it("viser betalingsstatus og beløb tydeligt — også ved delbetaling", () => {
    expect(src).toContain("SKAL BETALES NU");
    expect(src).toContain("MANGLER");
    expect(src).toContain("paymentStatus(booking)");
  });
});

describe("Admin er brugbar på mobil", () => {
  const src = read("src/app/admin/page.tsx");

  it("skifter fra tabel til kort på små skærme", () => {
    expect(src).toContain("useIsMobile");
    expect(src).toContain("matchMedia");
    expect(src).toContain("BookingCards");
  });

  it("viser hele ordren — ikke kun hovedproduktet", () => {
    expect(src).toContain("OrderSummary");
    expect(src).toContain("orderLines(b)");
  });

  it("har betalingsstatus som eget banner på kortet", () => {
    expect(src).toContain("PaymentBanner");
    // Teksterne kommer fra den fælles betalingsmodel
    expect(src).toContain("PAYMENT_STATUS_META");
    expect(src).toContain("paymentStatus(b)");
  });

  it("linker til udlevering med underskrift", () => {
    expect(src).toContain("/admin/udlevering?id=");
  });
});

describe("Lejesedlen", () => {
  const src = read("src/app/admin/lejeseddel/page.tsx");

  it("bygger udstyrslisten af ordrelinjerne", () => {
    expect(src).toContain('from "@/lib/orderLines"');
    expect(src).toContain("orderLines(b)");
    // Den gamle "alt er en højttaler"-linje må ikke komme igen
    expect(src).not.toContain("Højttaler (${b.speaker}");
  });

  it("trykker kundens underskrift med når den findes", () => {
    expect(src).toContain("/api/handover?secret=");
    expect(src).toContain("Lejers underskrift");
  });

  it("skriver hvilken vej der køres", () => {
    expect(src).toContain("deliveryInfo(selected)");
    expect(src).toContain("Kørsel:");
  });
});

describe("Levering bliver sat på ordren", () => {
  const flow = read("src/components/BookingFlow.tsx");
  const book = read("functions/api/book.ts");

  it("kan ikke sende en booking med kørsel uden adresse", () => {
    expect(flow).toContain("deliveryAddressMissing");
    expect(flow).toMatch(/if \(deliveryAddressMissing\) \{\s*setShowDeliveryError\(true\);\s*setStep\(3\)/);
  });

  it("sender hvilken vej der køres med til serveren", () => {
    expect(flow).toContain("deliveryOptionId: deliveryChoice");
    expect(book).toContain("deliveryOptionId");
  });

  it("skriver kørslen i både ejer- og kundemailen", () => {
    const owner = book.slice(book.indexOf("const ownerHtml"), book.indexOf("const customerHtml"));
    const customer = book.slice(book.indexOf("const customerHtml"), book.indexOf("const fromEmail"));
    expect(owner).toContain("Kørsel:");
    expect(customer).toContain("Kørsel:");
  });
});
