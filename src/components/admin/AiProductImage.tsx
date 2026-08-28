"use client";

import { useState } from "react";
import { GALLERY_SPEC, KATALOG_SCENE } from "@/lib/galleryPrompt";
import { generer as genererKald, uploadForslag, type Forslag } from "@/lib/galleryAdmin";

/**
 * "Lav produktfotoet om" — under billedfeltet på produktkortet.
 *
 * Galleriet laver billeder AF produktet i brug. Det her laver selve
 * katalogfotoet: samme produkt, ny optagelse, hvidt studie. Produktets
 * nuværende foto sendes med som reference, så det bliver den samme højtaler —
 * ikke en ny, modellen har fundet på. Har produktet intet foto endnu, er der
 * ikke noget at holde den fast på, og knappen siger det.
 *
 * Kommentarfeltet er hele pointen ved "lav om": man vil sjældent have et
 * tilfældigt nyt billede, man vil have det samme uden stativer, eller tættere
 * på, eller uden kablet i forgrunden.
 *
 * Forslaget gemmes ingen steder. Siger man ja, uploades det til R2, og stien
 * skrives i produktets billedfelt — som alt andet i kataloget først gemt, når
 * der trykkes "Gem ændringer".
 */

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

export default function AiProductImage({
  productId,
  harBillede,
  onChange,
}: {
  productId: string;
  /** Uden et foto at referere til ville modellen finde på et produkt */
  harBillede: boolean;
  onChange: (url: string) => void;
}) {
  const [note, setNote] = useState("");
  const [forslag, setForslag] = useState<Forslag | null>(null);
  const [travl, setTravl] = useState(false);
  const [fejl, setFejl] = useState("");
  const [forbrug, setForbrug] = useState<{ brugt: number; loft: number } | null>(null);

  const kør = async (arbejde: () => Promise<void>) => {
    setFejl("");
    setTravl(true);
    try {
      await arbejde();
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Noget gik galt");
    } finally {
      setTravl(false);
    }
  };

  const generer = () =>
    kør(async () => {
      const f = await genererKald(productId, KATALOG_SCENE.id, note);
      setForslag(f);
      if (typeof f.forbrugt === "number" && typeof f.loft === "number") {
        setForbrug({ brugt: f.forbrugt, loft: f.loft });
      }
    });

  const brug = () =>
    kør(async () => {
      if (!forslag) return;
      const url = await uploadForslag(productId, KATALOG_SCENE.id, forslag);
      onChange(url);
      setForslag(null);
      setNote("");
    });

  return (
    <div style={{ marginTop: "8px", borderTop: "1px dashed #eee", paddingTop: "8px" }}>
      <div style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>
        Lav om med AI · {GALLERY_SPEC.usd_per_image.toFixed(2)} $
        {forbrug ? ` · ${forbrug.brugt} af ${forbrug.loft} brugt denne måned` : ""}
      </div>

      {!harBillede && (
        <p style={{ fontSize: "11px", color: "#b8860b", margin: "0 0 6px" }}>
          Produktet har intet foto at holde modellen fast på — upload ét først, ellers finder den
          selv på et produkt.
        </p>
      )}

      {fejl && <p style={{ color: "#dc3545", fontSize: "12px", margin: "0 0 6px" }}>{fejl}</p>}

      {forslag && (
        <>
          <img
            src={`data:${forslag.mime};base64,${forslag.billede}`}
            alt="Forslag til nyt produktfoto"
            style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "contain", background: "#f7f7f7", borderRadius: "6px", border: "2px solid #0070f3", marginBottom: "6px" }}
          />
          {forslag.note && (
            <p style={{ fontSize: "11px", color: "#0070f3", margin: "0 0 6px" }}>
              Bad om: &quot;{forslag.note}&quot;
            </p>
          )}
        </>
      )}

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={300}
        placeholder="Skriv til AI'en, fx: uden stativer"
        aria-label="Kommentar til produktfotoet"
        style={{ width: "100%", boxSizing: "border-box", fontSize: "12px", padding: "6px 8px", borderRadius: "6px", border: "1px solid #e0e0e0", marginBottom: "6px" }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {forslag ? (
          <>
            <button type="button" style={primaer} disabled={travl} onClick={brug}>
              {travl ? "Gemmer…" : "Brug det"}
            </button>
            <button type="button" style={knap} disabled={travl} onClick={generer}>
              Prøv igen
            </button>
            <button type="button" style={{ ...knap, color: "#dc3545" }} disabled={travl} onClick={() => setForslag(null)}>
              Kassér
            </button>
          </>
        ) : (
          <button type="button" style={harBillede ? primaer : knap} disabled={travl || !harBillede} onClick={generer}>
            {travl ? "Genererer…" : `Lav produktfoto om (${GALLERY_SPEC.usd_per_image.toFixed(2)} $)`}
          </button>
        )}
      </div>
    </div>
  );
}
