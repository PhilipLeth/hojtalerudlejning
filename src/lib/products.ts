/* ───── Single source of truth for all product data ───── */

export interface Speaker {
  id: string;
  price: number;
  product: string;
  mood: string;
}

export interface Addon {
  id: string;
  price: number;
  image: string | null;
}

export const speakers: Speaker[] = [
  {
    id: "party",
    price: 399,
    product: "/images/product-party.png",
    mood: "/images/mood-party.png",
  },
  {
    id: "festival",
    price: 700,
    product: "/images/product-festival.png",
    mood: "/images/mood-festival.png",
  },
];

export const addons: Addon[] = [
  { id: "lys", price: 500, image: "/images/product-lys.png" },
  { id: "rog", price: 250, image: "/images/product-rog.png" },
  { id: "stativer", price: 100, image: "/images/product-stativer.png" },
  { id: "taske", price: 100, image: "/images/product-taske.png" },
  { id: "levering", price: 500, image: null },
];

/** Price multiplier by number of rental days (base = 3 days / weekend) */
export const dayMultiplier: Record<number, number> = {
  1: 0.8,
  2: 0.9,
  3: 1.0,
  4: 1.2,
  5: 1.4,
};

/* ───── Summer sale: 25% off everything in June & July ───── */

const SUMMER_DISCOUNT = 0.25;
const SUMMER_MONTHS = [5, 6]; // 0-indexed: 5 = June, 6 = July

export function isSummerSale(): boolean {
  return SUMMER_MONTHS.includes(new Date().getMonth());
}

export function applyDiscount(price: number): number {
  if (!isSummerSale()) return price;
  return Math.round(price * (1 - SUMMER_DISCOUNT));
}

/** Cheapest speaker price — use in meta tags, hero, etc. */
export const startPrice = speakers[0].price; // 399
