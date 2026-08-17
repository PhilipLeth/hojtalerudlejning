import { describe, it, expect } from "vitest";
import {
  targetDimensions,
  formatBytes,
  compressImage,
  MAX_UPLOAD_BYTES,
  MAX_EDGE,
} from "@/lib/compressImage";

describe("targetDimensions", () => {
  it("skalerer ikke billeder der allerede er små nok op", () => {
    expect(targetDimensions(800, 600)).toEqual({ width: 800, height: 600 });
    expect(targetDimensions(MAX_EDGE, 900)).toEqual({ width: MAX_EDGE, height: 900 });
  });

  it("holder længste kant på maxEdge og bevarer sideforholdet", () => {
    const { width, height } = targetDimensions(4000, 3000);
    expect(width).toBe(MAX_EDGE);
    expect(height).toBe(Math.round(3000 * (MAX_EDGE / 4000)));
    expect(width / height).toBeCloseTo(4000 / 3000, 2);
  });

  it("skalerer efter højden når billedet er stående", () => {
    const { width, height } = targetDimensions(3000, 4000);
    expect(height).toBe(MAX_EDGE);
    expect(width).toBeLessThan(MAX_EDGE);
  });

  it("går aldrig til nul på ekstreme sideforhold", () => {
    const { width, height } = targetDimensions(10000, 3, 1600);
    expect(width).toBe(1600);
    expect(height).toBeGreaterThanOrEqual(1);
  });
});

describe("formatBytes", () => {
  it("bruger MB over en million og dansk decimalkomma", () => {
    expect(formatBytes(2_400_000)).toBe("2,4 MB");
    expect(formatBytes(1_000_000)).toBe("1,0 MB");
  });

  it("bruger kB under en million", () => {
    expect(formatBytes(812_000)).toBe("812 kB");
    expect(formatBytes(1_500)).toBe("2 kB");
  });
});

describe("compressImage", () => {
  // jsdom har hverken createImageBitmap eller canvas.toBlob, hvilket er præcis
  // det fallback-tilfælde der skal virke: kan billedet ikke afkodes, skal
  // originalen komme tilbage frem for at kaste.
  it("returnerer originalen når browseren ikke kan afkode filen", async () => {
    const file = new File([new Uint8Array(2_000_000)], "foto.heic", { type: "image/heic" });
    const res = await compressImage(file);
    expect(res.compressed).toBe(false);
    expect(res.file).toBe(file);
    expect(res.bytes).toBe(2_000_000);
  });

  it("lader små filer være urørte", async () => {
    const file = new File([new Uint8Array(50_000)], "lille.jpg", { type: "image/jpeg" });
    const res = await compressImage(file);
    expect(res.compressed).toBe(false);
    expect(res.bytes).toBe(50_000);
  });

  it("melder en størrelse ImageField kan afvise på", async () => {
    const file = new File([new Uint8Array(3_000_000)], "stort.png", { type: "image/png" });
    const res = await compressImage(file);
    expect(res.bytes).toBeGreaterThan(MAX_UPLOAD_BYTES);
  });
});
