"use client";

/* ───── Ret en ordre ─────
 *
 * Aftalen ændrer sig efter bookingen: der skal en mikrofon mere med, kunden
 * skrev sin mail forkert, eller lyseffekten røg ud igen. Før kunne admin kun
 * skifte status og slette — resten foregik i hovedet på Frederik, og
 * bekræftelsen, lejesedlen og fakturaen blev ved med at vise den gamle ordre.
 *
 * Modalen viser hele tiden hvad ordren lander på. Beløbet regnes med samme
 * funktion som serveren bruger ved gem (src/lib/orderEdit.ts), så det tal der
 * står her, er det tal der havner i KV.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useProducts } from "@/lib/useProducts";
import { adminFetch } from "@/lib/useAdminAuth";
import {
  MAX_ORDER_QTY,
  orderItemsFromBooking,
  rebuildOrder,
  type CatalogEntry,
  type LegacyLine,
  type OrderItem,
} from "@/lib/orderEdit";

/** Det modalen har brug for at kende til ordren — resten rører den ikke */
export interface EditableBooking {
  id: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  comment?: string;
  deliveryAddress?: string;
  speaker?: string;
  speakerId?: string;
  speakerSize?: string;
  cartItems?: Array<{ name?: string; price?: number; productId?: string }>;
  addons?: string[];
  addonIds?: string[];
  total?: number;
  totalManual?: boolean;
  discount?: { code: string; pct: number } | null;
  status?: string;
}

const KIND_LABEL: Record<CatalogEntry["kind"], string> = {
  speaker: "højtaler",
  rental: "udstyr",
  addon: "tilvalg",
};

const felt: React.CSSProperties = {
  width: "100%", padding: "8px 10px", fontSize: "14px", border: "1px solid #ddd",
  borderRadius: "6px", background: "#fff", color: "#111", boxSizing: "border-box",
};

const label: React.CSSProperties = {
  fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em",
};

const knap: React.CSSProperties = {
  padding: "9px 16px", fontSize: "14px", fontWeight: 700, borderRadius: "8px", cursor: "pointer",
  border: "1px solid #ddd", background: "#fff", color: "#111",
};

export default function EditOrderModal(props: {
  booking: EditableBooking | null;
  secret: string;
  onClose: () => void;
  onUpdated: (booking: Record<string, unknown>) => void;
}) {
  if (!props.booking) return null;
  // key: en ny ordre skal starte med sine egne felter, ikke den forriges
  return <Editor {...props} booking={props.booking} key={props.booking.id} />;
}

function Editor({
  booking,
  secret,
  onClose,
  onUpdated,
}: {
  booking: EditableBooking;
  secret: string;
  onClose: () => void;
  onUpdated: (booking: Record<string, unknown>) => void;
}) {
  const catalog = useProducts();

  /** Katalogets varer med den slags-markering ordren bygges op efter */
  const entries = useMemo<CatalogEntry[]>(() => [
    ...catalog.speakers.map((s) => ({ id: s.id, name: s.da.name, price: s.price, kind: "speaker" as const, size: s.da.size })),
    ...catalog.rentalProducts.map((r) => ({ id: r.id, name: r.name_da, price: r.price, kind: "rental" as const })),
    ...catalog.addons.map((a) => ({ id: a.id, name: a.da.label, price: a.price, kind: "addon" as const })),
  ], [catalog]);

  const lookup = useMemo(() => {
    const map = new Map(entries.map((e) => [e.id, e]));
    return (id: string) => map.get(id);
  }, [entries]);

  const [items, setItems] = useState<OrderItem[]>([]);
  const [legacy, setLegacy] = useState<LegacyLine[]>([]);
  const [seeded, setSeeded] = useState(false);
  const [contact, setContact] = useState({
    name: booking.name ?? "",
    company: booking.company ?? "",
    email: booking.email ?? "",
    phone: booking.phone ?? "",
    deliveryAddress: booking.deliveryAddress ?? "",
    comment: booking.comment ?? "",
  });
  const [manuel, setManuel] = useState(!!booking.totalManual);
  const [manuelBeloeb, setManuelBeloeb] = useState(String(booking.total ?? 0));
  const [notify, setNotify] = useState(false);
  const [soeg, setSoeg] = useState("");
  const [gemmer, setGemmer] = useState(false);
  const [fejl, setFejl] = useState("");

  /*
   * Kataloget hentes asynkront. Bygger vi linjerne før det er hentet, bliver
   * hvert eneste produkt til en "kan ikke slås op"-linje — derfor venter vi
   * på at der overhovedet er priser at slå op i.
   */
  useEffect(() => {
    if (seeded || entries.length === 0) return;
    const start = orderItemsFromBooking(booking, lookup);
    setItems(start.items);
    setLegacy(start.legacy);
    setSeeded(true);
  }, [seeded, entries.length, booking, lookup]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const manualTotal = manuel ? Number(manuelBeloeb.replace(",", ".")) : null;
  const { order } = useMemo(
    () => rebuildOrder(items, lookup, {
      discountPct: booking.discount?.pct,
      legacy,
      manualTotal: manuel && Number.isFinite(manualTotal) ? manualTotal : null,
    }),
    [items, lookup, legacy, booking.discount, manuel, manualTotal],
  );

  const setQty = (id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_ORDER_QTY, qty) } : i)),
    );
  };

  const tilfoej = (id: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev.map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_ORDER_QTY, i.qty + 1) } : i));
      return [...prev, { id, qty: 1 }];
    });
    setSoeg("");
  };

  const traef = useMemo(() => {
    const q = soeg.trim().toLowerCase();
    if (!q) return [];
    return entries.filter((e) => e.name.toLowerCase().includes(q) || e.id.includes(q)).slice(0, 8);
  }, [soeg, entries]);

  const gem = async () => {
    if (!contact.name.trim()) {
      setFejl("Navnet må ikke være tomt");
      return;
    }
    if (items.length === 0 && legacy.length === 0) {
      setFejl("Ordren skal have mindst én varelinje");
      return;
    }
    if (manuel && !Number.isFinite(manualTotal)) {
      setFejl("Aftalt pris skal være et beløb i kr");
      return;
    }
    setGemmer(true);
    setFejl("");
    const result = await adminFetch("/api/bookings-update", secret, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: booking.id,
        action: "edit_order",
        contact,
        items,
        legacy: legacy.map((l) => l.label),
        manualTotal: manuel ? manualTotal : null,
        notify,
      }),
    });
    setGemmer(false);
    if ("error" in result) {
      setFejl(result.error);
      return;
    }
    if (!result.res.ok) {
      setFejl(String(result.data.error || "Kunne ikke gemme ændringerne"));
      return;
    }
    const mail = result.data.mail as { ok?: boolean; skipped?: string; error?: string } | undefined;
    if (notify && mail && !mail.ok) {
      alert(
        mail.skipped === "ingen_mail"
          ? "Ordren er rettet, men kunden har ingen mailadresse — beskeden blev ikke sendt."
          : "Ordren er rettet, men bekræftelsen kunne ikke sendes. Prøv igen fra kommunikationssporet.",
      );
    }
    onUpdated(result.data.booking as Record<string, unknown>);
    onClose();
  };

  const linjer = items.map((item) => ({ item, entry: lookup(item.id) }));
  const nyTotal = order.total;
  const gammelTotal = Number(booking.total ?? 0);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex",
        alignItems: "flex-start", justifyContent: "center", padding: "24px 12px", zIndex: 1000, overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "12px", padding: "16px", width: "100%", maxWidth: "560px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
          <strong style={{ fontSize: "15px" }}>Ret ordre — {booking.name || "kunde"}</strong>
          <button
            onClick={onClose}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "22px", lineHeight: 1 }}
            title="Luk (Esc)"
          >
            ×
          </button>
        </div>

        {/* ── Kunden ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          <Felt id="navn" tekst="Navn" value={contact.name} onChange={(v) => setContact((c) => ({ ...c, name: v }))} />
          <Felt id="firma" tekst="Firma" value={contact.company} onChange={(v) => setContact((c) => ({ ...c, company: v }))} />
          <Felt id="email" tekst="Email" type="email" value={contact.email} onChange={(v) => setContact((c) => ({ ...c, email: v }))} />
          <Felt id="telefon" tekst="Telefon" type="tel" value={contact.phone} onChange={(v) => setContact((c) => ({ ...c, phone: v }))} />
        </div>
        <div style={{ marginTop: "10px" }}>
          <Felt
            id="adresse"
            tekst="Leveringsadresse"
            value={contact.deliveryAddress}
            onChange={(v) => setContact((c) => ({ ...c, deliveryAddress: v }))}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <label htmlFor="kommentar" style={label}>Kommentar</label>
          <textarea
            id="kommentar"
            value={contact.comment}
            onChange={(e) => setContact((c) => ({ ...c, comment: e.target.value }))}
            rows={2}
            style={{ ...felt, marginTop: "4px", resize: "vertical" }}
          />
        </div>

        {/* ── Varerne ── */}
        <div style={{ ...label, marginTop: "16px", marginBottom: "6px" }}>Varer på ordren</div>
        {linjer.length === 0 && legacy.length === 0 && (
          <div style={{ fontSize: "13px", color: "#c0392b" }}>Ordren er tom — tilføj mindst én vare.</div>
        )}
        {linjer.map(({ item, entry }) => (
          <div
            key={item.id}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              {entry?.name ?? item.id}
              <span style={{ color: "#bbb", fontSize: "11px" }}> · {entry ? KIND_LABEL[entry.kind] : "ukendt"}</span>
            </span>
            <button aria-label={`Færre ${entry?.name ?? item.id}`} onClick={() => setQty(item.id, item.qty - 1)} style={{ ...knap, padding: "2px 9px", fontSize: "15px" }}>−</button>
            <span style={{ minWidth: "18px", textAlign: "center", fontWeight: 700 }}>{item.qty}</span>
            <button aria-label={`Flere ${entry?.name ?? item.id}`} onClick={() => setQty(item.id, item.qty + 1)} style={{ ...knap, padding: "2px 9px", fontSize: "15px" }}>+</button>
            <span style={{ minWidth: "64px", textAlign: "right", whiteSpace: "nowrap" }}>
              {entry ? `${entry.price * item.qty} kr` : "—"}
            </span>
            <button
              aria-label={`Fjern ${entry?.name ?? item.id}`}
              onClick={() => setQty(item.id, 0)}
              style={{ ...knap, padding: "2px 8px", color: "#c0392b", borderColor: "#f0c8c2" }}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Linjer uden produkt-id: gamle bookinger og produkter der er væk fra
            kataloget. De kan fjernes, men ikke tælles op — prisen findes kun
            på ordren selv. */}
        {legacy.map((l, i) => (
          <div key={`legacy-${i}`} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: "13px", color: "#777" }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              {l.label}
              <span style={{ color: "#bbb", fontSize: "11px" }}> · ikke i kataloget</span>
            </span>
            <span style={{ minWidth: "64px", textAlign: "right", whiteSpace: "nowrap" }}>
              {typeof l.price === "number" ? `${l.price} kr` : "—"}
            </span>
            <button
              aria-label={`Fjern ${l.label}`}
              onClick={() => setLegacy((prev) => prev.filter((_, n) => n !== i))}
              style={{ ...knap, padding: "2px 8px", color: "#c0392b", borderColor: "#f0c8c2" }}
            >
              ✕
            </button>
          </div>
        ))}

        {/* ── Tilføj ── */}
        <div style={{ marginTop: "12px" }}>
          <label htmlFor="tilfoej-vare" style={label}>Tilføj vare</label>
          <input
            id="tilfoej-vare"
            value={soeg}
            onChange={(e) => setSoeg(e.target.value)}
            placeholder="Søg i kataloget — fx mikrofon, røg, levering"
            style={{ ...felt, marginTop: "4px" }}
          />
          {traef.length > 0 && (
            <div style={{ border: "1px solid #eee", borderRadius: "8px", marginTop: "4px", overflow: "hidden" }}>
              {traef.map((e) => (
                <button
                  key={e.id}
                  onClick={() => tilfoej(e.id)}
                  style={{
                    display: "flex", width: "100%", gap: "8px", padding: "8px 10px", fontSize: "13px",
                    background: "#fff", border: "none", borderBottom: "1px solid #f4f4f4", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{ flex: 1 }}>
                    {e.name}
                    <span style={{ color: "#bbb", fontSize: "11px" }}> · {KIND_LABEL[e.kind]}</span>
                  </span>
                  <span style={{ whiteSpace: "nowrap", color: "#555" }}>{e.price} kr</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Beløbet ── */}
        <div style={{ marginTop: "14px", background: "#fafafa", border: "1px solid #eee", borderRadius: "10px", padding: "10px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#555" }}>
            <span>Varelinjer</span>
            <span>{order.subtotal} kr</span>
          </div>
          {booking.discount && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#0a7a43" }}>
              <span>Rabatkode {booking.discount.code}</span>
              <span>−{booking.discount.pct}%</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 800, marginTop: "4px" }}>
            <span>Ny total</span>
            <span>{nyTotal} kr</span>
          </div>
          {nyTotal !== gammelTotal && (
            <div style={{ fontSize: "11px", color: "#856404", marginTop: "2px" }}>
              Ordren står nu på {gammelTotal} kr — ændringen er {nyTotal - gammelTotal > 0 ? "+" : ""}{nyTotal - gammelTotal} kr
            </div>
          )}
          <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", fontSize: "12px" }}>
            <input type="checkbox" checked={manuel} onChange={(e) => setManuel(e.target.checked)} />
            Aftalt pris (overskriver katalogets sum)
          </label>
          {manuel && (
            <input
              aria-label="Aftalt pris i kr"
              value={manuelBeloeb}
              onChange={(e) => setManuelBeloeb(e.target.value)}
              inputMode="numeric"
              style={{ ...felt, marginTop: "6px", maxWidth: "140px" }}
            />
          )}
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", fontSize: "13px" }}>
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          Send den rettede aftale til kunden på mail
        </label>

        {fejl && (
          <div style={{ marginTop: "10px", background: "#fdecea", border: "1px solid #f5c6cb", borderRadius: "8px", padding: "8px 10px", fontSize: "13px", color: "#8a1c13" }}>
            {fejl}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "14px" }}>
          <button onClick={onClose} style={knap}>Annuller</button>
          <button
            onClick={gem}
            disabled={gemmer}
            style={{ ...knap, background: "#bfa000", borderColor: "#bfa000", color: "#000", opacity: gemmer ? 0.6 : 1 }}
          >
            {gemmer ? "Gemmer…" : "Gem ændringer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Felt({ id, tekst, value, onChange, type }: {
  id: string;
  tekst: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} style={label}>{tekst}</label>
      <input id={id} type={type ?? "text"} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...felt, marginTop: "4px" }} />
    </div>
  );
}
