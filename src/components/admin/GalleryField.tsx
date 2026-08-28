"use client";

import { useCallback, useEffect, useState } from "react";
import { formatBytes } from "@/lib/compressImage";
import { GALLERY_SCENER, GALLERY_SPEC, type GalleryScene } from "@/lib/galleryPrompt";
import {
  fjern as fjernKald,
  generer as genererKald,
  hentManifest,
  udgivForslag,
  type Forslag,
  type GalleryEntry,
} from "@/lib/galleryAdmin";

/**
 * "Generér galleri" på produktkortet i /admin/produkter.
 *
 * Ét billede ad gangen, og aldrig direkte ud til kunderne: forslaget vises i
 * browseren og gemmes ingen steder, før Frederik siger ja. Siger han ja,
 * komprimeres billedet her i browseren og uploades gennem /api/upload — samme
 * vej som alle andre admin-billeder — og først derefter skrives det i
 * manifestet. Siger han nej, forsvinder det med det samme.
 *
 * Prisen står på knappen. Et tryk koster rigtige penge, og der er ingen
 * kvittering før regningen kommer.
 */

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666",
  marginBottom: "4px",
};

const knap: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #d0d0d0",
  background: "#fff",
  cursor: "pointer",
};

const primaer: React.CSSProperties = { ...knap, background: "#0070f3", borderColor: "#0070f3", color: "#fff" };

export default function GalleryField({
  productId,
  productName,
  erPakke,
}: {
  productId: string;
  productName: string;
  /** Pakker og enkeltprodukter har hver sin "alt det du får"-scene */
  erPakke: boolean;
}) {
  const [billeder, setBilleder] = useState<GalleryEntry[]>([]);
  const [forslag, setForslag] = useState<Record<string, Forslag>>({});
  const [arbejder, setArbejder] = useState<string | null>(null);
  const [fejl, setFejl] = useState("");
  const [note, setNote] = useState("");
  const [forbrug, setForbrug] = useState<{ brugt: number; loft: number } | null>(null);
  /**
   * Foldet sammen indtil nogen har brug for det.
   *
   * /admin/produkter viser 45 kort, og et galleri-felt pr. kort er 135
   * sceneknapper og et manifest-opslag på hver sideindlæsning. Skal du bare
   * rette en pris, er det arbejde for ingenting — og det kunne mærkes på,
   * hvor længe siden var om at blive klar.
   */
  const [aaben, setAaben] = useState(false);

  const scener: GalleryScene[] = GALLERY_SCENER.filter((s) => {
    if (s.kun === "pakker" && !erPakke) return false;
    if (s.kun === "enkelt" && erPakke) return false;
    return true;
  });

  const hent = useCallback(async () => {
    const data = await hentManifest();
    setBilleder(data[productId] ?? []);
  }, [productId]);

  useEffect(() => {
    if (aaben) hent();
  }, [aaben, hent]);

  const generer = async (scene: GalleryScene) => {
    setFejl("");
    setNote("");
    setArbejder(scene.id);
    try {
      const f = await genererKald(productId, scene.id);
      setForslag((s) => ({ ...s, [scene.id]: f }));
      if (typeof f.forbrugt === "number" && typeof f.loft === "number") {
        setForbrug({ brugt: f.forbrugt, loft: f.loft });
      }
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Kunne ikke generere");
    } finally {
      setArbejder(null);
    }
  };

  const brug = async (scene: GalleryScene) => {
    const f = forslag[scene.id];
    if (!f) return;
    setFejl("");
    setArbejder(scene.id);
    try {
      const { billeder: nye, bytes } = await udgivForslag(productId, scene.id, f);
      setBilleder(nye);
      setForslag((s) => {
        const n = { ...s };
        delete n[scene.id];
        return n;
      });
      setNote(`${scene.titel_da} er live på produktsiden (${formatBytes(bytes)}).`);
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Kunne ikke gemme billedet");
    } finally {
      setArbejder(null);
    }
  };

  const fjern = async (scene: string) => {
    setFejl("");
    setArbejder(scene);
    try {
      setBilleder(await fjernKald(productId, scene));
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Kunne ikke fjerne billedet");
    } finally {
      setArbejder(null);
    }
  };

  const kassér = (scene: string) =>
    setForslag((s) => {
      const n = { ...s };
      delete n[scene];
      return n;
    });

  return (
    <details
      open={aaben}
      onToggle={(e) => setAaben((e.currentTarget as HTMLDetailsElement).open)}
      style={{ gridColumn: "1 / -1", borderTop: "1px solid #eee", paddingTop: "14px", marginTop: "4px" }}
    >
      <summary style={{ ...labelStyle, cursor: "pointer", marginBottom: 0 }}>
        Galleri — {productName} i brug
        <span style={{ fontWeight: 400, color: "#888" }}>
          {" "}· {GALLERY_SPEC.usd_per_image.toFixed(2)} $ pr. billede
          {forbrug ? ` · ${forbrug.brugt} af ${forbrug.loft} brugt denne måned` : ""}
        </span>
      </summary>

      <p style={{ fontSize: "12px", color: "#888", margin: "10px 0 12px" }}>
        Hele listen produkt for produkt ligger på{" "}
        <a href="/admin/galleri" style={{ color: "#0070f3" }}>Galleri</a>.{" "}
        Billederne laves ud fra produktfotoene af de dele, produktet består af — så det er vores eget grej,
        der står i billedet. Forslaget gemmes ingen steder, før du trykker "Brug det".
      </p>

      {fejl && <div style={{ background: "#f8d7da", color: "#721c24", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "10px" }}>{fejl}</div>}
      {note && <div style={{ background: "#d4edda", color: "#155724", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "10px" }}>{note}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        {scener.map((scene) => {
          // En gravsten er ikke et billede — den betyder at scenen er fjernet
          const live = billeder.find((b) => b.scene === scene.id && !b.fjernet);
          const f = forslag[scene.id];
          const travl = arbejder === scene.id;

          return (
            <div key={scene.id} style={{ border: "1px solid #e6e6e6", borderRadius: "8px", padding: "10px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>{scene.titel_da}</div>

              {(f || live) && (
                <img
                  src={f ? `data:${f.mime};base64,${f.billede}` : live!.src}
                  alt={f ? f.alt_da : live!.alt_da}
                  style={{ width: "100%", aspectRatio: scene.ratio.replace(":", " / "), objectFit: "cover", borderRadius: "6px", background: "#f2f2f2", marginBottom: "8px" }}
                />
              )}

              {f?.mangler.length ? (
                <p style={{ fontSize: "11px", color: "#b8860b", margin: "0 0 6px" }}>
                  Uden foto (udeladt): {f.mangler.join(", ")}
                </p>
              ) : null}
              {f?.skaaret.length ? (
                <p style={{ fontSize: "11px", color: "#b8860b", margin: "0 0 6px" }}>
                  For mange dele — skåret fra: {f.skaaret.join(", ")}
                </p>
              ) : null}

              {live && !f && (
                <p style={{ fontSize: "11px", color: "#888", margin: "0 0 8px" }}>
                  Live{live.updatedBy ? ` · sat ind af ${live.updatedBy}` : ""}
                </p>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {f ? (
                  <>
                    <button type="button" style={primaer} disabled={travl} onClick={() => brug(scene)}>
                      {travl ? "Gemmer…" : "Brug det"}
                    </button>
                    <button type="button" style={knap} disabled={travl} onClick={() => generer(scene)}>
                      Prøv igen
                    </button>
                    <button type="button" style={{ ...knap, color: "#dc3545" }} disabled={travl} onClick={() => kassér(scene.id)}>
                      Kassér
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" style={live ? knap : primaer} disabled={travl} onClick={() => generer(scene)}>
                      {travl ? "Genererer…" : live ? "Lav om" : `Generér (${GALLERY_SPEC.usd_per_image.toFixed(2)} $)`}
                    </button>
                    {live && (
                      <button type="button" style={{ ...knap, color: "#dc3545" }} disabled={travl} onClick={() => fjern(scene.id)}>
                        Fjern
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}
