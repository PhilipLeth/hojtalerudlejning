import { describe, it, expect } from "vitest";
import { normalizeSocials, validateSocials, socialEntries, TOMME_SOCIALS } from "@/lib/socials";

describe("sociale links — normalisering", () => {
  it("tomt/ugyldigt input giver tomme felter", () => {
    expect(normalizeSocials(undefined)).toEqual(TOMME_SOCIALS);
    expect(normalizeSocials(null)).toEqual(TOMME_SOCIALS);
    expect(normalizeSocials("kage")).toEqual(TOMME_SOCIALS);
  });

  it("gyldige https-links på platformens domæne bevares", () => {
    const ud = normalizeSocials({
      facebook: "https://www.facebook.com/lejhojtaler",
      instagram: "https://instagram.com/lejhojtaler",
    });
    expect(ud.facebook).toBe("https://www.facebook.com/lejhojtaler");
    expect(ud.instagram).toBe("https://instagram.com/lejhojtaler");
    expect(ud.tiktok).toBe("");
  });

  it("http, forkert domæne og skrald bliver tomt — aldrig linket", () => {
    const ud = normalizeSocials({
      facebook: "http://www.facebook.com/lejhojtaler",
      instagram: "https://ond-side.dk/instagram.com",
      tiktok: "javascript:alert(1)",
      linkedin: "lejhojtaler",
    });
    expect(ud).toEqual(TOMME_SOCIALS);
  });
});

describe("sociale links — validering ved gemning", () => {
  it("tomme felter er OK — de betyder 'har vi ikke'", () => {
    const v = validateSocials({ facebook: "", instagram: "  " });
    expect(v.ok).toBe(true);
  });

  it("et link på forkert domæne giver en fejl til admin, ikke stille sletning", () => {
    const v = validateSocials({ facebook: "https://faecbook.com/lejhojtaler" });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.error).toContain("Facebook");
  });

  it("http afvises med besked", () => {
    const v = validateSocials({ youtube: "http://youtube.com/@lejhojtaler" });
    expect(v.ok).toBe(false);
  });

  it("gyldige links kommer igennem", () => {
    const v = validateSocials({
      facebook: "https://www.facebook.com/lejhojtaler",
      youtube: "https://www.youtube.com/@lejhojtaler",
    });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.socials.facebook).toBe("https://www.facebook.com/lejhojtaler");
      expect(v.socials.youtube).toBe("https://www.youtube.com/@lejhojtaler");
    }
  });
});

describe("socialEntries", () => {
  it("kun udfyldte platforme, i fast rækkefølge", () => {
    const links = socialEntries({
      ...TOMME_SOCIALS,
      instagram: "https://instagram.com/lejhojtaler",
      facebook: "https://facebook.com/lejhojtaler",
    });
    expect(links.map((l) => l.id)).toEqual(["facebook", "instagram"]);
    expect(links[0].label).toBe("Facebook");
  });

  it("tom konfiguration giver tom liste — footeren viser så ingenting", () => {
    expect(socialEntries(TOMME_SOCIALS)).toEqual([]);
  });
});
