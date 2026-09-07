import { describe, it, expect } from "vitest";
import { t } from "@/lib/i18n";

describe("i18n - Danish", () => {
  const da = t.da;

  it("has hero section", () => {
    expect(da.hero.title).toBe("Lej højtalere");
    expect(da.hero.cta).toBe("Book nu");
  });

  it("has booking step titles", () => {
    expect(da.booking.step1Title).toBeTruthy();
    expect(da.booking.step2Title).toBeTruthy();
    expect(da.booking.step3Title).toBeTruthy();
    expect(da.booking.step4Title).toBeTruthy();
  });

  it("has compare table strings", () => {
    expect(da.compare.title).toBeTruthy();
    expect(da.compare.groupBattery).toBeTruthy();
    expect(da.compare.groupCable).toBeTruthy();
    expect(da.compare.noPower).toBeTruthy();
    expect(da.compare.needsPower).toBeTruthy();
  });

  // De fire opdigtede testimonials er fjernet 7. september 2026 — sitet viser
  // kun ægte Google-anmeldelser nu. Kommer der en "hvad siger kunderne"-tekst
  // tilbage i i18n, skal den have et belæg med sig.
  it("har ingen testimonials i teksterne", () => {
    expect("testimonials" in da).toBe(false);
  });

  it("har tekst til Google-anmeldelserne", () => {
    for (const felt of ["title", "badge", "seeAll", "write", "more", "less"] as const) {
      expect(da.googleReviews[felt]).toBeTruthy();
    }
  });

  it("does not contain 'Ilektra'", () => {
    const json = JSON.stringify(da);
    expect(json).not.toContain("Ilektra");
  });

  it("has 4 how-it-works steps", () => {
    expect(da.howItWorks.steps).toHaveLength(4);
  });

  it("footer links to /om, /blog, /lejevilkaar", () => {
    expect(da.footer.aboutHref).toBe("/om");
    expect(da.footer.blogHref).toBe("/blog");
    expect(da.footer.termsHref).toBe("/lejevilkaar");
  });
});

describe("i18n - English", () => {
  const en = t.en;

  it("has hero section in English", () => {
    expect(en.hero.title).toBe("Rent a speaker");
    expect(en.hero.cta).toBe("Book now");
  });

  it("has compare table strings", () => {
    expect(en.compare.title).toBeTruthy();
    expect(en.compare.groupBattery).toBeTruthy();
    expect(en.compare.groupCable).toBeTruthy();
  });

  it("har ingen testimonials i teksterne", () => {
    expect("testimonials" in en).toBe(false);
  });

  it("har engelsk tekst til Google-anmeldelserne", () => {
    expect(en.googleReviews.title).toBe("What our customers say on Google");
    expect(en.googleReviews.seeAll).toBe("See all on Google");
  });

  it("does not contain 'Ilektra'", () => {
    const json = JSON.stringify(en);
    expect(json).not.toContain("Ilektra");
  });

  it("footer links to /en/om, /en/blog, /en/lejevilkaar", () => {
    expect(en.footer.aboutHref).toBe("/en/om");
    expect(en.footer.blogHref).toBe("/en/blog");
    expect(en.footer.termsHref).toBe("/en/lejevilkaar");
  });

  it("effects-only strings exist", () => {
    expect(en.booking.effectsOnlyTitle).toBeTruthy();
    expect(en.booking.effectsOnlyLabel).toBeTruthy();
    expect(en.booking.fromShort).toBeTruthy();
  });
});

describe("i18n - DA/EN parity", () => {
  it("same keys for Google reviews in both locales", () => {
    expect(Object.keys(t.da.googleReviews).sort()).toEqual(Object.keys(t.en.googleReviews).sort());
  });

  it("same number of how-it-works steps", () => {
    expect(t.da.howItWorks.steps.length).toBe(t.en.howItWorks.steps.length);
  });

  it("compare keys match across locales", () => {
    expect(Object.keys(t.da.compare).sort()).toEqual(Object.keys(t.en.compare).sort());
  });

  it("booking keys match across locales", () => {
    expect(Object.keys(t.da.booking).sort()).toEqual(Object.keys(t.en.booking).sort());
  });
});
