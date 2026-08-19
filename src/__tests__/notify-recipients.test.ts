import { describe, it, expect } from "vitest";
import { notifyRecipients } from "../../functions/api/_lib/notify";
import { validateCompany } from "../lib/siteInfo";

describe("notifyRecipients", () => {
  it("holder én adresse uændret", () => {
    expect(notifyRecipients("frederikemil8@gmail.com")).toEqual(["frederikemil8@gmail.com"]);
  });

  it("deler en kommasepareret liste og trimmer mellemrum", () => {
    expect(notifyRecipients("frederikemil8@gmail.com, lejhojtaler@gmail.com")).toEqual([
      "frederikemil8@gmail.com",
      "lejhojtaler@gmail.com",
    ]);
  });

  it("springer tomme felter over, så en efterladt komma ikke afviser hele mailen", () => {
    expect(notifyRecipients("a@b.dk,,  ,c@d.dk,")).toEqual(["a@b.dk", "c@d.dk"]);
  });

  it("fjerner gengangere uanset store bogstaver — ellers får modtageren ordren to gange", () => {
    expect(notifyRecipients("Info@Lejhojtaler.dk, info@lejhojtaler.dk")).toEqual([
      "Info@Lejhojtaler.dk",
    ]);
  });

  it("giver en tom liste når variablen mangler", () => {
    expect(notifyRecipients(undefined)).toEqual([]);
    expect(notifyRecipients("")).toEqual([]);
    expect(notifyRecipients("   ")).toEqual([]);
  });
});

describe("validateCompany — mailfeltet rummer modtagerne", () => {
  const base = {
    name: "Scharling Studio",
    street: "Vermlandsgade 66",
    postalCode: "2300",
    city: "København",
    cvr: "40994904",
  };

  it("tager én adresse", () => {
    const r = validateCompany({ ...base, email: "info@lejhojtaler.dk" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.company.email).toBe("info@lejhojtaler.dk");
  });

  it("tager flere adskilt af komma og normaliserer mellemrum", () => {
    const r = validateCompany({ ...base, email: "info@lejhojtaler.dk ,lejhojtaler@gmail.com" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.company.email).toBe("info@lejhojtaler.dk, lejhojtaler@gmail.com");
  });

  it("afviser hele feltet hvis én adresse er forkert — ellers ryger den lydløst", () => {
    const r = validateCompany({ ...base, email: "info@lejhojtaler.dk, ikke-en-mail" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("ikke-en-mail");
  });

  it("afviser et tomt felt", () => {
    expect(validateCompany({ ...base, email: "  ,  " }).ok).toBe(false);
  });

  it("klipper ikke midt i den sidste adresse ved tre modtagere", () => {
    const email = "frederikemil8@gmail.com, lejhojtaler@gmail.com, info@lejhojtaler.dk";
    const r = validateCompany({ ...base, email });
    expect(r.ok).toBe(true);
    if (r.ok) expect(notifyRecipients(r.company.email)).toHaveLength(3);
  });
});
