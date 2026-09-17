import { speakers, addons, rentalProducts } from "../../src/lib/products";
const out = {
  speakers: speakers.map((s) => ({ id: s.id, price: s.price, hidden: !!s.hidden, name: s.da.name })),
  addons: addons.map((a: any) => ({ id: a.id, price: a.price, hidden: !!a.hidden, name: a.da.label })),
  rentals: (rentalProducts as any[]).map((r) => ({ id: r.id, price: r.price, hidden: !!r.hidden, name: r.name_da, page: r.page,
    parts: r.bundle?.parts?.map((p: any) => ({ id: p.productId, price: p.price, qty: p.qty ?? 1 })) ?? null, discount: r.bundle?.discount ?? null })),
};
console.log(JSON.stringify(out));
