"use client";

import { useState } from "react";
import { formatBytes } from "@/lib/compressImage";
import { GALLERY_SCENER, GALLERY_SPEC, type GalleryScene } from "@/lib/galleryPrompt";
import { PRODUCT_GALLERY } from "@/lib/productGallery";
import {
  fjern as fjernKald,
  generer as genererKald,
  godkendEksisterende,
  udgivForslag,
  type Forslag,
  type GalleryEntry,
} from "@/lib/galleryAdmin";

/**
 * Galleriet på produktets eget kort i /admin/produkter.
 *
 * Hele arbejdsgangen bor her, og ikke på en side ved siden af: fold produktet
 * ud, se hvad der findes, lav det der mangler, godkend det du kan stå inde
 * for, og gå videre til næste produkt. Der var en /admin/galleri med de samme
 * knapper — den er væk igen, fordi arbejdet hører til dér, hvor produktet er.
 *
 * Ét tryk er ét billede. Der genereres aldrig noget af sig selv, og et forslag
 * gemmes ingen steder, før nogen siger ja: det lever i browseren og forsvinder,
 * hvis det ikke duer.
 *
 * Indholdet bygges først, når kortet er foldet ud (`aktiv`). Produktlisten har
 * 45 kort, og tre sceneknapper på hvert af dem er 135 knapper, der ikke skal
 * bygges, fordi nogen ville rette en pris.
 */

export type SceneStatus = "mangler" | "ikke_gennemgaaet" | "godkendt" | "fjernet";

const STATUS: Record<SceneStatus, { tekst: string; farve: string }> = {
  mangler: { tekst: "Mangler", farve: "#999" },
  ikke_gennemgaaet: { tekst: "Ikke gennemgået", farve: "#b8860b" },
  godkendt: { tekst: "Godkendt", farve: "#1a7f37" },
  fjernet: { tekst: "Fjernet", farve: "#dc3545" },
};

/** Scenerne for et produkt — pakker og enkeltprodukter har hver sin "alt det du får". */
export function scenerTil(erPakke: boolean): GalleryScene[] {
  return GALLERY_SCENER.filter((s) => {
    // Produktfotoet hører til billedfeltet ovenfor, ikke i galleriet
    if (s.katalogfoto) return false;
    if (s.kun === "pakker" && !erPakke) return false;
    if (s.kun === "enkelt" && erPakke) return false;
    return true;
  });
}

/** Status for én scene, ud fra manifestet og de committede filer. */
export function sceneStatus(
  productId: string,
  sceneId: string,
  manifest: Record<string, GalleryEntry[]>,
): SceneStatus {
  const fraAdmin = manifest[productId]?.find((b) => b.scene === sceneId);
  if (fraAdmin) return fraAdmin.fjernet ? "fjernet" : "godkendt";
  if ((PRODUCT_GALLERY[productId] ?? []).some((b) => b.scene === sceneId)) return "ikke_gennemgaaet";
  return "mangler";
}

/** Opsummering til produktkortets hoved: hvor mange scener der er på plads. */
export function galleriOpsummering(
  productId: string,
  erPakke: boolean,
  manifest: Record<string, GalleryEntry[]>,
): { ialt: number; klar: number; ikkeSet: number } {
  let klar = 0;
  let ikkeSet = 0;
  const scener = scenerTil(erPakke);
  for (const s of scener) {
    const st = sceneStatus(productId, s.id, manifest);
    if (st === "godkendt") klar++;
    if (st === "ikke_gennemgaaet") {
      klar++;
      ikkeSet++;
    }
  }
  return { ialt: scener.length, klar, ikkeSet };
}

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
const gron: React.CSSProperties = { ...knap, background: "#1a7f37", borderColor: "#1a7f37", color: "#fff" };

export default function GalleryField({
  productId,
  productName,
  erPakke,
  aktiv,
  manifest,
  onManifest,
}: {
  productId: string;
  productName: string;
  /** Pakker og enkeltprodukter har hver sin "alt det du får"-scene */
  erPakke: boolean;
  /** Kortet er foldet ud — først da bygges knapperne */
  aktiv: boolean;
  /** Hele manifestet, ejet af siden, så korthovedet og feltet er enige */
  manifest: Record<string, GalleryEntry[]>;
  onManifest: (productId: string, billeder: GalleryEntry[]) => void;
}) {
  const [forslag, setForslag] = useState<Record<string, Forslag>>({});
  const [arbejder, setArbejder] = useState<string | null>(null);
  const [fejl, setFejl] = useState("");
  const [note, setNote] = useState("");
  const [forbrug, setForbrug] = useState<{ brugt: number; loft: number } | null>(null);
  /**
   * Fritekst pr. scene: "det samme uden stativer", "tættere på", "om vinteren".
   * Den følger med til modellen og vinder over scenens egen beskrivelse — men
   * ikke over reglen om, at grejet skal være vores eget.
   */
  const [noter, setNoter] = useState<Record<string, string>>({});

  const scener = scenerTil(erPakke);

  const kør = async (sceneId: string, arbejde: () => Promise<void>) => {
    setFejl("");
    setNote("");
    setArbejder(sceneId);
    try {
      await arbejde();
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Noget gik galt");
    } finally {
      setArbejder(null);
    }
  };

  const generer = (scene: GalleryScene) =>
    kør(scene.id, async () => {
      const f = await genererKald(productId, scene.id, noter[scene.id]);
      setForslag((s) => ({ ...s, [scene.id]: f }));
      if (typeof f.forbrugt === "number" && typeof f.loft === "number") {
        setForbrug({ brugt: f.forbrugt, loft: f.loft });
      }
    });

  const brug = (scene: GalleryScene) =>
    kør(scene.id, async () => {
      const f = forslag[scene.id];
      if (!f) return;
      const { billeder, bytes } = await udgivForslag(productId, scene.id, f);
      onManifest(productId, billeder);
      setForslag((s) => {
        const n = { ...s };
        delete n[scene.id];
        return n;
      });
      setNote(`${scene.titel_da} er live på produktsiden (${formatBytes(bytes)}).`);
    });

  const godkend = (scene: GalleryScene) =>
    kør(scene.id, async () => {
      const statisk = (PRODUCT_GALLERY[productId] ?? []).find((b) => b.scene === scene.id);
      if (!statisk) return;
      onManifest(productId, await godkendEksisterende(productId, scene.id, statisk.src));
      setNote("Markeret som gennemgået. Det koster ingenting — billedet lå der i forvejen.");
    });

  const fjern = (scene: GalleryScene) =>
    kør(scene.id, async () => {
      onManifest(productId, await fjernKald(productId, scene.id));
      setNote("Billedet vises ikke længere på produktsiden.");
    });

  const kassér = (sceneId: string) =>
    setForslag((s) => {
      const n = { ...s };
      delete n[sceneId];
      return n;
    });

  // Kortet er klappet sammen — der er ingen grund til at bygge noget endnu
  if (!aktiv) return null;

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
        Billederne laves ud fra produktfotoene af de dele, produktet består af — så det er vores eget
        grej, der står i billedet. Ét tryk er ét billede, og forslaget gemmes ingen steder, før du
        trykker &quot;Brug det&quot;.
      </p>

      {fejl && <div style={{ background: "#f8d7da", color: "#721c24", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "10px" }}>{fejl}</div>}
      {note && <div style={{ background: "#d4edda", color: "#155724", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "10px" }}>{note}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "12px" }}>
        {scener.map((scene) => {
          const st = sceneStatus(productId, scene.id, manifest);
          const f = forslag[scene.id];
          const travl = arbejder === scene.id;
          const fraAdmin = manifest[productId]?.find((b) => b.scene === scene.id && !b.fjernet);
          const statisk = (PRODUCT_GALLERY[productId] ?? []).find((b) => b.scene === scene.id);
          const vist = f
            ? `data:${f.mime};base64,${f.billede}`
            : st === "godkendt" && fraAdmin
              ? fraAdmin.src
              : st === "ikke_gennemgaaet" && statisk
                ? statisk.thumb
                : null;

          return (
            <div
              key={scene.id}
              style={{
                border: f ? "2px solid #0070f3" : "1px solid #e6e6e6",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 600 }}>{scene.titel_da}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: f ? "#0070f3" : STATUS[st].farve, margin: "2px 0 8px" }}>
                {f ? "Forslag — ikke gemt endnu" : STATUS[st].tekst}
                {!f && fraAdmin?.updatedBy ? ` · ${fraAdmin.updatedBy}` : ""}
              </div>

              {vist ? (
                <img
                  src={vist}
                  alt=""
                  style={{ width: "100%", aspectRatio: scene.ratio.replace(":", " / "), objectFit: "cover", borderRadius: "6px", background: "#f2f2f2", marginBottom: "8px" }}
                />
              ) : (
                <div style={{ width: "100%", aspectRatio: scene.ratio.replace(":", " / "), borderRadius: "6px", background: "#f7f7f7", border: "1px dashed #ddd", marginBottom: "8px" }} />
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

              {f?.note && (
                <p style={{ fontSize: "11px", color: "#0070f3", margin: "0 0 6px" }}>
                  Bad om: &quot;{f.note}&quot;
                </p>
              )}

              <input
                type="text"
                value={noter[scene.id] ?? ""}
                onChange={(e) => setNoter((n) => ({ ...n, [scene.id]: e.target.value }))}
                maxLength={300}
                placeholder="Skriv til AI'en, fx: uden stativer"
                aria-label={`Kommentar til ${scene.titel_da}`}
                style={{ width: "100%", boxSizing: "border-box", fontSize: "12px", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e0e0e0", marginBottom: "8px" }}
              />

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
                    {st === "ikke_gennemgaaet" && (
                      <button type="button" style={gron} disabled={travl} onClick={() => godkend(scene)}>
                        Godkend
                      </button>
                    )}
                    <button
                      type="button"
                      style={st === "mangler" || st === "fjernet" ? primaer : knap}
                      disabled={travl}
                      onClick={() => generer(scene)}
                    >
                      {travl
                        ? "Genererer…"
                        : st === "mangler" || st === "fjernet"
                          ? `Generér (${GALLERY_SPEC.usd_per_image.toFixed(2)} $)`
                          : "Lav om"}
                    </button>
                    {(st === "godkendt" || st === "ikke_gennemgaaet") && (
                      <button type="button" style={{ ...knap, color: "#dc3545" }} disabled={travl} onClick={() => fjern(scene)}>
                        Fjern
                      </button>
                    )}
                    {st === "fjernet" && statisk && (
                      <button type="button" style={knap} disabled={travl} onClick={() => godkend(scene)}>
                        Fortryd
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
