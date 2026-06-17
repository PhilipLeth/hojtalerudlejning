import { describe, it, expect } from "vitest";
import { t } from "@/lib/i18n";
import { addons } from "@/lib/products";

describe("i18n - Danish", () => {
  const da = t.da;

  it("has hero section", () => {
    expect(da.hero.title).toBe("Lej en højtaler");
    expect(da.hero.cta).toBe("Book nu");
  });

  it("has booking step titles", () => {
    expect(da.booking.step1Title).toBeTruthy();
    expect(da.booking.step2Title).toBeTruthy();
    expect(da.booking.step3Title).toBeTruthy();
    expect(da.booking.step4Title).toBeTruthy();
  });

  it("has two speaker descriptions", () => {
    expect(da.booking.speakers).toHaveLength(2);
    expect(da.booking.speakers[0].id).toBe("party");
    expect(da.booking.speakers[1].id).toBe("festival");
  });

  it("has addon labels matching products.ts", () => {
    expect(da.booking.addons.length).toBe(addons.length);
    for (let i = 0; i < addons.length; i++) {
      expect(da.booking.addons[i].id).toBe(addons[i].id);
      expect(da.booking.addons[i].label).toBeTruthy();
      expect(da.booking.addons[i].desc).toBeTruthy();
    }
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

  it("has two speaker descriptions", () => {
    expect(en.booking.speakers).toHaveLength(2);
  });

  it("has addon labels matching products.ts", () => {
    expect(en.booking.addons.length).toBe(addons.length);
    for (let i = 0; i < addons.length; i++) {
      expect(en.booking.addons[i].id).toBe(addons[i].id);
    }
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
    expect(en.booking.fogOnlyFrom).toBeTruthy();
  });
});

describe("i18n - DA/EN parity", () => {
  it("same number of speakers in both locales", () => {
    expect(t.da.booking.speakers.length).toBe(t.en.booking.speakers.length);
  });

  it("same number of addons in both locales", () => {
    expect(t.da.booking.addons.length).toBe(t.en.booking.addons.length);
  });

  it("same number of testimonials in both locales", () => {
    expect(t.da.testimonials.reviews.length).toBe(t.en.testimonials.reviews.length);
  });

  it("same number of how-it-works steps", () => {
    expect(t.da.howItWorks.steps.length).toBe(t.en.howItWorks.steps.length);
  });

  it("speaker IDs match across locales", () => {
    const daIds = t.da.booking.speakers.map((s) => s.id);
    const enIds = t.en.booking.speakers.map((s) => s.id);
    expect(daIds).toEqual(enIds);
  });

  it("addon IDs match across locales", () => {
    const daIds = t.da.booking.addons.map((a) => a.id);
    const enIds = t.en.booking.addons.map((a) => a.id);
    expect(daIds).toEqual(enIds);
  });
});
