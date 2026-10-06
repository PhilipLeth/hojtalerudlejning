"use client";

/**
 * "Vedhæft billeder" i kontakt- og eventformularen: kunden sender fotos af
 * lokalet, så vi kan lave et eksempel på opstillingen i tilbuddet.
 *
 * Billederne komprimeres i browseren (WebP, højst 1600 px og 1 MB), før de
 * sendes, så et 6 MB telefonfoto ikke tager formularen med sig ned.
 */

import { useRef, useState } from "react";
import { compressImage, MAX_UPLOAD_BYTES } from "@/lib/compressImage";
import type { Locale } from "@/lib/i18n";

export const MAX_VEDHAEFTEDE = 5;

export interface VedhaeftetBillede {
  navn: string;
  type: string;
  /** base64 uden data:-præfiks */
  data: string;
  /** Til forhåndsvisningen i formularen */
  url: string;
}

const TEKST = {
  da: {
    knap: "Vedhæft billeder af lokalet",
    hjaelp: "Valgfrit. Sender du fotos af stedet, kan vi vise, hvordan opstillingen kommer til at se ud.",
    behandler: "Gør billederne klar …",
    forStor: "er for stort",
    fjern: "Fjern billedet",
  },
  en: {
    knap: "Attach photos of the venue",
    hjaelp: "Optional. Send photos of the venue, and we can show you what the setup will look like.",
    behandler: "Preparing the photos …",
    forStor: "is too large",
    fjern: "Remove the photo",
  },
} as const;

function tilBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

export default function VedhaeftBilleder({
  locale = "da",
  billeder,
  onChange,
  inputCls = "",
}: {
  locale?: Locale;
  billeder: VedhaeftetBillede[];
  onChange: (b: VedhaeftetBillede[]) => void;
  inputCls?: string;
}) {
  const s = TEKST[locale];
  const ref = useRef<HTMLInputElement>(null);
  const [travlt, setTravlt] = useState(false);
  const [fejl, setFejl] = useState("");

  async function vaelg(filer: FileList | null) {
    if (!filer?.length) return;
    setTravlt(true);
    setFejl("");
    const nye: VedhaeftetBillede[] = [];
    for (const fil of Array.from(filer).slice(0, MAX_VEDHAEFTEDE - billeder.length)) {
      try {
        const { file, bytes } = await compressImage(fil);
        if (bytes > MAX_UPLOAD_BYTES || !file.type.startsWith("image/")) {
          setFejl(`${fil.name} ${s.forStor}`);
          continue;
        }
        nye.push({ navn: file.name, type: file.type, data: await tilBase64(file), url: URL.createObjectURL(file) });
      } catch {
        setFejl(`${fil.name} ${s.forStor}`);
      }
    }
    onChange([...billeder, ...nye]);
    setTravlt(false);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => vaelg(e.target.files)} />
      {billeder.length < MAX_VEDHAEFTEDE && (
        <button type="button" onClick={() => ref.current?.click()} disabled={travlt} className={`${inputCls} flex items-center gap-2 text-left`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="M21 16l-5-5-8 8" />
          </svg>
          <span>{travlt ? s.behandler : `${s.knap}${billeder.length ? ` (${billeder.length}/${MAX_VEDHAEFTEDE})` : ""}`}</span>
        </button>
      )}
      {billeder.length === 0 && <p className="mt-1 text-xs opacity-60">{s.hjaelp}</p>}
      {billeder.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {billeder.map((b, i) => (
            <div key={b.url} className="relative">
              <img src={b.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => onChange(billeder.filter((_, j) => j !== i))}
                aria-label={s.fjern}
                className="absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full bg-black text-[11px] leading-5 text-[#fff]"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      {fejl && <p className="mt-1 text-xs text-red-500">{fejl}</p>}
    </div>
  );
}

/** Det, formularen sender til /api/contact */
export function tilPayload(billeder: VedhaeftetBillede[]) {
  return billeder.map(({ navn, type, data }) => ({ navn, type, data }));
}
