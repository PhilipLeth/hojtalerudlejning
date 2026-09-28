"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { compressImage, formatBytes, MAX_UPLOAD_BYTES } from "@/lib/compressImage";
import { GALLERY_SPEC } from "@/lib/galleryPrompt";
import { heroSider, heroStandard, HERO_FALLBACK, type HeroEntry, type HeroSide } from "@/lib/heroBilleder";

/**
 * Stemningsbilledet bag overskriften på kategori- og produktsiderne.
 *
 * Arbejdsgangen er galleriets: én side ad gangen, et forslag der kun lever i
 * browseren, og intet bliver synligt for kunderne, før der trykkes "Brug det".
 * Ingen knap kører alle siderne på én gang — det er med vilje, se
 * bulk-er-philips-beslutning. Billedet vises med det samme på sitet (uden
 * deploy): middlewaren læser det godkendte fra KV.
 */

interface Forslag {
  billede: string;
  mime: string;
  note: string | null;
}

const PRIS = `${GALLERY_SPEC.usd_per_image.toFixed(2)} $`;

function Kort({
  side,
  entry,
  secret,
  onManifest,
  onForbrug,
}: {
  side: HeroSide;
  entry?: HeroEntry;
  secret: string;
  onManifest: (m: Record<string, HeroEntry>) => void;
  onForbrug: (f: { brugt: number; loft: number }) => void;
}) {
  const [note, setNote] = useState("");
  const [forslag, setForslag] = useState<Forslag | null>(null);
  const [travl, setTravl] = useState<"" | "generer" | "gem" | "fjern">("");
  const [fejl, setFejl] = useState("");

  const kald = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/hero?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sti: side.sti, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Fejl ${res.status}`);
      return data;
    },
    [secret, side.sti],
  );

  const generer = async () => {
    setTravl("generer");
    setFejl("");
    try {
      const data = await kald({ action: "generate", note });
      setForslag({ billede: data.image, mime: data.mime ?? "image/jpeg", note: data.note });
      if (typeof data.forbrugt === "number") onForbrug({ brugt: data.forbrugt, loft: data.loft });
    } catch (e) {
      setFejl(e instanceof Error ? e.message : String(e));
    } finally {
      setTravl("");
    }
  };

  const brug = async () => {
    if (!forslag) return;
    setTravl("gem");
    setFejl("");
    try {
      const binaer = atob(forslag.billede);
      const bytes = new Uint8Array(binaer.length);
      for (let i = 0; i < binaer.length; i++) bytes[i] = binaer.charCodeAt(i);
      const raa = new File([bytes], `hero${side.sti.replace(/\//g, "-")}.jpg`, { type: forslag.mime });
      // Komprimeres til WebP på højst 1600 px — nok til en hero bag et mørkt slør
      const { file, bytes: str } = await compressImage(raa);
      if (str > MAX_UPLOAD_BYTES) throw new Error(`Billedet fylder ${formatBytes(str)} efter komprimering — max ${formatBytes(MAX_UPLOAD_BYTES)}.`);
      const up = await fetch(`/api/upload?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": file.type || "image/webp" },
        body: file,
      });
      const updata = await up.json();
      if (!up.ok) throw new Error(updata.error ?? "Upload fejlede");
      const data = await kald({ action: "publish", url: updata.url, note: forslag.note ?? undefined });
      onManifest(data.manifest);
      setForslag(null);
      setNote("");
    } catch (e) {
      setFejl(e instanceof Error ? e.message : String(e));
    } finally {
      setTravl("");
    }
  };

  const fjern = async () => {
    if (!confirm(`Fjern stemningsbilledet på ${side.sti}? Siden går tilbage til standardbilledet.`)) return;
    setTravl("fjern");
    setFejl("");
    try {
      const data = await kald({ action: "fjern" });
      onManifest(data.manifest);
    } catch (e) {
      setFejl(e instanceof Error ? e.message : String(e));
    } finally {
      setTravl("");
    }
  };

  const nu = entry?.src ?? heroStandard(side.sti);
  const status = entry ? "Eget billede" : nu === HERO_FALLBACK ? "Fælles standardbillede" : "Billede fra koden";

  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
        <div>
          <strong style={{ fontSize: 16 }}>{side.navn}</strong>{" "}
          <a href={side.sti} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#1249cf" }}>{side.sti} ↗</a>
        </div>
        <span
          style={{
            fontSize: 12,
            padding: "2px 10px",
            borderRadius: 20,
            background: entry ? "#e7f6ec" : "#f1f3f6",
            color: entry ? "#1a7f37" : "#53657d",
          }}
        >
          {status}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: forslag ? "1fr 1fr" : "1fr", gap: 10, marginTop: 12 }}>
        <figure style={{ margin: 0 }}>
          <img src={nu} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 8, background: "#07060b" }} />
          <figcaption style={{ fontSize: 12, color: "#53657d", marginTop: 4 }}>
            Nu{entry?.updatedBy ? ` · ${entry.updatedBy}, ${new Date(entry.updatedAt ?? "").toLocaleDateString("da-DK")}` : ""}
          </figcaption>
        </figure>
        {forslag && (
          <figure style={{ margin: 0 }}>
            <img
              src={`data:${forslag.mime};base64,${forslag.billede}`}
              alt="Forslag"
              style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 8, outline: "3px solid #1249cf" }}
            />
            <figcaption style={{ fontSize: 12, color: "#1249cf", marginTop: 4 }}>
              Forslag — ikke gemt{forslag.note ? ` · "${forslag.note}"` : ""}
            </figcaption>
          </figure>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ønske til billedet, fx 'i en have om aftenen' (valgfrit)"
          style={{ flex: "1 1 260px", padding: "8px 10px", border: "1px solid #d8e3f2", borderRadius: 8, fontSize: 14 }}
        />
        <button type="button" onClick={generer} disabled={!!travl} style={knap("#1249cf")}>
          {travl === "generer" ? "Laver forslag…" : `${forslag ? "Nyt forslag" : "Lav forslag"} (${PRIS})`}
        </button>
        {forslag && (
          <>
            <button type="button" onClick={brug} disabled={!!travl} style={knap("#1a7f37")}>
              {travl === "gem" ? "Gemmer…" : "Brug det"}
            </button>
            <button type="button" onClick={() => setForslag(null)} disabled={!!travl} style={knap("#53657d", true)}>
              Kassér
            </button>
          </>
        )}
        {entry && !forslag && (
          <button type="button" onClick={fjern} disabled={!!travl} style={knap("#b42318", true)}>
            {travl === "fjern" ? "Fjerner…" : "Fjern (brug standard)"}
          </button>
        )}
      </div>
      {fejl && <p style={{ color: "#b42318", fontSize: 13, marginTop: 8 }}>{fejl}</p>}
    </div>
  );
}

function knap(farve: string, omrids = false) {
  return {
    padding: "8px 14px",
    borderRadius: 8,
    border: `1px solid ${farve}`,
    background: omrids ? "#fff" : farve,
    color: omrids ? farve : "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  } as const;
}

export default function StemningsbillederPage() {
  const { secret, ready, isLoggedIn } = useAdminAuth();
  const [manifest, setManifest] = useState<Record<string, HeroEntry>>({});
  const [forbrug, setForbrug] = useState<{ brugt: number; loft: number } | null>(null);
  const [filter, setFilter] = useState<"alle" | "uden" | "med">("alle");
  const [søg, setSøg] = useState("");
  const sider = useMemo(() => heroSider(), []);

  useEffect(() => {
    fetch("/api/hero?fuld=1")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setManifest)
      .catch(() => {});
  }, []);

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Stemningsbilleder" />;

  const synlige = sider.filter((s) => {
    if (filter === "med" && !manifest[s.sti]) return false;
    if (filter === "uden" && manifest[s.sti]) return false;
    const q = søg.trim().toLowerCase();
    return !q || s.navn.toLowerCase().includes(q) || s.sti.includes(q);
  });
  const antalMed = sider.filter((s) => manifest[s.sti]).length;

  return (
    <>
      <AdminNav title="Stemningsbilleder" />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
        <p style={{ color: "#53657d", fontSize: 14, marginTop: 0 }}>
          Billedet bag overskriften på kategori- og produktsiderne. Lav et forslag ud fra sidens eget udstyr, se
          det, og tryk <strong>Brug det</strong> — så står det på siden med det samme, på dansk og engelsk. Hvert
          forslag koster {PRIS}. {antalMed} af {sider.length} sider har eget billede.
          {forbrug && ` Brugt denne måned: ${forbrug.brugt} af ${forbrug.loft}.`}
        </p>
        <div style={{ display: "flex", gap: 8, margin: "16px 0", flexWrap: "wrap" }}>
          <input
            value={søg}
            onChange={(e) => setSøg(e.target.value)}
            placeholder="Søg side"
            style={{ padding: "8px 10px", border: "1px solid #d8e3f2", borderRadius: 8, fontSize: 14 }}
          />
          {(["alle", "uden", "med"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} style={knap("#1249cf", filter !== f)}>
              {f === "alle" ? "Alle" : f === "uden" ? "Uden eget billede" : "Med eget billede"}
            </button>
          ))}
        </div>
        {(["Kategorier", "Produkter"] as const).map((gruppe) => {
          const liste = synlige.filter((s) => s.gruppe === gruppe);
          if (!liste.length) return null;
          return (
            <section key={gruppe} style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, margin: "8px 0 12px" }}>{gruppe}</h2>
              <div style={{ display: "grid", gap: 16 }}>
                {liste.map((s) => (
                  <Kort
                    key={s.sti}
                    side={s}
                    entry={manifest[s.sti]}
                    secret={secret}
                    onManifest={setManifest}
                    onForbrug={setForbrug}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
