"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminToken } from "@/lib/useAdminAuth";
import { compressImage, formatBytes, MAX_UPLOAD_BYTES } from "@/lib/compressImage";
import { GALLERY_SCENER, GALLERY_SPEC, type GalleryScene } from "@/lib/galleryPrompt";

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

export interface GalleryEntry {
  src: string;
  thumb: string;
  scene: string;
  ratio: string;
  titel_da: string;
  alt_da: string;
  caption_da: string;
  updatedBy?: string;
  updatedAt?: string;
}

interface Forslag {
  billede: string;
  mime: string;
  titel_da: string;
  alt_da: string;
  caption_da: string;
  skaaret: string[];
  mangler: string[];
}

/** base64 fra API'et → en File, browseren kan komprimere og uploade. */
function tilFil(base64: string, mime: string, navn: string): File {
  const binaer = atob(base64);
  const bytes = new Uint8Array(binaer.length);
  for (let i = 0; i < binaer.length; i++) bytes[i] = binaer.charCodeAt(i);
  return new File([bytes], navn, { type: mime });
}

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

  const scener: GalleryScene[] = GALLERY_SCENER.filter((s) => {
    if (s.kun === "pakker" && !erPakke) return false;
    if (s.kun === "enkelt" && erPakke) return false;
    return true;
  });

  const hent = useCallback(async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = (await res.json()) as Record<string, GalleryEntry[]>;
      setBilleder(data[productId] ?? []);
    } catch {
      // Galleriet er pynt i admin — en netværksfejl her må ikke spærre resten
    }
  }, [productId]);

  useEffect(() => {
    hent();
  }, [hent]);

  const kald = async (body: Record<string, unknown>) => {
    const secret = getAdminToken();
    const res = await fetch(`/api/gallery?secret=${encodeURIComponent(secret)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `Fejl ${res.status}`);
    return data;
  };

  const generer = async (scene: GalleryScene) => {
    setFejl("");
    setNote("");
    setArbejder(scene.id);
    try {
      const data = await kald({ action: "generate", productId, scene: scene.id });
      setForslag((f) => ({
        ...f,
        [scene.id]: {
          billede: data.image,
          mime: data.mime ?? "image/jpeg",
          titel_da: data.titel_da,
          alt_da: data.alt_da,
          caption_da: data.caption_da,
          skaaret: data.skaaret ?? [],
          mangler: data.mangler ?? [],
        },
      }));
      if (typeof data.forbrugt === "number") setForbrug({ brugt: data.forbrugt, loft: data.loft });
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
      const raa = tilFil(f.billede, f.mime, `${productId}-${scene.id}.jpg`);
      const { file, bytes } = await compressImage(raa);
      if (bytes > MAX_UPLOAD_BYTES) {
        setFejl(`Billedet fylder ${formatBytes(bytes)} efter komprimering — max ${formatBytes(MAX_UPLOAD_BYTES)}.`);
        return;
      }
      const secret = getAdminToken();
      const up = await fetch(`/api/upload?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": file.type || "image/webp" },
        body: file,
      });
      const updata = await up.json();
      if (!up.ok) throw new Error(updata.error ?? "Upload fejlede");

      const data = await kald({ action: "publish", productId, scene: scene.id, url: updata.url });
      setBilleder(data.billeder ?? []);
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
      const data = await kald({ action: "remove", productId, scene });
      setBilleder(data.billeder ?? []);
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
    <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #eee", paddingTop: "14px", marginTop: "4px" }}>
      <label style={labelStyle}>
        Galleri — {productName} i brug
        <span style={{ fontWeight: 400, color: "#888" }}>
          {" "}· {GALLERY_SPEC.usd_per_image.toFixed(2)} $ pr. billede
          {forbrug ? ` · ${forbrug.brugt} af ${forbrug.loft} brugt denne måned` : ""}
        </span>
      </label>

      <p style={{ fontSize: "12px", color: "#888", margin: "0 0 12px" }}>
        Billederne laves ud fra produktfotoene af de dele, produktet består af — så det er vores eget grej,
        der står i billedet. Forslaget gemmes ingen steder, før du trykker "Brug det".
      </p>

      {fejl && <div style={{ background: "#f8d7da", color: "#721c24", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "10px" }}>{fejl}</div>}
      {note && <div style={{ background: "#d4edda", color: "#155724", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "10px" }}>{note}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        {scener.map((scene) => {
          const live = billeder.find((b) => b.scene === scene.id);
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
    </div>
  );
}
