import {describe,it,expect} from "vitest";
import {existsSync} from "node:fs";
import {eventSituations} from "@/lib/eventSituations";
import {situationPackages} from "@/lib/situationPackages";
import {speakers,addons,rentalProducts} from "@/lib/products";
import {priceDj,DJ_ID} from "@/lib/dj";
import {buildLineItems,loadPriceTable} from "../../functions/api/_lib/pricing";
describe("Situationspakker",()=>{
 it("har to forskellige pakker og begge sprog til alle situationer",()=>{
  expect(eventSituations.length).toBeGreaterThanOrEqual(16);
  const all=[...speakers,...addons,...rentalProducts];
  for(const s of eventSituations){
   expect(new Set(s.packageIds).size).toBeGreaterThanOrEqual(2);
   for(const prefix of ['', 'en/'])expect(existsSync(`src/app/${prefix}events/${s.slug}/page.tsx`)).toBe(true);
   for(const id of s.packageIds){const p=situationPackages.find(p=>p.id===id)!;expect(p).toBeDefined();const sum=p.bundle!.parts.reduce((sum,part)=>{expect(all.some(p=>p.id===part.productId)).toBe(true);return sum+part.price;},0);expect(p.price).toBeLessThanOrEqual(sum);expect(p.bundle!.discount).toBe(sum-p.price);}
  }
 });
});
describe("DJ-priser",()=>{
 it("beregner dag, nat og blandede timer inklusive moms",()=>{expect(priceDj({before23:3,after23:0}).total).toBe(3000);expect(priceDj({before23:0,after23:3}).total).toBe(4500);expect(priceDj({before23:2,after23:2}).total).toBe(5000);});
 it("afviser under tre timer, brøker, negative og manglende timer",()=>{for(const v of [undefined,{}, {before23:2,after23:0},{before23:-1,after23:4},{before23:2.5,after23:1},{before23:25,after23:0}])expect(()=>priceDj(v)).toThrow();});
 it("Stripe beregner DJ på serveren og accepterer ikke en enkelt billig time",async()=>{const table=await loadPriceTable({get:async()=>null} as unknown as KVNamespace);expect(()=>buildLineItems(table,[{id:DJ_ID}])).toThrow();const priced=buildLineItems(table,[{id:DJ_ID,dj:{before23:2,after23:2}},{id:'dj_pult'}]);expect(priced.totalOre).toBe(699500);expect(priced.lineItems[0].price_data.product_data.name).toContain('DJ/musikafvikler, 4 timer');});
 it("hver situation har sit eget kortbillede, så anledninger ikke ser ens ud",()=>{
  const images=eventSituations.map(s=>s.image);
  expect(new Set(images).size).toBe(images.length);
  for(const s of eventSituations){
   const src=s.image.startsWith("/")?`public${s.image}`:`public/images/events/${s.image}.webp`;
   expect(existsSync(src),src).toBe(true);
   expect(s.image.startsWith("/images/product"), `${s.slug} bruger et produktfoto`).toBe(false);
  }
 });
});

describe("Hvide katalogbilleder",()=>{
 it("har lokale billeder til alle aktive produkter",()=>{
  for(const p of [...speakers,...addons,...rentalProducts]){
   const image='product' in p?p.product:p.image;
   if(image?.startsWith('/images/'))expect(existsSync(`public${image}`),image).toBe(true);
  }
 });
 it("erstatter gamle gemte katalogbilleder uden at overskrive nye uploads",async()=>{
  const {whiteProductImage}=await import('@/lib/whiteProductImages');
  expect(whiteProductImage('/images/product-thumpgo-v2.webp')).toBe('/images/product-thumpgo-v2-white.webp');
  expect(whiteProductImage('/api/image/img_1789052313320_qv7h3shszi')).toBe('/images/product-lyseffekt-live-white.webp');
  expect(whiteProductImage('/api/image/new-photo')).toBe('/api/image/new-photo');
 });
});
