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

  it("has 4 testimonials", () => {
    expect(da.testimonials.reviews).toHaveLength(4);
  });

  it("testimonials have name, date, text", () => {
    for (const r of da.testimonials.reviews) {
      expect(r.name).toBeTruthy();
      expect(r.date).toBeTruthy();
      expect(r.text.length).toBeGreaterThan(20);
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

  it("has 4 testimonials", () => {
    expect(en.testimonials.reviews).toHaveLength(4);
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
  it("same number of testimonials in both locales", () => {
    expect(t.da.testimonials.reviews.length).toBe(t.en.testimonials.reviews.length);
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
