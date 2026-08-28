"use client";

import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth, getAdminToken } from "@/lib/useAdminAuth";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  speakers as defaultSpeakers,
  addons as defaultAddons,
  rentalProducts as defaultRentals,
  isBundleProduct,
  isDeliveryAddon,
  type Speaker,
  type Addon,
  type RentalProduct,
  type ProductCategory,
} from "@/lib/products";
import { DEFAULT_ADMIN_CATALOG, loadAdminCatalog } from "@/lib/useAdminCatalog";
import { useLager } from "@/lib/useLager";
import { StockField } from "@/components/admin/StockField";
import ImageField from "@/components/admin/ImageField";
import GalleryField, { galleriOpsummering } from "@/components/admin/GalleryField";
import { hentManifest, type GalleryEntry } from "@/lib/galleryAdmin";
import VideoField from "@/components/admin/VideoField";
import CreateProductModal, { type ProductType } from "@/components/admin/CreateProductModal";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  boxSizing: "border-box",
  color: "#111",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666",
  marginBottom: "4px",
};

function AllowedAddonsField({
  allAddons,
  value,
  onChange,
}: {
  allAddons: Addon[];
  value: string[] | undefined;
  onChange: (v: string[] | undefined) => void;
}) {
  // undefined = all addons shown (default). Empty array = none shown.
  const allChecked = value === undefined;
  const selected = value ?? [];

  const toggle = (id: string) => {
    if (allChecked) {
      // was "all" — now exclude this one
      onChange(allAddons.map((a) => a.id).filter((aid) => aid !== id));
    } else {
      const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
      onChange(next.length === allAddons.length ? undefined : next);
    }
  };

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <p style={labelStyle}>Tilvalg der vises til kunden</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
        {allAddons.map((a) => {
          const checked = allChecked || selected.includes(a.id);
          return (
            <label key={a.id} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", cursor: "pointer", padding: "4px 10px", border: `1px solid ${checked ? "#0070f3" : "#ddd"}`, borderRadius: "20px", background: checked ? "#e8f0fe" : "#fff", color: checked ? "#0070f3" : "#555" }}>
              <input type="checkbox" checked={checked} onChange={() => toggle(a.id)} style={{ accentColor: "#0070f3" }} />
              {a.da.label}
            </label>
          );
        })}
        <button type="button" onClick={() => onChange(undefined)} style={{ fontSize: "12px", color: "#888", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", textDecoration: "underline" }}>
          Vælg alle
        </button>
      </div>
      {!allChecked && selected.length === 0 && (
        <p style={{ fontSize: "12px", color: "#dc3545", marginTop: "4px" }}>Ingen tilvalg vises ved booking af dette produkt</p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  type,
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  textarea?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea rows={2} value={String(value)} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
      ) : (
        <input type={type || "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
      )}
    </div>
  );
}

/** Lagertallet i produktets sammenfoldede linje — tomt lager er værd at se */
/**
 * Pause et produkt uden at slette det.
 *
 * Feltet er `hidden`, som allerede filtrerer produktet væk overalt hos kunden
 * (useProducts) og i DBA-feedet. Kontakten fandtes i forvejen, men lå nederst
 * inde i det foldede kort, hvor Frederik ikke kunne finde den — derfor står
 * den nu i hovedet ved siden af Slet, så man kan pause uden at folde ud.
 *
 * Bevidst ikke det samme som udsolgt: udsolgt er et lagertal, pause er et
 * valg. Et pauset produkt beholder sin side og sine links, men kan ikke
 * bookes og optræder ikke i grid eller feed.
 */
function PauseKnap({ pauset, onToggle }: { pauset: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onToggle(); }}
      title={pauset ? "Vis produktet igen" : "Skjul produktet for kunderne — det kan ikke bookes imens"}
      style={{
        fontSize: "12px", cursor: "pointer", borderRadius: "999px", padding: "3px 10px",
        border: `1px solid ${pauset ? "#28a745" : "#d0d0d0"}`,
        background: pauset ? "#e8f6ec" : "#fff",
        color: pauset ? "#1c7430" : "#666",
      }}
    >
      {pauset ? "Genoptag" : "Pause"}
    </button>
  );
}

function StockBadge({ value, overbook }: { value: number | undefined; overbook?: number }) {
  if (value === undefined) {
    return (
      <span title="Intet lagertal — produktet kan bookes ubegrænset" style={{ fontSize: "11px", fontWeight: 700, color: "#b8860b", background: "#fffbf0", border: "1px solid #f0c36d", borderRadius: "20px", padding: "1px 8px" }}>
        lager ikke sat
      </span>
    );
  }
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <span title="Antal på lager" style={{ fontSize: "11px", fontWeight: 700, color: value === 0 ? "#c0392b" : "#555", background: "#f5f5f5", borderRadius: "20px", padding: "1px 8px" }}>
        {value} stk.
      </span>
      {!!overbook && (
        <span title={`Vi tager imod ${value + overbook} — ${overbook} skaffes til dagen`} style={{ fontSize: "11px", fontWeight: 700, color: "#4b2ea3", background: "#f6f2ff", border: "1px solid #d9ccf7", borderRadius: "20px", padding: "1px 8px" }}>
          +{overbook} JIT
        </span>
      )}
    </span>
  );
}

const navLink: React.CSSProperties = {
  padding: "8px 16px",
  fontSize: "14px",
  background: "#f0f0f0",
  border: "1px solid #ddd",
  borderRadius: "6px",
  textDecoration: "none",
  color: "#111",
};

export default function AdminProdukterPage() {
  const { secret, user, ready, isLoggedIn, logout, unauthorized } = useAdminAuth();
  const [speakers, setSpeakers] = useState<Speaker[]>(defaultSpeakers);
  const [addons, setAddons] = useState<Addon[]>(defaultAddons);
  const [rentals, setRentals] = useState<RentalProduct[]>(defaultRentals);
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  // Lageret hører til produktet, men gemmes for sig: ét tal skal kunne rettes
  // uden at publicere hele kataloget, og to faner må ikke overskrive hinanden
  const lager = useLager(secret);
  const setStock = (id: string, v: number | null) => lager.saveStock({ [id]: v });
  const setOverbook = (id: string, v: number | null) => lager.saveOverbook({ [id]: v });

  /**
   * Galleriet styres herfra, så korthovedet og feltet inde i kortet er enige
   * om hvad der findes. Manifestet hentes én gang for hele siden — ikke én
   * gang pr. produktkort.
   */
  const [galleri, setGalleri] = useState<Record<string, GalleryEntry[]>>({});
  const [aabne, setAabne] = useState<Set<string>>(new Set());
  const [galleriFilter, setGalleriFilter] = useState<"alle" | "mangler" | "ikke_gennemgaaet">("alle");

  useEffect(() => {
    hentManifest().then(setGalleri);
  }, []);

  /** Hvor langt galleriet er i alt — tallet i overblikket øverst på siden. */
  const galleriTal = useMemo(() => {
    let ialt = 0;
    let klar = 0;
    let ikkeSet = 0;
    const tæl = (id: string, page: string | undefined, erPakke: boolean) => {
      if (!page) return;
      const o = galleriOpsummering(id, erPakke, galleri);
      ialt += o.ialt;
      klar += o.klar;
      ikkeSet += o.ikkeSet;
    };
    for (const sp of speakers) tæl(sp.id, sp.page, false);
    for (const r of rentals) tæl(r.id, r.page, !!r.bundle?.parts?.length);
    for (const a of addons) tæl(a.id, a.page, false);
    return { ialt, klar, ikkeSet };
  }, [speakers, rentals, addons, galleri]);

  const sætGalleri = (id: string, billeder: GalleryEntry[]) =>
    setGalleri((m) => ({ ...m, [id]: billeder }));

  const foldet = (id: string) => (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const åben = e.currentTarget.open;
    setAabne((s) => {
      const n = new Set(s);
      if (åben) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  /** Statusmærket i korthovedet — så man kan se hvad der mangler uden at folde ud. */
  const galleriMærke = (id: string, page: string | undefined, erPakke: boolean) => {
    if (!page) return null;
    const { ialt, klar, ikkeSet } = galleriOpsummering(id, erPakke, galleri);
    const farve = klar === 0 ? "#999" : ikkeSet > 0 ? "#b8860b" : "#1a7f37";
    return (
      <span style={{ fontSize: "12px", color: farve, fontWeight: 600 }} title={ikkeSet ? `${ikkeSet} ikke gennemgået` : "Galleri"}>
        Galleri {klar}/{ialt}
        {ikkeSet > 0 ? " •" : ""}
      </span>
    );
  };

  /** Skal kortet skjules af galleri-filtret? Skjules, ikke fjernes — listerne
   *  redigeres via deres index, og et filtreret array ville flytte dem. */
  const skjulAfFilter = (id: string, page: string | undefined, erPakke: boolean) => {
    if (galleriFilter === "alle") return false;
    if (!page) return true;
    const { ialt, klar, ikkeSet } = galleriOpsummering(id, erPakke, galleri);
    if (galleriFilter === "mangler") return klar >= ialt;
    return ikkeSet === 0;
  };

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const c = await loadAdminCatalog();
      setSpeakers(c.speakers);
      setAddons(c.addons);
      setRentals(c.rentalProducts);
      setIsCustom(c.isCustom);
    } catch {
      setError("Kunne ikke hente produkter — viser standard-kataloget");
      setSpeakers(DEFAULT_ADMIN_CATALOG.speakers);
      setAddons(DEFAULT_ADMIN_CATALOG.addons);
      setRentals(DEFAULT_ADMIN_CATALOG.rentalProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const updateSpeaker = (i: number, patch: Partial<Speaker>) => {
    setSpeakers((prev) => prev.map((sp, idx) => (idx === i ? { ...sp, ...patch } : sp)));
  };
  const updateSpeakerText = (i: number, loc: "da" | "en", field: string, value: string) => {
    setSpeakers((prev) =>
      prev.map((sp, idx) => (idx === i ? { ...sp, [loc]: { ...sp[loc], [field]: value } } : sp))
    );
  };
  const updateAddon = (i: number, patch: Partial<Addon>) => {
    setAddons((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  };
  const updateAddonText = (i: number, loc: "da" | "en", field: string, value: string) => {
    setAddons((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, [loc]: { ...a[loc], [field]: value } } : a))
    );
  };
  const updateRental = (i: number, patch: Partial<RentalProduct>) => {
    setRentals((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const existingIds = new Set([
    ...speakers.map((s) => s.id),
    ...addons.map((a) => a.id),
    ...rentals.map((r) => r.id),
  ]);

  const handleCreate = (type: ProductType, product: Speaker | RentalProduct | Addon) => {
    if (type === "speaker") {
      setSpeakers((prev) => [...prev, product as Speaker]);
    } else if (type === "rental") {
      setRentals((prev) => [...prev, product as RentalProduct]);
    } else {
      setAddons((prev) => [...prev, product as Addon]);
    }
    setHighlightId(product.id);
    setMessage(`Produkt oprettet — husk at klikke "Gem ændringer" for at publicere.`);
    setError("");
  };

  useEffect(() => {
    if (!highlightId) return;
    const el = document.querySelector(`[data-product-id="${highlightId}"]`);
    if (el instanceof HTMLDetailsElement) {
      el.open = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setHighlightId(null);
  }, [highlightId, speakers, rentals, addons]);

  const removeSpeaker = (i: number) => {
    if (!confirm(`Slet højtaler "${speakers[i].da.name}"?`)) return;
    setSpeakers((prev) => prev.filter((_, idx) => idx !== i));
  };
  const removeRental = (i: number) => {
    if (!confirm(`Slet produkt "${rentals[i].name_da}"?`)) return;
    setRentals((prev) => prev.filter((_, idx) => idx !== i));
  };
  const removeAddon = (i: number) => {
    if (!confirm(`Slet tilvalg "${addons[i].da.label}"?`)) return;
    setAddons((prev) => prev.filter((_, idx) => idx !== i));
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/products?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speakers, addons, rentalProducts: rentals }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke gemme");
        if (res.status === 401) unauthorized();
        return;
      }
      setIsCustom(true);
      setMessage("Gemt! Ændringerne er live med det samme.");
    } catch {
      setError("Netværksfejl");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!confirm("Nulstil til standard-kataloget fra koden? Dine ændringer i admin slettes.")) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/products?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Kunne ikke nulstille");
        return;
      }
      setSpeakers(defaultSpeakers);
      setAddons(defaultAddons);
      setRentals(defaultRentals);
      setIsCustom(false);
      setMessage("Nulstillet til standard-kataloget.");
    } catch {
      setError("Netværksfejl");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Produkter" />;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <AdminNav
        actions={
          <>
            <span style={{ fontSize: "12px", color: "#888" }}>
              {isCustom ? "Redigeret katalog (KV)" : "Standardkatalog"}
            </span>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              style={{ padding: "8px 16px", fontSize: "14px", fontWeight: 600, background: "#0070f3", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
            >
              + Opret produkt
            </button>
            <button onClick={save} disabled={saving || loading} style={{ padding: "8px 20px", fontSize: "14px", fontWeight: 600, background: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
              {saving ? "Gemmer..." : "Gem ændringer"}
            </button>
          </>
        }
      />

      <CreateProductModal
        open={showCreate}
        existingIds={existingIds}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "24px" }}>
        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>{error}</div>}
        {message && <div style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>{message}</div>}
        {loading && <p style={{ textAlign: "center", color: "#888" }}>Henter produkter...</p>}

        <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
          Rediger pris, lager, overbooking, billeder og tekst pr. produkt. Billedstier er relative til sitet, fx{" "}
          <code>/images/product-party.webp</code>. Bemærk at <strong>lagertallet gemmes med det samme</strong> —
          resten venter på "Gem ændringer". Hele lageret på én side: <a href="/admin/lager" style={{ color: "#0070f3" }}>Lager</a>.
        </p>

        {/* Galleriet i tal. Overblikket hører til her, hvor produkterne er —
            ikke på en side ved siden af. Filtret skjuler kort, det fjerner dem
            ikke: listerne redigeres via deres index. */}
        <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "14px 18px", marginBottom: "20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
            <strong style={{ fontSize: "14px" }}>Galleri</strong>
            <span style={{ fontSize: "13px", color: "#555" }}>
              {galleriTal.klar} af {galleriTal.ialt} billeder på plads
              {galleriTal.ikkeSet > 0 && (
                <span style={{ color: "#b8860b", fontWeight: 600 }}> · {galleriTal.ikkeSet} ikke gennemgået</span>
              )}
            </span>
            <span style={{ flex: 1 }} />
            {([
              ["alle", "Alle produkter"],
              ["mangler", "Mangler billeder"],
              ["ikke_gennemgaaet", "Ikke gennemgået"],
            ] as const).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setGalleriFilter(v)}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #d0d0d0",
                  background: galleriFilter === v ? "#111" : "#fff",
                  color: galleriFilter === v ? "#fff" : "#111",
                  cursor: "pointer",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "#888", margin: "8px 0 0" }}>
            Fold et produkt ud for at lave, godkende eller fjerne billeder. Ét tryk er ét billede —
            der genereres aldrig noget af sig selv.
          </p>
        </div>

        <h2 style={{ fontSize: "17px", margin: "8px 0 12px" }}>Højtalere ({speakers.length})</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
          {speakers.map((sp, i) => (
            <details key={sp.id} data-product-id={sp.id} onToggle={foldet(sp.id)} style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "16px 20px", opacity: sp.hidden ? 0.55 : 1, display: skjulAfFilter(sp.id, sp.page, false) ? "none" : undefined }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <span>
                  {sp.da.name} <span style={{ color: "#888", fontWeight: 400 }}>({sp.id})</span>
                  {sp.hidden && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#dc3545" }}>SKJULT</span>}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {galleriMærke(sp.id, sp.page, false)}
                  <StockBadge value={lager.stock[sp.id]} overbook={lager.overbook[sp.id]} />
                  <span style={{ color: "#0070f3" }}>{sp.price} kr</span>
                  <PauseKnap pauset={!!sp.hidden} onToggle={() => updateSpeaker(i, { hidden: !sp.hidden })} />
                  <button type="button" onClick={(e) => { e.preventDefault(); removeSpeaker(i); }} style={{ fontSize: "12px", color: "#dc3545", background: "none", border: "none", cursor: "pointer" }}>Slet</button>
                </span>
              </summary>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "16px" }}>
                <Field label="Pris (kr)" type="number" value={sp.price} onChange={(v) => updateSpeaker(i, { price: Number(v) || 0 })} />
                <StockField
                  id={sp.id}
                  stock={lager.stock}
                  overbook={lager.overbook}
                  onSetStock={setStock}
                  onSetOverbook={setOverbook}
                  labelStyle={labelStyle}
                />
                <Field label="Vægt" value={sp.weight} onChange={(v) => updateSpeaker(i, { weight: v })} />
                <div>
                  <label style={labelStyle}>Strøm</label>
                  <select value={sp.power} onChange={(e) => updateSpeaker(i, { power: e.target.value as Speaker["power"] })} style={inputStyle}>
                    <option value="batteri">Batteri (mobil)</option>
                    <option value="kabel">Kabel (230V)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Størrelse</label>
                  <select value={sp.sizeClass} onChange={(e) => updateSpeaker(i, { sizeClass: e.target.value as Speaker["sizeClass"] })} style={inputStyle}>
                    <option value="lille">Lille</option>
                    <option value="stor">Stor</option>
                  </select>
                </div>
                <ImageField label="Produktbillede" value={sp.product} onChange={(v) => updateSpeaker(i, { product: v })} />
                <ImageField label="Stemningsbillede" value={sp.mood} onChange={(v) => updateSpeaker(i, { mood: v })} />
                <VideoField label="Produktvideo (instruktion/demo)" value={sp.video ?? ""} onChange={(v) => updateSpeaker(i, { video: v || undefined })} />
                <Field
                  label="YouTube-URL (producentvideo)"
                  value={sp.youtubeUrl ?? ""}
                  onChange={(v) => updateSpeaker(i, { youtubeUrl: v.trim() || undefined })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", alignSelf: "end", paddingBottom: "8px" }}>
                  <input type="checkbox" checked={!!sp.hidden} onChange={(e) => updateSpeaker(i, { hidden: e.target.checked })} />
                  Skjul på siden
                </label>
                <AllowedAddonsField allAddons={addons} value={sp.allowedAddons} onChange={(v) => updateSpeaker(i, { allowedAddons: v })} />
                <Field
                  label="Indhold (én linje pr. ting — hover på kort)"
                  textarea
                  value={(sp.contents ?? []).join("\n")}
                  onChange={(v) =>
                    updateSpeaker(i, {
                      contents: v
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
                {sp.page && (
                  <GalleryField productId={sp.id} productName={sp.da.name} erPakke={false} aktiv={aabne.has(sp.id)} manifest={galleri} onManifest={sætGalleri} />
                )}
              </div>
              {(["da", "en"] as const).map((loc) => (
                <div key={loc} style={{ marginTop: "16px", borderTop: "1px solid #eee", paddingTop: "12px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#444" }}>{loc === "da" ? "Dansk" : "Engelsk"}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                    <Field label="Navn" value={sp[loc].name} onChange={(v) => updateSpeakerText(i, loc, "name", v)} />
                    <Field label="Størrelse/model" value={sp[loc].size} onChange={(v) => updateSpeakerText(i, loc, "size", v)} />
                    <Field label="Kapacitet" value={sp[loc].capacity} onChange={(v) => updateSpeakerText(i, loc, "capacity", v)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                    <Field label="Beskrivelse" textarea value={sp[loc].desc} onChange={(v) => updateSpeakerText(i, loc, "desc", v)} />
                    <Field label="Ekstra info" textarea value={sp[loc].extra} onChange={(v) => updateSpeakerText(i, loc, "extra", v)} />
                  </div>
                </div>
              ))}
            </details>
          ))}
        </div>

        <h2 style={{ fontSize: "17px", margin: "8px 0 12px" }}>Lys, AV og øvrige produkter ({rentals.length})</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
          {rentals.map((r, i) => (
            <details key={r.id} data-product-id={r.id} onToggle={foldet(r.id)} style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "16px 20px", opacity: r.hidden ? 0.55 : 1, display: skjulAfFilter(r.id, r.page, !!r.bundle?.parts?.length) ? "none" : undefined }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <span>
                  {r.name_da} <span style={{ color: "#888", fontWeight: 400 }}>({r.id})</span>
                  {r.hidden && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#dc3545" }}>SKJULT</span>}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {galleriMærke(r.id, r.page, !!r.bundle?.parts?.length)}
                  {isBundleProduct(r) ? (
                    <span style={{ fontSize: "11px", color: "#aaa" }}>lager: fra delene</span>
                  ) : (
                    <StockBadge value={lager.stock[r.id]} overbook={lager.overbook[r.id]} />
                  )}
                  <span style={{ color: "#0070f3" }}>{r.price} kr</span>
                  <PauseKnap pauset={!!r.hidden} onToggle={() => updateRental(i, { hidden: !r.hidden })} />
                  <button type="button" onClick={(e) => { e.preventDefault(); removeRental(i); }} style={{ fontSize: "12px", color: "#dc3545", background: "none", border: "none", cursor: "pointer" }}>Slet</button>
                </span>
              </summary>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "16px" }}>
                <Field label="Pris (kr)" type="number" value={r.price} onChange={(v) => updateRental(i, { price: Number(v) || 0 })} />
                <StockField
                  id={r.id}
                  parts={isBundleProduct(r) ? r.bundle!.parts.map((p) => p.productId) : undefined}
                  stock={lager.stock}
                  overbook={lager.overbook}
                  onSetStock={setStock}
                  onSetOverbook={setOverbook}
                  labelStyle={labelStyle}
                />
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <select value={r.category} onChange={(e) => updateRental(i, { category: e.target.value as ProductCategory })} style={inputStyle}>
                    <option value="lys">Lys</option>
                    <option value="av">AV</option>
                    <option value="lyd">Lyd</option>
                  </select>
                </div>
                <ImageField label="Produktbillede" value={r.image} onChange={(v) => updateRental(i, { image: v })} />
                <VideoField label="Produktvideo (instruktion/demo)" value={r.video ?? ""} onChange={(v) => updateRental(i, { video: v || undefined })} />
                <Field
                  label="YouTube-URL (producentvideo)"
                  value={r.youtubeUrl ?? ""}
                  onChange={(v) => updateRental(i, { youtubeUrl: v.trim() || undefined })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", alignSelf: "end", paddingBottom: "8px" }}>
                  <input type="checkbox" checked={!!r.hidden} onChange={(e) => updateRental(i, { hidden: e.target.checked })} />
                  Skjul på siden
                </label>
                <AllowedAddonsField allAddons={addons} value={r.allowedAddons} onChange={(v) => updateRental(i, { allowedAddons: v })} />
                {r.page && (
                  <GalleryField
                    productId={r.id}
                    productName={r.name_da}
                    erPakke={!!r.bundle?.parts?.length}
                    aktiv={aabne.has(r.id)}
                    manifest={galleri}
                    onManifest={sætGalleri}
                  />
                )}
              </div>
              <div style={{ marginTop: "12px" }}>
                <Field
                  label="Indhold (én linje pr. ting — hover på kort)"
                  textarea
                  value={(r.contents ?? []).join("\n")}
                  onChange={(v) =>
                    updateRental(i, {
                      contents: v
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                <Field label="Navn (dansk)" value={r.name_da} onChange={(v) => updateRental(i, { name_da: v })} />
                <Field label="Navn (engelsk)" value={r.name_en} onChange={(v) => updateRental(i, { name_en: v })} />
                <Field label="Kort beskrivelse (dansk)" textarea value={r.desc_da ?? ""} onChange={(v) => updateRental(i, { desc_da: v })} />
                <Field label="Kort beskrivelse (engelsk)" textarea value={r.desc_en ?? ""} onChange={(v) => updateRental(i, { desc_en: v })} />
              </div>
            </details>
          ))}
        </div>

        <h2 style={{ fontSize: "17px", margin: "8px 0 12px" }}>Tilvalg / mersalg ({addons.length})</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {addons.map((a, i) => (
            <details key={a.id} data-product-id={a.id} onToggle={foldet(a.id)} style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", padding: "16px 20px", opacity: a.hidden ? 0.55 : 1, display: skjulAfFilter(a.id, a.page, false) ? "none" : undefined }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <span>
                  {a.da.label} <span style={{ color: "#888", fontWeight: 400 }}>({a.id})</span>
                  {a.hidden && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#dc3545" }}>SKJULT</span>}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {galleriMærke(a.id, a.page, false)}
                  {!isDeliveryAddon(a.id) && <StockBadge value={lager.stock[a.id]} overbook={lager.overbook[a.id]} />}
                  <span style={{ color: "#0070f3" }}>{a.price} kr</span>
                  <PauseKnap pauset={!!a.hidden} onToggle={() => updateAddon(i, { hidden: !a.hidden })} />
                  <button type="button" onClick={(e) => { e.preventDefault(); removeAddon(i); }} style={{ fontSize: "12px", color: "#dc3545", background: "none", border: "none", cursor: "pointer" }}>Slet</button>
                </span>
              </summary>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "16px" }}>
                <Field label="Pris (kr)" type="number" value={a.price} onChange={(v) => updateAddon(i, { price: Number(v) || 0 })} />
                {/* Kørsel står ikke på en hylde og har derfor intet lager */}
                {!isDeliveryAddon(a.id) && (
                  <StockField
                    id={a.id}
                    stock={lager.stock}
                    overbook={lager.overbook}
                    onSetStock={setStock}
                    onSetOverbook={setOverbook}
                    labelStyle={labelStyle}
                  />
                )}
                <ImageField label="Billede (tom = intet)" value={a.image ?? ""} onChange={(v) => updateAddon(i, { image: v || null })} />
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", alignSelf: "end", paddingBottom: "8px" }}>
                  <input type="checkbox" checked={!!a.hidden} onChange={(e) => updateAddon(i, { hidden: e.target.checked })} />
                  Skjul på siden
                </label>
                {a.page && (
                  <GalleryField productId={a.id} productName={a.da.label} erPakke={false} aktiv={aabne.has(a.id)} manifest={galleri} onManifest={sætGalleri} />
                )}
              </div>
              <div style={{ marginTop: "12px" }}>
                <Field
                  label="Indhold (én linje pr. ting — hover på kort)"
                  textarea
                  value={(a.contents ?? []).join("\n")}
                  onChange={(v) =>
                    updateAddon(i, {
                      contents: v
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              {(["da", "en"] as const).map((loc) => (
                <div key={loc} style={{ marginTop: "16px", borderTop: "1px solid #eee", paddingTop: "12px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: 700, color: "#444" }}>{loc === "da" ? "Dansk" : "Engelsk"}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                    <Field label="Navn" value={a[loc].label} onChange={(v) => updateAddonText(i, loc, "label", v)} />
                    <Field label="Beskrivelse" value={a[loc].desc} onChange={(v) => updateAddonText(i, loc, "desc", v)} />
                  </div>
                </div>
              ))}
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}
