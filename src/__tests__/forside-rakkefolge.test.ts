import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { eventSolutions, solutionHref } from "@/lib/eventSolutions";
import { speakers, addons, rentalProducts } from "@/lib/products";
import { localizedHref } from "@/lib/enPages";

describe("AV-forsiden og eventløsningerne", () => {
 it("giver alle fire løsninger udstyr fra det eksisterende katalog", () => {
  const ids = new Set([...speakers,...addons,...rentalProducts].map(p=>p.id));
  expect(eventSolutions).toHaveLength(4);
  for(const s of eventSolutions) for(const id of s.productIds) expect(ids.has(id),`${s.id}: ${id}`).toBe(true);
 });
 it("fører den valgte løsning til forespørgslen på kundens sprog", () => {
  for(const s of eventSolutions) {
   expect(solutionHref(s.id,"da")).toBe(`/eventloesninger?loesning=${s.id}#foresp`);
   expect(solutionHref(s.id,"en")).toBe(`/en/eventloesninger?loesning=${s.id}#foresp`);
   expect(fs.existsSync(`public/images/events/${s.image}.webp`)).toBe(true);
  }
 });
 it("bevarer adgang til de store festpakker på begge sprog", () => {
  const home=fs.readFileSync("src/components/EventHome.tsx","utf8");
  for(const path of ["/festpakke-150","/festpakke-250"]) {
   expect(home).toContain(`href("${path}")`);
   expect(localizedHref(path,"en")).toBe(`/en${path}`);
  }
 });
 it("begge forsider bruger samme præsentation uden Halloween-kampagnen", () => {
  for(const path of ["src/app/page.tsx","src/app/en/page.tsx"]) {
   const source=fs.readFileSync(path,"utf8");expect(source).toContain("EventHome");expect(source).not.toContain("HalloweenHome");
  }
 });
 it("forsiden linker til aktive sæsoner i stedet for at erstatte EventHome", () => {
  const home = fs.readFileSync("src/components/EventHome.tsx","utf8");
  expect(home).toContain("SeasonalStrip");
  const strip = home.indexOf("<SeasonalStrip");
  const shop = home.indexOf("<ShopPackagePicker");
  expect(strip).toBeGreaterThan(0);
  expect(strip).toBeLessThan(shop);
 });
 it("sæsonkortene er store billedpaneler på desktop", () => {
  const css = fs.readFileSync("src/components/EventHome.module.css","utf8");
  expect(css).toMatch(/\.seasonCard\{[^}]*min-height:560px/);
  expect(css).toMatch(/78vh/);
  expect(css).toMatch(/\.seasonCard img\{[^}]*object-fit:cover/);
  expect(css).toMatch(/\.seasonStrip\{[^}]*max-width:none/);
 });
});
