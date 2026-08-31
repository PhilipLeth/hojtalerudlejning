"use client";

import { useRef, useState } from "react";
import { formatBytes } from "@/lib/compressImage";
import { GALLERY_SCENER, GALLERY_SPEC, type GalleryScene } from "@/lib/galleryPrompt";
import { erAktiv } from "@/lib/galleryStatus";
import { PRODUCT_GALLERY } from "@/lib/productGallery";
import {
  gemTekst as gemTekstKald,
  generer as genererKald,
  saetAktiv as saetAktivKald,
  udgivForslag,
  type Forrige,
  type Forslag,
  type GalleryEntry,
} from "@/lib/galleryAdmin";

/**
 * Galleriet på produktets eget kort i /admin/produkter.
 *
 * Hele arbejdsgangen bor her, og ikke på en side ved siden af: fold produktet
 * ud, se hvad der findes, lav det der mangler, slå det til du kan stå inde
 * for, og gå videre til næste produkt. Der var en /admin/galleri med de samme
 * knapper — den er væk igen, fordi arbejdet hører til dér, hvor produktet er.
 *
 * Intet vises for kunderne, før det er slået til. Billederne fra bulk-kørslen
 * ligger som filer i repoet, men de er kandidater: de står her som "ikke
 * gennemgået" med toggle'n slået fra, og kunden ser dem først, når nogen har
 * set dem og slået dem til.
 *
 * Ét tryk er ét billede. Der genereres aldrig noget af sig selv, og et forslag
 * gemmes ingen steder, før nogen siger ja: det lever i browseren og forsvinder,
 * hvis det ikke duer. "Ret dette billede" sender det, man kigger på, med til
 * modellen; "Ny optagelse" gør det ikke.
 *
 * Indholdet bygges først, når kortet er foldet ud (`aktiv`-prop'en — kortets
 * tilstand, ikke billedets). Produktlisten har 45 kort, og tre scener på hvert
 * af dem er 135 sæt knapper, der ikke skal bygges, fordi nogen ville rette en pris.
 */

export type SceneStatus = "mangler" | "ikke_gennemgaaet" | "aktiv" | "inaktiv";

const STATUS: Record<SceneStatus, { tekst: string; farve: string }> = {
  mangler: { tekst: "Mangler", farve: "#999" },
  ikke_gennemgaaet: { tekst: "Ikke gennemgået — vises ikke", farve: "#b8860b" },
  aktiv: { tekst: "Aktiv — vises på produktsiden", farve: "#1a7f37" },
  inaktiv: { tekst: "Inaktiv — vises ikke", farve: "#666" },
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
  const post = manifest[productId]?.find((b) => b.scene === sceneId);
  if (post) return erAktiv(post) ? "aktiv" : "inaktiv";
  if ((PRODUCT_GALLERY[productId] ?? []).some((b) => b.scene === sceneId)) return "ikke_gennemgaaet";
  return "mangler";
}

/** Opsummering til produktkortets hoved: hvor mange scener kunden faktisk ser. */
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
    if (st === "aktiv") klar++;
    if (st === "ikke_gennemgaaet") ikkeSet++;
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
const tekstFelt: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontSize: "12px",
  padding: "6px 8px",
  borderRadius: "6px",
  border: "1px solid #e0e0e0",
  marginBottom: "6px",
};

const pris = `${GALLERY_SPEC.usd_per_image.toFixed(2)} $`;

/** Toggle'n: én knap, der siger hvad den gør, og hvad den står på. */
function AktivToggle({ til, travl, onClick, navn }: { til: boolean; travl: boolean; onClick: () => void; navn: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={til}
      aria-label={`Vis ${navn} på produktsiden`}
      disabled={travl}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "4px 8px 4px 4px",
        borderRadius: "999px",
        border: "1px solid " + (til ? "#1a7f37" : "#d0d0d0"),
        background: "#fff",
        cursor: travl ? "wait" : "pointer",
        fontSize: "12px",
        fontWeight: 600,
        color: til ? "#1a7f37" : "#666",
      }}
    >
      <span
        aria-hidden
        style={{
          width: "34px",
          height: "18px",
          borderRadius: "999px",
          background: til ? "#1a7f37" : "#ccc",
          position: "relative",
          transition: "background .15s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: til ? "18px" : "2px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "#fff",
            transition: "left .15s",
          }}
        />
      </span>
      {til ? "Aktiv" : "Inaktiv"}
    </button>
  );
}

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
  /**
   * Hvilke scener der arbejder — ét sæt, ikke én streng. Med én streng
   * overtog "Lav om" på scene to låsen fra scene et: første knap låste op
   * midt i arbejdet (og kunne trykkes igen — endnu et billede for pengene),
   * og da det første blev færdigt, låste det andet op, selvom det kørte.
   */
  const [arbejder, setArbejder] = useState<Set<string>>(() => new Set());
  /**
   * Skrivninger til manifestet står i kø. API'et læser hele manifestet,
   * retter én post og skriver det hele tilbage — to "Brug det" på samme tid
   * ville læse det samme udgangspunkt, og den sidste ville skrive den førstes
   * billede væk igen. Generering går uden om køen; den skriver ingenting.
   */
  const skrivKø = useRef<Promise<void>>(Promise.resolve());
  const [fejl, setFejl] = useState("");
  const [note, setNote] = useState("");
  const [forbrug, setForbrug] = useState<{ brugt: number; loft: number } | null>(null);
  /**
   * Fritekst pr. scene: "det samme uden stativer", "tættere på", "om vinteren".
   * Den følger med til modellen og vinder over scenens egen beskrivelse — men
   * ikke over reglen om, at grejet skal være vores eget.
   */
  const [noter, setNoter] = useState<Record<string, string>>({});
  /**
   * Billedtekster under redigering, pr. scene. Skabelonen i scenes.json
   * rammer ikke altid ("det der ligger i kassen" om en Soundboks), så teksten
   * kan rettes her og gemmes i manifestet — admin vinder over skabelonen,
   * ligesom admins billede vinder over det committede.
   */
  const [tekster, setTekster] = useState<Record<string, { da: string; en: string }>>({});

  const scener = scenerTil(erPakke);

  const kør = async (sceneId: string, arbejde: () => Promise<void>) => {
    setFejl("");
    setNote("");
    setArbejder((a) => new Set(a).add(sceneId));
    try {
      await arbejde();
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Noget gik galt");
    } finally {
      setArbejder((a) => {
        const n = new Set(a);
        n.delete(sceneId);
        return n;
      });
    }
  };

  /** Som kør(), men én ad gangen — til alt der skriver i manifestet. */
  const skriv = (sceneId: string, arbejde: () => Promise<void>) =>
    kør(sceneId, () => {
      const min = skrivKø.current.then(arbejde);
      skrivKø.current = min.catch(() => {});
      return min;
    });

  /**
   * To knapper, to ting. "Ret dette billede" sender det billede, man kigger
   * på (et usendt forslag, ellers det der ligger i manifestet eller fra
   * bulk-kørslen) med som sidste reference. "Ny optagelse" sender kun
   * produktfotoene, som før.
   */
  const generer = (scene: GalleryScene, retDetForrige: boolean) =>
    kør(scene.id, async () => {
      let forrige: Forrige | undefined;
      if (retDetForrige) {
        const usendt = forslag[scene.id];
        const post = manifest[productId]?.find((b) => b.scene === scene.id && b.src);
        const statisk = (PRODUCT_GALLERY[productId] ?? []).find((b) => b.scene === scene.id);
        const live = post?.src ?? statisk?.src;
        forrige = usendt ? { billede: usendt.billede, mime: usendt.mime } : live ? { url: live } : undefined;
      }
      const f = await genererKald(productId, scene.id, noter[scene.id], forrige);
      setForslag((s) => ({ ...s, [scene.id]: f }));
      if (typeof f.forbrugt === "number" && typeof f.loft === "number") {
        setForbrug({ brugt: f.forbrugt, loft: f.loft });
      }
    });

  const brug = (scene: GalleryScene) =>
    skriv(scene.id, async () => {
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

  const skift = (scene: GalleryScene, til: boolean) =>
    skriv(scene.id, async () => {
      onManifest(productId, await saetAktivKald(productId, scene.id, til));
      setNote(til ? `${scene.titel_da} vises nu på produktsiden.` : `${scene.titel_da} vises ikke længere.`);
    });

  const gemTekst = (scene: GalleryScene, da: string, en: string) =>
    skriv(scene.id, async () => {
      onManifest(productId, await gemTekstKald(productId, scene.id, da, en));
      setTekster((s) => {
        const n = { ...s };
        delete n[scene.id];
        return n;
      });
      setNote(da || en ? "Billedteksten er gemt." : "Billedteksten er sat tilbage til skabelonen.");
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
          {" "}· {pris} pr. billede
          {forbrug ? ` · ${forbrug.brugt} af ${forbrug.loft} brugt denne måned` : ""}
        </span>
      </label>

      <p style={{ fontSize: "12px", color: "#888", margin: "0 0 12px" }}>
        Billederne laves ud fra produktfotoene af de dele, produktet består af — så det er vores eget
        grej, der står i billedet. Kunden ser kun det, der er slået til. Et forslag gemmes ingen steder,
        før du trykker &quot;Brug det&quot;.
      </p>

      {fejl && <div style={{ background: "#f8d7da", color: "#721c24", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "10px" }}>{fejl}</div>}
      {note && <div style={{ background: "#d4edda", color: "#155724", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "10px" }}>{note}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "12px" }}>
        {scener.map((scene) => {
          const st = sceneStatus(productId, scene.id, manifest);
          const f = forslag[scene.id];
          const travl = arbejder.has(scene.id);
          const post = manifest[productId]?.find((b) => b.scene === scene.id && b.src);
          const statisk = (PRODUCT_GALLERY[productId] ?? []).find((b) => b.scene === scene.id);
          // Det billede der er — admins post, ellers filen fra bulk-kørslen
          const nuv = post ?? statisk;
          const harBillede = !!nuv;
          const redigeret = tekster[scene.id];
          const tekstDa = redigeret?.da ?? nuv?.caption_da ?? "";
          const tekstEn = redigeret?.en ?? nuv?.caption_en ?? "";
          const tekstAendret =
            !!redigeret && (tekstDa !== (nuv?.caption_da ?? "") || tekstEn !== (nuv?.caption_en ?? ""));
          const vist = f
            ? `data:${f.mime};base64,${f.billede}`
            : post?.src ?? statisk?.thumb ?? null;

          return (
            <div
              key={scene.id}
              style={{
                border: f ? "2px solid #0070f3" : "1px solid #e6e6e6",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{scene.titel_da}</div>
                {!f && harBillede && (
                  <AktivToggle til={st === "aktiv"} travl={travl} navn={scene.titel_da} onClick={() => skift(scene, st !== "aktiv")} />
                )}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: f ? "#0070f3" : STATUS[st].farve, margin: "2px 0 8px" }}>
                {f ? "Forslag — ikke gemt endnu" : STATUS[st].tekst}
                {!f && post?.updatedBy ? ` · ${post.updatedBy}` : ""}
              </div>

              {vist ? (
                <img
                  src={vist}
                  alt=""
                  style={{ width: "100%", aspectRatio: scene.ratio.replace(":", " / "), objectFit: "cover", borderRadius: "6px", background: "#f2f2f2", marginBottom: "8px", opacity: !f && st !== "aktiv" ? 0.6 : 1 }}
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

              {f && (
                <p style={{ fontSize: "11px", color: "#0070f3", margin: "0 0 6px" }}>
                  {f.forrige ? "Rettet ud fra det forrige billede" : "Ny optagelse"}
                  {f.note ? ` — bad om: "${f.note}"` : ""}
                </p>
              )}

              <input
                type="text"
                value={noter[scene.id] ?? ""}
                onChange={(e) => setNoter((n) => ({ ...n, [scene.id]: e.target.value }))}
                maxLength={300}
                placeholder="Skriv til AI'en, fx: uden stativer"
                aria-label={`Kommentar til ${scene.titel_da}`}
                style={tekstFelt}
              />

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {f ? (
                  <>
                    <button type="button" style={primaer} disabled={travl} onClick={() => brug(scene)}>
                      {travl ? "Gemmer…" : "Brug det"}
                    </button>
                    <button type="button" style={knap} disabled={travl} onClick={() => generer(scene, true)} title="Sender forslaget med, og retter kun det du skriver">
                      {travl ? "Genererer…" : `Ret forslaget (${pris})`}
                    </button>
                    <button type="button" style={knap} disabled={travl} onClick={() => generer(scene, false)} title="Fra bunden, kun ud fra produktfotoene">
                      Ny optagelse ({pris})
                    </button>
                    <button type="button" style={{ ...knap, color: "#dc3545" }} disabled={travl} onClick={() => kassér(scene.id)}>
                      Kassér
                    </button>
                  </>
                ) : harBillede ? (
                  <>
                    <button type="button" style={knap} disabled={travl} onClick={() => generer(scene, true)} title="Sender billedet med, og retter kun det du skriver">
                      {travl ? "Genererer…" : `Ret dette billede (${pris})`}
                    </button>
                    <button type="button" style={knap} disabled={travl} onClick={() => generer(scene, false)} title="Fra bunden, kun ud fra produktfotoene">
                      Ny optagelse ({pris})
                    </button>
                  </>
                ) : (
                  <button type="button" style={primaer} disabled={travl} onClick={() => generer(scene, false)}>
                    {travl ? "Genererer…" : `Generér (${GALLERY_SPEC.usd_per_image.toFixed(2)} $)`}
                  </button>
                )}
              </div>

              {!f && harBillede && (
                <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px dashed #eee" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#666", marginBottom: "4px" }}>
                    Billedtekst{post?.egenTekst ? " · rettet i hånden" : ""}
                  </div>
                  <input
                    type="text"
                    value={tekstDa}
                    onChange={(e) => setTekster((s) => ({ ...s, [scene.id]: { da: e.target.value, en: tekstEn } }))}
                    maxLength={200}
                    placeholder="Dansk"
                    aria-label={`Billedtekst (dansk) til ${scene.titel_da}`}
                    style={tekstFelt}
                  />
                  <input
                    type="text"
                    value={tekstEn}
                    onChange={(e) => setTekster((s) => ({ ...s, [scene.id]: { da: tekstDa, en: e.target.value } }))}
                    maxLength={200}
                    placeholder="English"
                    aria-label={`Billedtekst (engelsk) til ${scene.titel_da}`}
                    style={tekstFelt}
                  />
                  {(tekstAendret || post?.egenTekst) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {tekstAendret && (
                        <button type="button" style={primaer} disabled={travl} onClick={() => gemTekst(scene, tekstDa, tekstEn)}>
                          {travl ? "Gemmer…" : "Gem tekst"}
                        </button>
                      )}
                      {post?.egenTekst && (
                        <button type="button" style={knap} disabled={travl} onClick={() => gemTekst(scene, "", "")}>
                          Tilbage til skabelonen
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
