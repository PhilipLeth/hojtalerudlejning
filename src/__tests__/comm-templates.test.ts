/**
 * Skabelonen til opfølgningsmailen. En fejl her sender enten "{{fornvan}}"
 * ud til kunden eller efterlader huller, hvor en shortcode var tom.
 */
import { describe, it, expect } from "vitest";
import {
  DEFAULT_SETTINGS,
  buildFollowUpMail,
  parseCommSettings,
  renderTemplate,
  signatureFor,
  textToHtml,
} from "@/lib/commTemplates";

describe("renderTemplate", () => {
  it("indsætter værdier", () => {
    expect(renderTemplate("Hej {{fornavn}}!", { fornavn: "Agnes" })).toBe("Hej Agnes!");
  });

  it("tåler mellemrum og store bogstaver i shortcoden", () => {
    expect(renderTemplate("{{ Fornavn }}", { fornavn: "Agnes" })).toBe("Agnes");
  });

  it("fjerner ukendte shortcodes i stedet for at sende dem videre", () => {
    // En tastefejl i admin må aldrig ende i kundens indbakke
    expect(renderTemplate("Hej {{fornvan}}!", { fornavn: "Agnes" })).toBe("Hej !");
  });

  it("giver tom tekst når en kendt shortcode mangler værdi", () => {
    expect(renderTemplate("A{{besked}}B", {})).toBe("AB");
  });
});

describe("textToHtml", () => {
  it("laver afsnit af tomme linjer", () => {
    const html = textToHtml("Første\n\nAndet");
    expect(html).toContain("<p style=\"margin:0 0 12px;\">Første</p>");
    expect(html).toContain("Andet");
  });

  it("dropper afsnit der endte tomme", () => {
    // {{besked}} var tom → afsnittet skal ikke efterlade et hul
    const html = textToHtml("Hej\n\n\n\nFarvel");
    expect(html.match(/<p /g)).toHaveLength(2);
  });

  it("escaper HTML fra admin", () => {
    expect(textToHtml("<script>alert(1)</script>")).toContain("&lt;script&gt;");
  });

  it("gør bare URL'er klikbare", () => {
    expect(textToHtml("Se https://lejhojtaler.dk her")).toContain('<a href="https://lejhojtaler.dk"');
  });
});

describe("buildFollowUpMail", () => {
  const ctx = {
    fornavn: "Agnes",
    navn: "Agnes Dahle Stæhr",
    produkter: "Stor højtalerpakke",
    periode: "fre 21. aug → man 24. aug",
    ansvarlig: "Frederik",
    hilsen: "Frederik fra Lejhøjtaler.dk",
    besked: "Fedt I fik gang i dansegulvet!",
    rabatkode: "del10",
    rabatpct: 10,
    reviewUrl: "https://g.page/r/abc/review",
  };

  it("fylder standardteksten ud", () => {
    const mail = buildFollowUpMail(DEFAULT_SETTINGS, ctx);
    expect(mail.subject).toBe("Tak for denne gang, Agnes ⭐");
    expect(mail.html).toContain("Tak fordi du har lejet hos lejhøjtaler.dk");
    expect(mail.html).toContain("Fedt I fik gang i dansegulvet!");
    expect(mail.html).toContain("Frederik fra Lejhøjtaler.dk");
  });

  it("skriver rabatkoden med store bogstaver", () => {
    expect(buildFollowUpMail(DEFAULT_SETTINGS, ctx).html).toContain("DEL10");
    expect(buildFollowUpMail(DEFAULT_SETTINGS, ctx).html).toContain("10%");
  });

  it("laver anmeldelseslinket til en knap", () => {
    const mail = buildFollowUpMail(DEFAULT_SETTINGS, ctx);
    expect(mail.html).toContain('href="https://g.page/r/abc/review"');
    expect(mail.html).toContain("Anmeld os på Google");
  });

  it("efterlader ingen knap og intet hul uden anmeldelses-URL", () => {
    const mail = buildFollowUpMail(DEFAULT_SETTINGS, { ...ctx, reviewUrl: undefined });
    expect(mail.html).not.toContain("Anmeld os på Google");
    expect(mail.html).not.toContain("[[KNAP]]");
  });

  it("udelader udsalgsafsnittet når udsalget er slukket", () => {
    const uden = buildFollowUpMail(DEFAULT_SETTINGS, ctx);
    const med = buildFollowUpMail(DEFAULT_SETTINGS, { ...ctx, udsalg: "PS: Vi har weekendudsalg." });
    expect(uden.html).not.toContain("weekendudsalg");
    expect(med.html).toContain("PS: Vi har weekendudsalg.");
  });

  it("falder tilbage på firmanavnet når ingen ansvarlig er sat", () => {
    const mail = buildFollowUpMail(DEFAULT_SETTINGS, { ...ctx, hilsen: "" });
    expect(mail.html).toContain("Lejhøjtaler.dk");
  });
});

describe("parseCommSettings", () => {
  it("falder tilbage på standarden ved vrøvl", () => {
    const s = parseCommSettings(null);
    expect(s.referralCode).toBe("del10");
    expect(s.referralPct).toBe(10);
    expect(s.autoSend).toBe(true);
    expect(s.staff).toHaveLength(1);
  });

  it("afviser ugyldig kode og procent", () => {
    const s = parseCommSettings({ referralCode: "ø ø ø!", referralPct: 500 });
    expect(s.referralCode).toBe("del10");
    expect(s.referralPct).toBe(10);
  });

  it("normaliserer koden som rabatkoderne gør", () => {
    expect(parseCommSettings({ referralCode: "DEL-Ø10" }).referralCode).toBe("del-oe10");
  });

  it("smider tomme navne væk i personalelisten", () => {
    const s = parseCommSettings({ staff: [{ name: "Frederik", signature: "F" }, { name: "  " }] });
    expect(s.staff.map((x) => x.name)).toEqual(["Frederik"]);
  });
});

describe("signatureFor", () => {
  const settings = parseCommSettings({
    staff: [{ name: "Frederik", signature: "Frederik fra Lejhøjtaler" }, { name: "Philip", signature: "" }],
  });

  it("finder den ansvarliges underskrift", () => {
    expect(signatureFor(settings, "Frederik")).toBe("Frederik fra Lejhøjtaler");
  });

  it("bruger navnet når der ingen underskrift er", () => {
    expect(signatureFor(settings, "Philip")).toBe("Philip");
  });

  it("giver tom tekst når ingen er ansvarlig", () => {
    expect(signatureFor(settings, undefined)).toBe("");
  });
});
