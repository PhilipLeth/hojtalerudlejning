import { describe, it, expect } from "vitest";
import { DEFAULT_SETTINGS, buildConfirmationMail, parseCommSettings } from "@/lib/commTemplates";
import { paymentLine, placeLine } from "../../functions/api/_lib/confirmMail";
import { DEFAULT_SITE_SETTINGS } from "../../functions/api/_lib/siteSettings";

const site = DEFAULT_SITE_SETTINGS;

describe("hvor udstyret skal hentes", () => {
  it("siger tydeligt hvem der kører — det er den hyppigste kilde til opkald", () => {
    expect(placeLine({ deliveryOptionId: "levering_begge", deliveryAddress: "Nørrebrogade 1" }, site)).toBe(
      "Vi leverer og henter igen: Nørrebrogade 1",
    );
    expect(placeLine({ deliveryOptionId: "levering_ud", deliveryAddress: "Nørrebrogade 1" }, site)).toContain(
      "du afleverer selv",
    );
    expect(placeLine({ addonIds: ["afhentning_retur"] }, site)).toContain("Du henter hos os");
    expect(placeLine({}, site)).toContain(site.pickupAddress);
  });
});

describe("hvad der skal betales", () => {
  it("en ubetalt ordre får beløb og metode", () => {
    expect(paymentLine({ total: 1995 })).toBe(
      "I alt 1.995 kr — betales ved afhentning med MobilePay.",
    );
  });

  it("en online betalt ordre skal ikke se ud som en regning", () => {
    const line = paymentLine({ total: 1995, payments: [{ amount: 1995 }] });
    expect(line).toContain("Der er ikke mere at betale");
    expect(line).not.toContain("betales ved afhentning");
  });

  it("delvis betaling siger præcis hvad der mangler", () => {
    expect(paymentLine({ total: 2000, payments: [{ amount: 500 }] })).toBe(
      "Betalt: 500 kr. Rest ved afhentning: 1.500 kr — betales med MobilePay.",
    );
  });

  it("er der sendt faktura, skal kunden ikke bede om at have kontanter med", () => {
    expect(paymentLine({ total: 4000, invoice: { number: "2026-001" } })).toContain("faktura er sendt særskilt");
  });
});

describe("bekræftelsesmailen", () => {
  const ctx = {
    fornavn: "Agnes",
    navn: "Agnes Dahle Stæhr",
    produkter: "Stor højtalerpakke, Lys-pakke",
    periode: "fre 21. aug → man 24. aug",
    sted: "Du henter hos os: Halvtolv 9, 1. th, 1436 København K",
    betaling: "I alt 1.995 kr — betales ved afhentning med MobilePay.",
    total: 1995,
    telefon: "31 13 28 52",
    hilsen: "Frederik fra Lejhøjtaler.dk",
  };

  it("indeholder det kunden skal bruge fredag eftermiddag", () => {
    const mail = buildConfirmationMail(DEFAULT_SETTINGS, ctx);
    expect(mail.subject).toBe("Din booking er bekræftet, Agnes 🔊");
    for (const skal of ["Stor højtalerpakke", "fre 21. aug", "Halvtolv 9", "1.995 kr", "31 13 28 52", "Frederik"]) {
      expect(mail.html, skal).toContain(skal);
    }
    expect(mail.html).not.toContain("{{");
  });

  it("en ordre uden personlig besked får ikke et hul i mailen", () => {
    const mail = buildConfirmationMail(DEFAULT_SETTINGS, { ...ctx, besked: "" });
    expect(mail.html).not.toContain("<p style=\"margin:0 0 12px;\"></p>");
  });

  it("teksten kan rettes i admin uden at koden ændres", () => {
    const egen = parseCommSettings({
      confirmation: { subject: "Vi ses {{fornavn}}", body: "Hej {{fornavn}} — {{produkter}}" },
    });
    const mail = buildConfirmationMail(egen, ctx);
    expect(mail.subject).toBe("Vi ses Agnes");
    expect(mail.html).toContain("Hej Agnes - Stor højtalerpakke".replace(" - ", " — "));
  });

  it("tom skabelon falder tilbage på standarden i stedet for at sende ingenting", () => {
    const tom = parseCommSettings({ confirmation: { subject: "   ", body: "" } });
    expect(tom.confirmation.subject).toBe(DEFAULT_SETTINGS.confirmation.subject);
    expect(tom.confirmationAutoSend).toBe(true);
    expect(parseCommSettings({ confirmationAutoSend: false }).confirmationAutoSend).toBe(false);
  });
});
