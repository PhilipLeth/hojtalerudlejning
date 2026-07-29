/** URL-/API-venligt produkt-id fra navn */
export function slugifyProductId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function isValidProductId(id: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(id);
}
