"use client";

import { useMemo } from "react";
import qrcode from "qrcode-generator";

/**
 * QR-kode som ren SVG: skarp på skærm og i print, og ingen billedfil at hente.
 * Fejlretning M, så koden stadig kan læses, hvis tilbuddet er printet lidt
 * slidt eller fotograferet skævt.
 */
export default function QrKode({ value, size = 160, className, label }: { value: string; size?: number; className?: string; label?: string }) {
  const { path, n } = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    let d = "";
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
      }
    }
    return { path: d, n: count };
  }, [value]);

  // Stilhedszonen (4 moduler) er en del af standarden; uden den kan nogle
  // telefoner ikke finde koden på en mørk baggrund
  const q = 4;
  return (
    <svg
      viewBox={`${-q} ${-q} ${n + 2 * q} ${n + 2 * q}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={label ?? value}
      shapeRendering="crispEdges"
    >
      <rect x={-q} y={-q} width={n + 2 * q} height={n + 2 * q} fill="#fff" />
      <path d={path} fill="#0b0a10" />
    </svg>
  );
}
