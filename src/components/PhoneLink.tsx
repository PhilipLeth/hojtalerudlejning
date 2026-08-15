"use client";

import type { ReactNode } from "react";
import { useSiteSettings } from "@/lib/useSiteSettings";

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

/** Erstatter hardcoded numre i brødtekst med det live nummer. */
export function LivePhoneCopy({ text }: { text: string }) {
  const { display } = useSiteSettings();
  return <>{text.replace(/23 63 23 03|31 13 28 52/g, display)}</>;
}
