"use client";

import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

/**
 * Udlevering på mobilen: gennemgå udstyret med kunden, og lad kunden skrive
 * under med fingeren på at have modtaget det. Underskriften gemmes på
 * bookingen (se functions/api/handover.ts) og trykkes med på lejesedlen.
 *
 * Siden åbnes fra ordreoverblikket: /admin/udlevering?id=booking_...
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { orderLines, deliveryInfo, type OrderBooking } from "@/lib/orderLines";
import { isPaid, hasDeposit, type PaidMethod } from "@/lib/bookingStage";
import {
  paymentStatus,
  paidAmount,
  outstanding,
  paymentsOf,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_META,
} from "@/lib/payments";

interface Booking extends OrderBooking {
  id: string;
  name: string;
  phone: string;
  email: string;
  period: string;
  days: number;
  pickup?: string;
  returnDate?: string;
  /** Hvornår kunden henter og afleverer — aftalt i checkout */
  pickupTime?: string;
  returnTime?: string;
  comment?: string;
  status: string;
  paid?: boolean;
  paidAmount?: number;
  paidManual?: boolean;
  paidMethod?: PaidMethod;
  payments?: import("@/lib/payments").Payment[];
  invoice?: import("@/lib/payments").Invoice | null;
  paymentChoice?: string;
  depositAmount?: number;
  depositState?: string;
  total: number;
  handover?: { signedAt: string; signerName?: string; note?: string; items?: string[] };
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f5f5f5",
  color: "#111",
  fontFamily: "system-ui, sans-serif",
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  padding: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  marginBottom: "14px",
};

const label: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "8px",
};

/* ───── Underskriftsfelt ───── */

function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const [empty, setEmpty] = useState(true);

  // Canvas skaleres til skærmens pixeltæthed, ellers bliver stregen grynet
  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111";
  }, []);

  useEffect(() => {
    setup();
    window.addEventListener("resize", setup);
    return () => window.removeEventListener("resize", setup);
  }, [setup]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!dirty.current) {
      dirty.current = true;
      setEmpty(false);
    }
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(dirty.current ? canvasRef.current?.toDataURL("image/png") ?? null : null);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dirty.current = false;
    setEmpty(true);
    onChange(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
        style={{
          width: "100%",
          height: "180px",
          border: `2px dashed ${empty ? "#ccc" : "#28a745"}`,
          borderRadius: "10px",
          background: "#fff",
          touchAction: "none",
          display: "block",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
        <span style={{ fontSize: "12px", color: empty ? "#aaa" : "#155724" }}>
          {empty ? "Skriv under med fingeren i feltet" : "Underskrift klar"}
        </span>
        <button type="button" onClick={clear} style={{ background: "none", border: "none", color: "#0070f3", fontSize: "13px", cursor: "pointer", padding: "6px 0" }}>
          Ryd
        </button>
      </div>
    </div>
  );
}

/* ───── Side ───── */

export default function UdleveringPage() {
  const { secret, user, ready, isLoggedIn, logout, unauthorized } = useAdminAuth();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [signatureImg, setSignatureImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [signerName, setSignerName] = useState("");
  const [note, setNote] = useState("");
  const [signature, setSignature] = useState<string | null>(null);

  /** Kø uden ?id= — dagens + kommende afhentninger der mangler underskrift */
  const [queue, setQueue] = useState<Booking[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);

  useEffect(() => {
    setBookingId(new URLSearchParams(window.location.search).get("id"));
  }, []);

  const loadQueue = useCallback(async () => {
    if (!secret || bookingId) return;
    setQueueLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke hente bookinger");
        if (res.status === 401) {
          logout();
        }
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      const list = ((data.bookings || []) as Booking[])
        .filter((b) => {
          const st = String(b.status || "");
          if (st.startsWith("annulleret") || st === "afhentet" || st === "afleveret") return false;
          if (b.handover?.signedAt) return false;
          const pickup = String(b.pickup || "").slice(0, 10);
          // Vis i dag + næste 7 dage (og evt. forsinkede afhentninger)
          if (!pickup) return true;
          const week = new Date();
          week.setDate(week.getDate() + 7);
          const to = week.toISOString().slice(0, 10);
          return pickup <= to;
        })
        .sort((a, b) => String(a.pickup || "").localeCompare(String(b.pickup || "")));
      console.log("[udlevering] kø", list.length, "af", (data.bookings || []).length);
      setQueue(list);
    } catch {
      setError("Netværksfejl");
    } finally {
      setQueueLoading(false);
    }
  }, [secret, bookingId]);

  const load = useCallback(async () => {
    if (!secret || !bookingId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/handover?secret=${encodeURIComponent(secret)}&id=${encodeURIComponent(bookingId)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke hente bookingen");
        if (res.status === 401) unauthorized();
        return;
      }
      setBooking(data.booking);
      setSignatureImg(data.signature ?? null);
      setSignerName(data.booking?.handover?.signerName || data.booking?.name || "");
      setNote(data.booking?.handover?.note || "");
      setSaved(!!data.booking?.handover);
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret, bookingId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadQueue(); }, [loadQueue]);

  const lines = booking ? orderLines(booking) : [];
  const delivery = booking ? deliveryInfo(booking) : null;
  const allChecked = lines.length > 0 && lines.every((l, i) => checked[`${i}-${l.label}`]);

  async function save() {
    if (!booking || !signature) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/handover?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          signature,
          signerName,
          note,
          items: lines
        .filter((l, i) => checked[`${i}-${l.label}`])
        .map((l) => (l.qty > 1 ? `${l.qty}× ${l.label}` : l.label)),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Kunne ikke gemme underskriften"); return; }
      setBooking(data.booking);
      setSignatureImg(signature);
      setSaved(true);
    } catch {
      setError("Netværksfejl");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Udlevering" />;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={page}>
      <AdminNav title="Udlevering" />

      <main style={{ maxWidth: "620px", margin: "0 auto", padding: "14px 12px 60px" }}>
        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" }}>{error}</div>}
        {loading && <p style={{ textAlign: "center", color: "#888" }}>Henter booking…</p>}

        {/* Ingen booking valgt → kø over afhentninger */}
        {!bookingId && !loading && (
          <>
            <div style={card}>
              <h1 style={{ margin: "0 0 6px", fontSize: "20px" }}>Udlevering</h1>
              <p style={{ margin: 0, fontSize: "13px", color: "#666", lineHeight: 1.45 }}>
                Vælg en afhentning, hak udstyret af sammen med kunden, og få underskrift.
                Du kan også åbne direkte fra en booking på <a href="/admin" style={{ color: "#0070f3" }}>ordreoverblikket</a>.
              </p>
            </div>
            {queueLoading && <p style={{ textAlign: "center", color: "#888" }}>Henter afhentninger…</p>}
            {!queueLoading && queue.length === 0 && (
              <div style={card}>
                <p style={{ margin: 0, color: "#888" }}>Ingen åbne afhentninger de næste 7 dage.</p>
              </div>
            )}
            {queue.map((b) => {
              const pickup = String(b.pickup || "").slice(0, 10);
              const isToday = pickup === today;
              const overdue = pickup && pickup < today;
              return (
                <a
                  key={b.id}
                  href={`/admin/udlevering?id=${encodeURIComponent(b.id)}`}
                  style={{
                    ...card,
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    borderLeft: `4px solid ${overdue ? "#c0392b" : isToday ? "#111" : "#ddd"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{b.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: overdue ? "#c0392b" : isToday ? "#111" : "#666", whiteSpace: "nowrap" }}>
                      {overdue ? "Forsinket" : isToday ? "I dag" : pickup || "—"}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>{b.period || pickup}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                    {b.phone} · {b.total} kr
                    {!isPaid(b) && <span style={{ color: "#856404", fontWeight: 700 }}> · mangler betaling</span>}
                  </div>
                </a>
              );
            })}
          </>
        )}

        {booking && (
          <>
            <div style={card}>
              <div style={{ fontSize: "20px", fontWeight: 800 }}>{booking.name}</div>
              <div style={{ fontSize: "14px", color: "#555", marginTop: "2px" }}>{booking.period}</div>
              {(booking.pickupTime || booking.returnTime) && (
                <div style={{ fontSize: "13px", color: "#555", marginTop: "2px" }}>
                  {booking.pickupTime ? `Henter: ${booking.pickupTime}` : ""}
                  {booking.pickupTime && booking.returnTime ? " · " : ""}
                  {booking.returnTime ? `Afleverer: ${booking.returnTime}` : ""}
                </div>
              )}
              <div style={{ marginTop: "8px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a href={`tel:${booking.phone}`} style={{ color: "#0070f3", fontSize: "14px" }}>{booking.phone}</a>
                <a href={`mailto:${booking.email}`} style={{ color: "#0070f3", fontSize: "14px" }}>{booking.email}</a>
              </div>
              <div style={{ marginTop: "10px", fontSize: "13px", fontWeight: 700, color: delivery ? "#0a7a43" : "#666" }}>
                {delivery
                  ? `🚚 ${delivery.out && delivery.back ? "Vi leverer og henter" : delivery.out ? "Vi leverer — kunden afleverer selv" : "Kunden henter — vi henter igen"}${delivery.address ? ` · ${delivery.address}` : ""}`
                  : "🏠 Kunden henter og afleverer selv"}
              </div>
              {booking.comment && (
                <div style={{ marginTop: "8px", fontSize: "13px", color: "#555" }}><strong>Kommentar:</strong> {booking.comment}</div>
              )}
            </div>

            {/* Betaling — skal være tydelig FØR udstyret ryger ud ad døren */}
            {(() => {
              const status = paymentStatus(booking);
              const meta = PAYMENT_STATUS_META[status];
              const rest = outstanding(booking);
              const methods = [...new Set(paymentsOf(booking).map((p) => PAYMENT_METHOD_LABELS[p.method] ?? p.method))];
              return (
                <div style={{ ...card, background: meta.bg, border: `1px solid ${meta.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: meta.text }}>
                        {status === "betalt"
                          ? `✓ BETALT${methods.length ? ` · ${methods.join(" + ")}` : ""}`
                          : status === "delvis"
                            ? `◑ MANGLER ${rest} KR`
                            : booking.invoice
                              ? `🧾 FAKTURERET — forfalder ${booking.invoice.dueDate}`
                              : "⏳ SKAL BETALES NU"}
                      </div>
                      <div style={{ fontSize: "12px", color: meta.text, opacity: 0.85 }}>
                        {status === "delvis" && `Betalt ${paidAmount(booking)} kr af ${booking.total} kr · `}
                        {hasDeposit(booking) ? `Depositum ${booking.depositAmount} kr · ${booking.depositState ?? "afventer"}` : "Intet depositum"}
                      </div>
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: meta.text, whiteSpace: "nowrap" }}>
                      {status === "betalt" ? booking.total : rest} kr
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Udstyrsgennemgang */}
            <div style={card}>
              <div style={label}>Udstyr — hak af sammen med kunden</div>
              {lines.length === 0 && <p style={{ color: "#aaa", margin: 0 }}>Ingen varelinjer på ordren</p>}
              {lines.map((l, i) => {
                const key = `${i}-${l.label}`;
                return (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 4px", borderBottom: "1px solid #f2f2f2", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={!!checked[key]}
                      onChange={(e) => setChecked((prev) => ({ ...prev, [key]: e.target.checked }))}
                      style={{ width: "22px", height: "22px" }}
                    />
                    <span style={{ fontSize: "15px", fontWeight: l.kind === "produkt" ? 600 : 400 }}>
                      {l.qty > 1 && <strong>{l.qty}× </strong>}
                      {l.label}
                    </span>
                  </label>
                );
              })}
              <p style={{ margin: "10px 0 0", fontSize: "12px", color: allChecked ? "#155724" : "#888" }}>
                {allChecked ? "Alt er hakket af" : "Hak af hvad der rent faktisk kommer med"}
              </p>
            </div>

            {/* Underskrift */}
            <div style={card}>
              <div style={label}>Kundens underskrift</div>
              <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#555", lineHeight: 1.5 }}>
                Ved at skrive under bekræfter lejer at have modtaget ovenstående udstyr i
                funktionsdygtig stand, og at hæfte for skade, bortkomst og forsinket retur
                efter lejevilkårene på lejhojtaler.dk/lejevilkaar.
              </p>

              {saved && signatureImg ? (
                <div>
                  <img src={signatureImg} alt="Kundens underskrift" style={{ width: "100%", maxHeight: "180px", objectFit: "contain", border: "1px solid #ddd", borderRadius: "10px", background: "#fff" }} />
                  <p style={{ margin: "10px 0 0", fontSize: "14px", color: "#155724", fontWeight: 700 }}>
                    ✓ Kvitteret af {booking.handover?.signerName || booking.name}
                    {booking.handover?.signedAt ? ` · ${new Date(booking.handover.signedAt).toLocaleString("da-DK")}` : ""}
                  </p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => { setSaved(false); setSignature(null); }}
                      style={{ padding: "12px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", color: "#111" }}
                    >
                      Skriv under igen
                    </button>
                    <a
                      href="/admin/lejeseddel"
                      onClick={() => sessionStorage.setItem("lejeseddel_booking", JSON.stringify(booking))}
                      style={{ padding: "12px 16px", fontSize: "14px", background: "#111", color: "#fff", borderRadius: "8px", textDecoration: "none" }}
                    >
                      Se lejeseddel
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <SignaturePad onChange={setSignature} />

                  <label style={{ display: "block", marginTop: "14px", fontSize: "12px", color: "#666" }}>
                    Underskrevet af
                    <input
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      style={{ width: "100%", padding: "12px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", marginTop: "4px", boxSizing: "border-box", color: "#111" }}
                    />
                  </label>

                  <label style={{ display: "block", marginTop: "10px", fontSize: "12px", color: "#666" }}>
                    Bemærkninger om stand (valgfrit)
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="F.eks. ridse på højtalergrill, mangler bæretaske…"
                      style={{ width: "100%", padding: "12px", fontSize: "15px", border: "1px solid #ddd", borderRadius: "8px", marginTop: "4px", boxSizing: "border-box", color: "#111", resize: "vertical" }}
                    />
                  </label>

                  <button
                    onClick={save}
                    disabled={!signature || saving}
                    style={{
                      width: "100%", marginTop: "14px", padding: "16px", fontSize: "16px", fontWeight: 700,
                      background: !signature || saving ? "#ccc" : "#111", color: "#fff", border: "none",
                      borderRadius: "10px", cursor: !signature || saving ? "not-allowed" : "pointer",
                    }}
                  >
                    {saving ? "Gemmer…" : "Gem kvittering og marker som udleveret"}
                  </button>
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#888", textAlign: "center" }}>
                    Bookingen sættes samtidig til &quot;Udleveret&quot;
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
