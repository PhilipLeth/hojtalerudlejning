import { describe, it, expect } from "vitest";
import { digitsOnly, formatDkPhone, phoneFromInput, DEFAULT_PHONE_DIGITS } from "@/lib/phone";

describe("phone formatting", () => {
  it("normaliserer 8 cifre med mellemrum og +45", () => {
    expect(digitsOnly("31 13 28 52")).toBe("31132852");
    expect(digitsOnly("+45 23 63 23 03")).toBe("23632303");
    expect(digitsOnly("23632303")).toBe("23632303");
  });

  it("formaterer dansk visning", () => {
    expect(formatDkPhone("31132852")).toBe("31 13 28 52");
    expect(phoneFromInput("23632303").href).toBe("tel:+4523632303");
  });

  it("falder tilbage til standardnummer ved ugyldigt input", () => {
    expect(phoneFromInput("123").digits).toBe(DEFAULT_PHONE_DIGITS);
  });
});
