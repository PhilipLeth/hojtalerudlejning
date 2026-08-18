import { describe, expect, it } from "vitest";
import {
  badProduct,
  trimTo,
  validEmail,
  validHexColor,
  validMediaId,
  validPhone,
  validSlug,
} from "../functions/api/_lib/validate";

describe("validSlug", () => {
  it("accepterer små bogstaver, tal og bindestreg", () => {
    expect(validSlug("demo")).toBe(true);
    expect(validSlug("regs-butik-2")).toBe(true);
  });
  it("afviser store bogstaver, specialtegn og skæve længder", () => {
    expect(validSlug("Demo")).toBe(false);
    expect(validSlug("a")).toBe(false);
    expect(validSlug("-start")).toBe(false);
    expect(validSlug("æblehave")).toBe(false);
    expect(validSlug("a".repeat(40))).toBe(false);
    expect(validSlug(42)).toBe(false);
  });
});

describe("validEmail / validPhone", () => {
  it("kender en rimelig e-mail", () => {
    expect(validEmail("reg@butik.dk")).toBe(true);
    expect(validEmail("ikke-en-mail")).toBe(false);
    expect(validEmail("a@b")).toBe(false);
  });
  it("kender danske telefonnumre med og uden landekode", () => {
    expect(validPhone("31 13 28 52")).toBe(true);
    expect(validPhone("+45 31 13 28 52")).toBe(true);
    expect(validPhone("123")).toBe(false);
    expect(validPhone("ring til mig")).toBe(false);
  });
});

describe("validMediaId", () => {
  it("matcher id'erne scene/generate udsteder", () => {
    expect(validMediaId("a1b2c3d4e5f6a7b8.jpg")).toBe(true);
    expect(validMediaId("a1b2c3d4e5f6a7b8.png")).toBe(true);
  });
  it("afviser stier og fremmede endelser — ingen path traversal", () => {
    expect(validMediaId("../andre/hemmelig.jpg")).toBe(false);
    expect(validMediaId("abc.svg")).toBe(false);
    expect(validMediaId("kort.jpg")).toBe(false);
  });
});

describe("trimTo og validHexColor", () => {
  it("trimmer og afkorter", () => {
    expect(trimTo("  hej  ", 10)).toBe("hej");
    expect(trimTo("x".repeat(20), 5)).toBe("xxxxx");
    expect(trimTo(undefined, 5)).toBe("");
  });
  it("kender hex-farver", () => {
    expect(validHexColor("#2f6b46")).toBe(true);
    expect(validHexColor("#fff")).toBe(true);
    expect(validHexColor("rød")).toBe(false);
    expect(validHexColor("2f6b46")).toBe(false);
  });
});

describe("badProduct", () => {
  const gyldigt = {
    id: "baenk-marais",
    name: "Bænk Marais",
    description: "Smedejernsbænk",
    images: ["/demo/baenk.svg"],
    active: true,
  };
  it("godkender et gyldigt produkt", () => {
    expect(badProduct(gyldigt)).toBeNull();
  });
  it("afviser manglende felter og eksterne billed-URL'er", () => {
    expect(badProduct({ ...gyldigt, id: "Stor Bænk" })).toContain("id");
    expect(badProduct({ ...gyldigt, name: "" })).toContain("navn");
    expect(badProduct({ ...gyldigt, images: ["https://ondsindet.dk/x.jpg"] })).toContain("relative");
    expect(badProduct({ ...gyldigt, active: "ja" })).toContain("active");
    expect(badProduct(null)).not.toBeNull();
  });
});
