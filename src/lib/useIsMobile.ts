"use client";

import { useEffect, useState } from "react";

/**
 * Telefon eller ej. Admin bruges i praksis på en telefon i døren, så de
 * brede tabeller skifter til kort under 900 px.
 */
export function useIsMobile(maxWidth = 900): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [maxWidth]);
  return mobile;
}
