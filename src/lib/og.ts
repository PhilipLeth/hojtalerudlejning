/**
 * Open Graph-billeder.
 *
 * Sider der sætter deres egen openGraph erstatter root-layoutets hele
 * openGraph-objekt (shallow merge) — så images skal sættes på hver side,
 * ellers bliver delingen i Messenger/iMessage/Facebook billedløs.
 *
 * Produkt-/landingssider bruger produktbilledet; øvrige falder tilbage på
 * hero. Relativ sti er nok: metadataBase i layout.tsx resolver den.
 */
export const DEFAULT_OG_IMAGE = "/images/hero.webp";

export function ogImages(image?: string | null): { url: string; alt: string }[] {
  return [
    {
      url: image || DEFAULT_OG_IMAGE,
      alt: "Lejhøjtaler.dk — højtalerudlejning i København",
    },
  ];
}
