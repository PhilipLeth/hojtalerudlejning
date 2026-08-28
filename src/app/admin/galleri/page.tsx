"use client";

/**
 * /admin/galleri — én scene ad gangen, ét produkt ad gangen.
 *
 * Produktkortene i /admin/produkter kan det samme, men de tvinger dig til at
 * folde et produkt ud ad gangen og tage alle tre scener på én gang. Den her
 * side vender det om: vælg scenen øverst, og gå listen igennem oppefra.
 * Først alle produktbilleder, så alle stemningsbilleder — sådan som arbejdet
 * faktisk foregår.
 *
 * Tælleren i fanen siger hvor langt du er. Rækkerne kan filtreres ned til dem,
 * der mangler, eller dem der er lavet men ikke set efter endnu.
 *
 * Ingenting genereres af sig selv. Hver knap er ét tryk og ét billede.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { useProducts } from "@/lib/useProducts";
import { GALLERY_SCENER, GALLERY_SPEC, fladtKatalog, scenerFor } from "@/lib/galleryPrompt";
import { PRODUCT_GALLERY } from "@/lib/productGallery";
import {
  fjern as fjernKald,
  generer as genererKald,
  godkendEksisterende,
  hentManifest,
  udgivForslag,
  type Forslag,
  type GalleryEntry,
} from "@/lib/galleryAdmin";

type Status = "mangler" | "ikke_gennemgaaet" | "godkendt" | "fjernet";

const STATUS_TEKST: Record<Status, { tekst: string; farve: string }> = {
  mangler: { tekst: "Mangler", farve: "#999" },
  ikke_gennemgaaet: { tekst: "Ikke gennemgået", farve: "#b8860b" },
  godkendt: { tekst: "Godkendt", farve: "#1a7f37" },
  fjernet: { tekst: "Fjernet", farve: "#dc3545" },
};

const knap: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  padding: "7px 14px",
  borderRadius: "6px",
  border: "1px solid #d0d0d0",
  background: "#fff",
  cursor: "pointer",
  whiteSpace: "nowrap",
};
const primaer: React.CSSProperties = { ...knap, background: "#0070f3", borderColor: "#0070f3", color: "#fff" };
const gron: React.CSSProperties = { ...knap, background: "#1a7f37", borderColor: "#1a7f37", color: "#fff" };

export default function AdminGalleriPage() {
  const { ready, isLoggedIn } = useAdminAuth();
  const { speakers, addons, rentalProducts } = useProducts();

  const [manifest, setManifest] = useState<Record<string, GalleryEntry[]>>({});
  const [forslag, setForslag] = useState<Record<string, Forslag>>({});
  const [arbejder, setArbejder] = useState<string | null>(null);
  const [fejl, setFejl] = useState("");
  const [note, setNote] = useState("");
  const [forbrug, setForbrug] = useState<{ brugt: number; loft: number } | null>(null);
  const [fane, setFane] = useState(0);
  const [filter, setFilter] = useState<"alle" | "mangler" | "ikke_gennemgaaet">("alle");

  useEffect(() => {
    hentManifest().then(setManifest);
  }, []);

  /* ── produkter og scener ── */

  const produkter = useMemo(() => {
    const flad = fladtKatalog({ speakers, addons, rentalProducts });
    // Kun produkter med deres egen side — galleriet bor på produktsiden
    return [...flad.values()].filter((p) => p.page && !p.hidden);
  }, [speakers, addons, rentalProducts]);

  /** Fanerne er scenernes titler. "Alt det du får" dækker to varianter:
   *  pakkens dele stillet op, og enkeltproduktet med det der ligger i kassen. */
  const faner = useMemo(() => {
    const set: string[] = [];
    for (const s of GALLERY_SCENER) if (!set.includes(s.titel_da)) set.push(s.titel_da);
    return set;
  }, []);

  const status = useCallback(
    (produktId: string, sceneId: string): Status => {
      const fraAdmin = manifest[produktId]?.find((b) => b.scene === sceneId);
      if (fraAdmin) return fraAdmin.fjernet ? "fjernet" : "godkendt";
      if ((PRODUCT_GALLERY[produktId] ?? []).some((b) => b.scene === sceneId)) return "ikke_gennemgaaet";
      return "mangler";
    },
    [manifest],
  );

  /** Én række pr. produkt for den valgte fane, med den scene der passer. */
  const raekker = useMemo(() => {
    const titel = faner[fane];
    return produkter
      .map((p) => {
        const scene = scenerFor(p).find((s) => s.titel_da === titel);
        if (!scene) return null;
        return { produkt: p, scene, status: status(p.id, scene.id) };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [produkter, faner, fane, status]);

  const tael = useCallback(
    (titel: string) => {
      let har = 0;
      let ialt = 0;
      for (const p of produkter) {
        const scene = scenerFor(p).find((s) => s.titel_da === titel);
        if (!scene) continue;
        ialt++;
        const s = status(p.id, scene.id);
        if (s === "godkendt" || s === "ikke_gennemgaaet") har++;
      }
      return { har, ialt };
    },
    [produkter, status],
  );

  const synlige = raekker.filter((r) => filter === "alle" || r.status === filter);

  /* ── handlinger ── */

  const noegle = (produktId: string, sceneId: string) => `${produktId}/${sceneId}`;

  const kør = async (id: string, arbejde: () => Promise<void>) => {
    setFejl("");
    setNote("");
    setArbejder(id);
    try {
      await arbejde();
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Noget gik galt");
    } finally {
      setArbejder(null);
    }
  };

  const generer = (produktId: string, sceneId: string) =>
    kør(noegle(produktId, sceneId), async () => {
      const f = await genererKald(produktId, sceneId);
      setForslag((s) => ({ ...s, [noegle(produktId, sceneId)]: f }));
      if (typeof f.forbrugt === "number" && typeof f.loft === "number") {
        setForbrug({ brugt: f.forbrugt, loft: f.loft });
      }
    });

  const brug = (produktId: string, sceneId: string) =>
    kør(noegle(produktId, sceneId), async () => {
      const f = forslag[noegle(produktId, sceneId)];
      if (!f) return;
      const { billeder } = await udgivForslag(produktId, sceneId, f);
      setManifest((m) => ({ ...m, [produktId]: billeder }));
      setForslag((s) => {
        const n = { ...s };
        delete n[noegle(produktId, sceneId)];
        return n;
      });
      setNote("Billedet er live på produktsiden.");
    });

  const godkend = (produktId: string, sceneId: string) =>
    kør(noegle(produktId, sceneId), async () => {
      const statisk = (PRODUCT_GALLERY[produktId] ?? []).find((b) => b.scene === sceneId);
      if (!statisk) return;
      const billeder = await godkendEksisterende(produktId, sceneId, statisk.src);
      setManifest((m) => ({ ...m, [produktId]: billeder }));
      setNote("Markeret som gennemgået. Det koster ingenting — billedet lå der i forvejen.");
    });

  const fjern = (produktId: string, sceneId: string) =>
    kør(noegle(produktId, sceneId), async () => {
      const billeder = await fjernKald(produktId, sceneId);
      setManifest((m) => ({ ...m, [produktId]: billeder }));
      setNote("Billedet vises ikke længere på produktsiden.");
    });

  const kassér = (produktId: string, sceneId: string) =>
    setForslag((s) => {
      const n = { ...s };
      delete n[noegle(produktId, sceneId)];
      return n;
    });

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Galleri" />;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <AdminNav
        actions={
          <span style={{ fontSize: "13px", color: "#666" }}>
            {GALLERY_SPEC.usd_per_image.toFixed(2)} $ pr. billede
            {forbrug ? ` · ${forbrug.brugt} af ${forbrug.loft} brugt i denne måned` : ""}
          </span>
        }
      />

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
          Vælg en scene, og gå listen igennem oppefra. Der genereres kun det, du trykker på —
          ét tryk er ét billede. Billeder fra den første samlede kørsel står som{" "}
          <strong>ikke gennemgået</strong>, indtil du har set dem efter.
        </p>

        {fejl && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>{fejl}</div>}
        {note && <div style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>{note}</div>}

        {/* Faner: én pr. scene, med hvor langt den er */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
          {faner.map((titel, i) => {
            const { har, ialt } = tael(titel);
            const valgt = i === fane;
            return (
              <button
                key={titel}
                type="button"
                onClick={() => setFane(i)}
                style={{
                  ...knap,
                  background: valgt ? "#111" : "#fff",
                  color: valgt ? "#fff" : "#111",
                  borderColor: valgt ? "#111" : "#d0d0d0",
                }}
              >
                {titel}{" "}
                <span style={{ fontWeight: 400, opacity: 0.7 }}>
                  {har}/{ialt}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", fontSize: "13px" }}>
          {([
            ["alle", "Alle"],
            ["mangler", "Mangler"],
            ["ikke_gennemgaaet", "Ikke gennemgået"],
          ] as const).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilter(v)}
              style={{
                ...knap,
                fontSize: "12px",
                padding: "5px 10px",
                background: filter === v ? "#e8e8e8" : "#fff",
              }}
            >
              {l}
            </button>
          ))}
          <span style={{ alignSelf: "center", color: "#888" }}>{synlige.length} vist</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {synlige.map(({ produkt, scene, status: st }) => {
            const id = noegle(produkt.id, scene.id);
            const f = forslag[id];
            const travl = arbejder === id;
            const statisk = (PRODUCT_GALLERY[produkt.id] ?? []).find((b) => b.scene === scene.id);
            const fraAdmin = manifest[produkt.id]?.find((b) => b.scene === scene.id);
            const vist = f
              ? `data:${f.mime};base64,${f.billede}`
              : st === "godkendt" && fraAdmin?.src
                ? fraAdmin.src
                : st === "ikke_gennemgaaet" && statisk
                  ? statisk.thumb
                  : null;

            return (
              <div
                key={id}
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                  background: "#fff",
                  borderRadius: "10px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  padding: "12px 16px",
                  border: f ? "2px solid #0070f3" : "2px solid transparent",
                }}
              >
                <div style={{ width: "128px", flexShrink: 0 }}>
                  {vist ? (
                    <img
                      src={vist}
                      alt=""
                      style={{ width: "128px", aspectRatio: scene.ratio.replace(":", " / "), objectFit: "cover", borderRadius: "6px", background: "#f2f2f2" }}
                    />
                  ) : (
                    <div style={{ width: "128px", aspectRatio: scene.ratio.replace(":", " / "), borderRadius: "6px", background: "#f2f2f2", border: "1px dashed #ddd" }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{produkt.navn}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {produkt.id} · {produkt.page}
                  </div>
                  <div style={{ fontSize: "12px", color: STATUS_TEKST[f ? "mangler" : st].farve, marginTop: "4px", fontWeight: 600 }}>
                    {f ? "Forslag — ikke gemt endnu" : STATUS_TEKST[st].tekst}
                    {!f && fraAdmin?.updatedBy ? ` · ${fraAdmin.updatedBy}` : ""}
                  </div>
                  {f?.mangler.length ? (
                    <div style={{ fontSize: "11px", color: "#b8860b", marginTop: "2px" }}>
                      Uden foto (udeladt): {f.mangler.join(", ")}
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "flex-end" }}>
                  {f ? (
                    <>
                      <button type="button" style={primaer} disabled={travl} onClick={() => brug(produkt.id, scene.id)}>
                        {travl ? "Gemmer…" : "Brug det"}
                      </button>
                      <button type="button" style={knap} disabled={travl} onClick={() => generer(produkt.id, scene.id)}>
                        Prøv igen
                      </button>
                      <button type="button" style={{ ...knap, color: "#dc3545" }} disabled={travl} onClick={() => kassér(produkt.id, scene.id)}>
                        Kassér
                      </button>
                    </>
                  ) : (
                    <>
                      {st === "ikke_gennemgaaet" && (
                        <button type="button" style={gron} disabled={travl} onClick={() => godkend(produkt.id, scene.id)}>
                          Godkend
                        </button>
                      )}
                      <button type="button" style={st === "mangler" || st === "fjernet" ? primaer : knap} disabled={travl} onClick={() => generer(produkt.id, scene.id)}>
                        {travl ? "Genererer…" : st === "mangler" || st === "fjernet" ? `Generér (${GALLERY_SPEC.usd_per_image.toFixed(2)} $)` : "Lav om"}
                      </button>
                      {(st === "godkendt" || st === "ikke_gennemgaaet") && (
                        <button type="button" style={{ ...knap, color: "#dc3545" }} disabled={travl} onClick={() => fjern(produkt.id, scene.id)}>
                          Fjern
                        </button>
                      )}
                      {st === "fjernet" && statisk && (
                        <button type="button" style={knap} disabled={travl} onClick={() => godkend(produkt.id, scene.id)}>
                          Fortryd
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {synlige.length === 0 && (
            <p style={{ textAlign: "center", color: "#888", padding: "40px 0" }}>Ingen produkter i dette filter.</p>
          )}
        </div>
      </main>
    </div>
  );
}
