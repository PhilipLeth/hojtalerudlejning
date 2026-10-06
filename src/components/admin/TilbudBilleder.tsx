"use client";

/**
 * Fanen "Billeder" i /admin/tilbud.
 *
 * Tre veje til et billede, og de ender alle samme sted — i tilbuddets liste:
 *   1. Upload: kollegaens egne fotos eller dem kunden har sendt (flere ad gangen)
 *   2. Fra link: et /api/image/…-link fra kundens forespørgselsmail
 *   3. AI: tilbuddets eget grej sat op ud fra et ønske, kollegaen skriver og
 *      retter. Kan tage kundens lokalefoto eller et tidligere AI-billede som
 *      udgangspunkt.
 *
 * Billederne kan flyttes, sættes som forside og slettes. Uden billeder viser
 * tilbuddet forsidens fotos af rigtige opstillinger.
 */

import { useMemo, useRef, useState } from "react";
import { compressImage, formatBytes, MAX_UPLOAD_BYTES } from "@/lib/compressImage";
import {
  FORSIDE_BILLEDER,
  MAX_TILBUD_BILLEDER,
  STANDARD_INSPIRATION,
  findVare,
  gyldigBilledSti,
  type KatalogLike,
  type TilbudBillede,
  type TilbudLinje,
} from "@/lib/tilbud";
import { BILLED_FORMATER, TILBUD_BILLED_LOFT, standardOenske, type BilledFormat } from "@/lib/tilbudBillede";

const knap = "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
const knapLys = `${knap} border-[#dfe2ea] bg-white text-[#2a2d38] hover:border-[#1249cf] hover:text-[#1249cf]`;
const knapBlaa = `${knap} border-[#1249cf] bg-[#1249cf] text-white hover:bg-[#103dae]`;
const felt = "w-full rounded-lg border border-[#dfe2ea] bg-white px-3 py-2 text-[14px] text-[#11131a] outline-none transition focus:border-[#1249cf] focus:ring-2 focus:ring-[#1249cf]/15";
const etiket = "mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7f8c]";
const mini = "rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-[#2a2d38] shadow hover:bg-white disabled:opacity-40";

const KILDE: Record<TilbudBillede["kilde"], string> = { upload: "Upload", kunde: "Fra kunden", ai: "AI", site: "Sitet" };

async function upload(secret: string, fil: File): Promise<string> {
  const { file, bytes } = await compressImage(fil);
  if (bytes > MAX_UPLOAD_BYTES) throw new Error(`${fil.name} fylder ${formatBytes(bytes)} efter komprimering — max ${formatBytes(MAX_UPLOAD_BYTES)}.`);
  const res = await fetch(`/api/upload?secret=${encodeURIComponent(secret)}`, {
    method: "POST",
    headers: { "Content-Type": file.type || "image/webp" },
    body: file,
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload fejlede");
  return data.url;
}

/** "https://lejhojtaler.dk/api/image/img_1_x" → "/api/image/img_1_x" */
function stiFraLink(raw: string): string | null {
  const t = raw.trim();
  try {
    const sti = t.startsWith("/") ? t : new URL(t).pathname;
    return gyldigBilledSti(sti) ? sti : null;
  } catch {
    return null;
  }
}

export interface TilbudBillederProps {
  secret: string;
  katalog: KatalogLike;
  tilbud: { billeder?: TilbudBillede[]; forside: string; linjer: TilbudLinje[]; titel: string; sted?: string; gaester?: number; fra?: string };
  onChange: (patch: { billeder?: TilbudBillede[]; forside?: string }) => void;
}

export default function TilbudBilleder({ secret, katalog, tilbud: t, onChange }: TilbudBillederProps) {
  const billeder = t.billeder ?? [];
  const fuld = billeder.length >= MAX_TILBUD_BILLEDER;
  const filRef = useRef<HTMLInputElement>(null);
  const [travlt, setTravlt] = useState<"" | "upload" | "ai" | "gem">("");
  const [fejl, setFejl] = useState("");
  const [link, setLink] = useState("");

  // Grejet, der kan stå på et billede: ikke tekniker, kørsel og forbrugsvarer
  const grej = useMemo(
    () =>
      t.linjer
        .map((l) => ({ l, v: findVare(katalog, l.id, "da") }))
        .filter((x) => x.v && x.v.slags !== "ydelse" && x.v.slags !== "levering")
        .map((x) => ({ id: x.l.id, navn: `${x.l.antal > 1 ? `${x.l.antal} × ` : ""}${x.v!.navn}`, billede: x.v!.billede })),
    [t.linjer, katalog],
  );

  const [oenske, setOenske] = useState("");
  const [format, setFormat] = useState<BilledFormat>("16:9");
  const [basis, setBasis] = useState("");
  const [fravalgt, setFravalgt] = useState<string[]>([]);
  const [forslag, setForslag] = useState<{ image: string; mime: string; oenske: string; prompt: string; forbrugt: number } | null>(null);
  const [visPrompt, setVisPrompt] = useState(false);

  const saet = (ny: TilbudBillede[]) => onChange({ billeder: ny.slice(0, MAX_TILBUD_BILLEDER) });
  const tilfoej = (b: TilbudBillede) => {
    if (billeder.some((x) => x.src === b.src)) return;
    saet([...billeder, b]);
  };

  async function uploadFiler(filer: FileList | null) {
    if (!filer?.length) return;
    setTravlt("upload");
    setFejl("");
    const nye: TilbudBillede[] = [];
    try {
      for (const fil of Array.from(filer).slice(0, MAX_TILBUD_BILLEDER - billeder.length)) {
        nye.push({ src: await upload(secret, fil), kilde: "upload" });
      }
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Upload fejlede");
    } finally {
      if (nye.length) saet([...billeder, ...nye]);
      setTravlt("");
      if (filRef.current) filRef.current.value = "";
    }
  }

  function flyt(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= billeder.length) return;
    const ny = [...billeder];
    [ny[i], ny[j]] = [ny[j], ny[i]];
    saet(ny);
  }

  function slet(b: TilbudBillede) {
    const rest = billeder.filter((x) => x.src !== b.src);
    // Var det forsiden, falder forsiden tilbage på standardbilledet
    onChange(t.forside === b.src ? { billeder: rest, forside: FORSIDE_BILLEDER[0].src } : { billeder: rest });
    if (basis === b.src) setBasis("");
  }

  const basisBillede = billeder.find((b) => b.src === basis);
  const brugGrej = grej.filter((g) => !fravalgt.includes(g.id));

  async function generer() {
    setTravlt("ai");
    setFejl("");
    setForslag(null);
    const brugtOenske = oenske.trim() || standardOenske(t, brugGrej.map((g) => g.navn));
    try {
      const res = await fetch(`/api/tilbud?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "billede",
          oenske: brugtOenske,
          produkter: brugGrej.map((g) => g.id),
          format,
          basis: basis || undefined,
          basisType: basisBillede?.kilde === "ai" ? "rettelse" : "lokale",
        }),
      });
      const data = (await res.json()) as { image?: string; mime?: string; prompt?: string; forbrugt?: number; error?: string };
      if (!res.ok || !data.image) throw new Error(data.error ?? "Billedet kunne ikke laves");
      setForslag({ image: data.image, mime: data.mime ?? "image/jpeg", oenske: brugtOenske, prompt: data.prompt ?? "", forbrugt: data.forbrugt ?? 0 });
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Billedet kunne ikke laves");
    } finally {
      setTravlt("");
    }
  }

  async function brugForslag(somForside: boolean) {
    if (!forslag) return;
    setTravlt("gem");
    setFejl("");
    try {
      const binaer = atob(forslag.image);
      const bytes = new Uint8Array(binaer.length);
      for (let i = 0; i < binaer.length; i++) bytes[i] = binaer.charCodeAt(i);
      const src = await upload(secret, new File([bytes], "tilbud-ai.jpg", { type: forslag.mime }));
      const ny: TilbudBillede = { src, kilde: "ai", prompt: forslag.oenske };
      const liste = [...billeder, ny].slice(0, MAX_TILBUD_BILLEDER);
      onChange(somForside ? { billeder: liste, forside: src } : { billeder: liste });
      setForslag(null);
      // Næste billede tager som regel udgangspunkt i det her
      setBasis(src);
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Kunne ikke gemme billedet");
    } finally {
      setTravlt("");
    }
  }

  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-4">
      {fejl && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{fejl}</p>}

      {/* ── Sådan kan det se ud ── */}
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <span className={etiket}>Sådan kan det se ud ({billeder.length}/{MAX_TILBUD_BILLEDER})</span>
          {billeder.length > 0 && (
            <button type="button" className="text-[12px] text-[#9aa0ad] hover:text-red-600" onClick={() => window.confirm("Fjern alle billeder fra tilbuddet?") && saet([])}>
              Fjern alle
            </button>
          )}
        </div>
        {billeder.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d5d9e2] p-3">
            <p className="text-[12px] text-[#7a7f8c]">Ingen egne billeder endnu — kunden ser forsidens fotos af rigtige opstillinger:</p>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {STANDARD_INSPIRATION.map((src) => (
                <img key={src} src={src} alt="" className="aspect-[4/5] w-full rounded-md object-cover" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {billeder.map((b, i) => (
              <div key={b.src} className={`group relative overflow-hidden rounded-lg border-2 ${t.forside === b.src ? "border-[#1249cf]" : "border-transparent"}`}>
                <img src={b.src} alt="" className="aspect-[4/3] w-full bg-[#f4f5f8] object-cover" />
                <span className="absolute left-1.5 top-1.5 rounded bg-[#0c0b12]/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {i + 1} · {KILDE[b.kilde]}
                  {t.forside === b.src ? " · forside" : ""}
                </span>
                <button type="button" onClick={() => slet(b)} className="absolute right-1.5 top-1.5 h-6 w-6 rounded-full bg-white/90 text-[13px] text-[#2a2d38] shadow hover:bg-red-600 hover:text-white" aria-label="Slet billedet" title="Slet">
                  ✕
                </button>
                <div className="absolute inset-x-1.5 bottom-1.5 flex flex-wrap gap-1">
                  <button type="button" className={mini} onClick={() => flyt(i, -1)} disabled={i === 0} aria-label="Flyt frem">
                    ←
                  </button>
                  <button type="button" className={mini} onClick={() => flyt(i, 1)} disabled={i === billeder.length - 1} aria-label="Flyt tilbage">
                    →
                  </button>
                  <button type="button" className={mini} onClick={() => onChange({ forside: b.src })} disabled={t.forside === b.src}>
                    Forside
                  </button>
                  <button type="button" className={mini} onClick={() => setBasis(b.src)} title={b.kilde === "ai" ? "Ret billedet med AI" : "Sæt grejet ind i billedet med AI"}>
                    {b.kilde === "ai" ? "Ret med AI" : "Brug i AI"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <input ref={filRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadFiler(e.target.files)} />
          <button type="button" className={knapLys} onClick={() => filRef.current?.click()} disabled={fuld || !!travlt}>
            {travlt === "upload" ? "Uploader …" : "↑ Upload billeder"}
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <input className={felt} placeholder="Link til billede fra kundens mail (…/api/image/…)" value={link} onChange={(e) => setLink(e.target.value)} />
          <button
            type="button"
            className={knapLys}
            disabled={fuld || !link.trim()}
            onClick={() => {
              const sti = stiFraLink(link);
              if (!sti) return setFejl("Linket skal pege på et billede på lejhojtaler.dk (/api/image/…)");
              tilfoej({ src: sti, kilde: "kunde" });
              setLink("");
              setFejl("");
            }}
          >
            Tilføj
          </button>
        </div>
      </section>

      {/* ── AI ── */}
      <section className="rounded-xl border border-[#e3e6f0] bg-[#f7f8fc] p-3">
        <p className="text-[13px] font-bold">Lav et billede med AI</p>
        <p className="mt-0.5 text-[12px] text-[#7a7f8c]">Modellen får fotos af tilbuddets eget udstyr og sætter det op, som du beskriver. Ca. 1 kr pr. billede.</p>

        <label className="mt-3 block">
          <span className={etiket}>Hvad skal billedet vise?</span>
          <textarea
            className={`${felt} min-h-[110px] leading-relaxed`}
            value={oenske}
            onChange={(e) => setOenske(e.target.value)}
            placeholder={standardOenske(t, brugGrej.map((g) => g.navn))}
          />
        </label>
        <div className="mt-1 flex flex-wrap gap-x-3 text-[12px]">
          <button type="button" className="text-[#1249cf] hover:underline" onClick={() => setOenske(standardOenske(t, brugGrej.map((g) => g.navn)))}>
            Foreslå tekst ud fra tilbuddet
          </button>
          <span className="text-[#9aa0ad]">Fx: "Uplights i lilla langs væggene, højtalerne på stativer ved scenen, ingen mennesker"</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <label>
            <span className={etiket}>Format</span>
            <select className={felt} value={format} onChange={(e) => setFormat(e.target.value as BilledFormat)}>
              {BILLED_FORMATER.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.navn}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={etiket}>Udgangspunkt</span>
            <select className={felt} value={basis} onChange={(e) => setBasis(e.target.value)}>
              <option value="">Byg scenen fra bunden</option>
              {billeder.map((b, i) => (
                <option key={b.src} value={b.src}>
                  {b.kilde === "ai" ? `Ret AI-billede ${i + 1}` : `Kundens lokale: billede ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
        </div>
        {basisBillede && (
          <div className="mt-2 flex items-center gap-2 text-[12px] text-[#4a4f5c]">
            <img src={basisBillede.src} alt="" className="h-10 w-14 rounded object-cover" />
            {basisBillede.kilde === "ai" ? "Billedet beholdes; kun det, du beskriver, ændres." : "Lokalet beholdes; grejet sættes ind i det."}
          </div>
        )}

        {grej.length > 0 && (
          <div className="mt-3">
            <span className={etiket}>Udstyr på billedet (fotos af højst 6 går med)</span>
            <div className="flex flex-wrap gap-1.5">
              {grej.map((g) => {
                const med = !fravalgt.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFravalgt((f) => (med ? [...f, g.id] : f.filter((x) => x !== g.id)))}
                    className={`rounded-full border px-2.5 py-1 text-[12px] font-semibold ${med ? "border-[#1249cf] bg-[#e9efff] text-[#1249cf]" : "border-[#dfe2ea] bg-white text-[#9aa0ad] line-through"}`}
                  >
                    {g.navn}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button type="button" className={`${knapBlaa} mt-3 w-full`} onClick={generer} disabled={!!travlt || fuld || (!brugGrej.length && !basis)}>
          {travlt === "ai" ? "Laver billedet … (op til et minut)" : forslag ? "Lav et nyt forslag" : "Lav billedet"}
        </button>
        {fuld && <p className="mt-1 text-[12px] text-[#b45309]">Tilbuddet har {MAX_TILBUD_BILLEDER} billeder. Slet et for at lave flere.</p>}
        {!brugGrej.length && !basis && <p className="mt-1 text-[12px] text-[#7a7f8c]">Læg udstyr i tilbuddet først, så modellen har noget at vise.</p>}

        {forslag && (
          <div className="mt-3 overflow-hidden rounded-lg border border-[#dfe2ea] bg-white">
            <img src={`data:${forslag.mime};base64,${forslag.image}`} alt="Forslag" className="w-full" />
            <div className="flex flex-wrap gap-2 p-2.5">
              <button type="button" className={knapBlaa} onClick={() => brugForslag(false)} disabled={!!travlt}>
                {travlt === "gem" ? "Gemmer …" : "Brug billedet"}
              </button>
              <button type="button" className={knapLys} onClick={() => brugForslag(true)} disabled={!!travlt}>
                Brug som forside
              </button>
              <button type="button" className={knapLys} onClick={() => setForslag(null)} disabled={!!travlt}>
                Kassér
              </button>
              <span className="ml-auto self-center text-[11px] text-[#9aa0ad]">
                {forslag.forbrugt}/{TILBUD_BILLED_LOFT} denne måned
              </span>
            </div>
            <p className="border-t border-[#eef0f4] px-2.5 py-2 text-[12px] text-[#7a7f8c]">
              Ikke helt rigtigt? Ret teksten ovenfor og tryk "Lav et nyt forslag" — eller brug billedet og vælg det som udgangspunkt for en rettelse.{" "}
              <button type="button" className="text-[#1249cf] hover:underline" onClick={() => setVisPrompt((v) => !v)}>
                {visPrompt ? "Skjul" : "Vis"} prompt
              </button>
            </p>
            {visPrompt && <p className="px-2.5 pb-2.5 text-[11px] leading-relaxed text-[#9aa0ad]">{forslag.prompt}</p>}
          </div>
        )}
      </section>

      {/* ── Forsiden ── */}
      <section>
        <span className={etiket}>Forsidebillede</span>
        <div className="grid grid-cols-4 gap-1.5">
          {[...billeder.map((b) => ({ src: b.src, navn: KILDE[b.kilde] })), ...FORSIDE_BILLEDER].map((b) => (
            <button
              key={b.src}
              type="button"
              onClick={() => onChange({ forside: b.src })}
              className={`relative aspect-[3/4] overflow-hidden rounded-md border-2 ${t.forside === b.src ? "border-[#1249cf]" : "border-transparent hover:border-[#c9ccd6]"}`}
            >
              <img src={b.src} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1 pt-3 text-left text-[10px] font-semibold text-white">{b.navn}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
