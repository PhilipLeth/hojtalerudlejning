"use client";

import type { ReactNode } from "react";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { DEFAULT_PICKUP_ADDRESS } from "@/lib/pickup";

/** Klikbart telefonnummer — følger admin /indstillinger. */
export default function PhoneLink({
  className,
  prefix,
  prefixClassName,
  numberClassName,
  hideNumber = false,
  children,
}: {
  className?: string;
  prefix?: string;
  prefixClassName?: string;
  numberClassName?: string;
  hideNumber?: boolean;
  children?: ReactNode;
}) {
  const { href, display } = useSiteSettings();
  return (
    <a href={href} className={className}>
      {children}
      {prefix ? <span className={prefixClassName}>{prefix} </span> : null}
      {hideNumber ? null : <span className={numberClassName}>{display}</span>}
    </a>
  );
}

/** Kun nummeret som tekst (fx i kicker-linjer). */
export function PhoneText() {
  const { display } = useSiteSettings();
  return <>{display}</>;
}

/** Hero-kicker med live nummer. */
export function LocationKicker({ extra }: { extra: string }) {
  return (
    <>
      København · {extra} · Ring <PhoneText />
    </>
  );
}

/**
 * Erstatter de to oplysninger der står som tekst i brødteksten — telefonnummer
 * og afhentningsadresse — med det Frederik har sat i /admin/indstillinger.
 *
 * Teksten skal blive ved med at indeholde de RIGTIGE værdier som standard, ikke
 * en pladsholder: den statiske HTML er det crawlere og svarmaskiner læser, og de
 * kører ikke JavaScript. Standarden er altså svaret; hooket retter kun efter,
 * hvis admin har ændret noget.
 */
export function LiveCopy({ text }: { text: string }) {
  const { display, pickupAddress } = useSiteSettings();
  return (
    <>
      {text
        .replace(/23 63 23 03|31 13 28 52/g, display)
        .replaceAll(DEFAULT_PICKUP_ADDRESS, pickupAddress)}
    </>
  );
}
