/** Korte, URL-sikre, kryptografisk tilfældige id'er (a-z0-9). */
export function randomId(len = 16): string {
  const alfabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let ud = "";
  for (const b of bytes) ud += alfabet[b % alfabet.length];
  return ud;
}

/** Base64 for binære data — chunket så store billeder ikke sprænger stakken. */
export function tilB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

export function fraB64(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}
