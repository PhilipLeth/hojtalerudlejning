"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  type Stage,
  type DepositState,
  type PaidMethod,
  type OpenIssue,
  STAGE_META,
  EQUIPMENT_STEPS,
  CANCEL_STEPS,
  PAID_METHOD_LABELS,
  stepMeta,
  nextStep,
  startOfDay,
  pickupDateFromBooking,
  returnDateFromBooking,
  bookingStage,
  isActiveStage,
  isCancelled,
  isReturned,
  hasDeposit,
  isPaid,
  openIssues,
  weekendKey,
  formatWeekendLabel,
} from "@/lib/bookingStage";
import { orderLines, deliveryInfo, type OrderBooking } from "@/lib/orderLines";
import { useProducts } from "@/lib/useProducts";

interface Booking extends OrderBooking {
  id: string;
  speaker: string;
  speakerSize: string;
  period: string;
  /** Lejeperiodens start/slut som ISO — findes på alle bookinger fra kalenderen */
  pickup?: string;
  returnDate?: string;
  days: number;
  addons: string[];
  deliveryAddress?: string;
  total: number;
  name: string;
  email: string;
  phone: string;
  comment: string;
  status: string;
  company?: string;
  createdAt: string;
  updatedAt?: string;
  reviewMailSentAt?: string;
  communications?: Array<{ type: string; label: string; to?: string; sentAt: string; note?: string }>;
  /** Sat af Stripe-webhook ved gennemført online betaling */
  paid?: boolean;
  paidAmount?: number;
  paidAt?: string;
  /** Kundens valg ved booking: "online" eller "pickup" */
  paymentChoice?: string;
  /** Admin har kvitteret for MobilePay/kontant/bank */
  paidManual?: boolean;
  paidMethod?: PaidMethod;
  /** Depositum i kr — 0/undefined betyder at der ikke er taget depositum */
  depositAmount?: number;
  depositState?: DepositState;
  /** Udstyret er tjekket og fundet i orden ved retur */
  inspected?: boolean;
  /** Admin har set anmeldelsen komme ind */
  reviewDone?: boolean;
  /** Rabatkode valideret server-side ved booking */
  discount?: { code: string; pct: number } | null;
  /** Kundens underskrift ved udlevering — se /admin/udlevering */
  handover?: { signedAt: string; signerName?: string; note?: string; items?: string[] };
}

/** Felter de to spor kan skrive — skal matche FIELD_VALIDATORS i bookings-update.ts */
type EditableFields = {
  paidManual?: boolean;
  paidMethod?: PaidMethod | null;
  depositAmount?: number;
  depositState?: DepositState | null;
  inspected?: boolean;
  reviewDone?: boolean;
};

/** Betalingssporets valg — Stripe-betalinger er låst, resten sætter admin selv */
type PaymentChoice = "ikke_betalt" | PaidMethod;

const PAYMENT_CHOICES: Array<{ id: PaymentChoice; label: string; icon: string }> = [
  { id: "ikke_betalt", label: "Ikke betalt", icon: "⏳" },
  { id: "mobilepay", label: PAID_METHOD_LABELS.mobilepay, icon: "📱" },
  { id: "kontant", label: PAID_METHOD_LABELS.kontant, icon: "💵" },
  { id: "bank", label: PAID_METHOD_LABELS.bank, icon: "🏦" },
];

const DEPOSIT_CHOICES: Array<{ id: DepositState; label: string; icon: string }> = [
  { id: "afventer", label: "Ikke modtaget", icon: "⏳" },
  { id: "modtaget", label: "Modtaget", icon: "🔒" },
  { id: "tilbagebetalt", label: "Tilbagebetalt", icon: "↩️" },
];

const DEFAULT_DEPOSIT = 500;

type FilterPeriod = "alle" | "7dage" | "maaned" | "aktive";
type SortField = "dato" | "status" | "weekend" | "total" | "navn";

const navLink: React.CSSProperties = {
  padding: "8px 14px", fontSize: "13px", background: "#f0f0f0",
  border: "1px solid #ddd", borderRadius: "6px", textDecoration: "none", color: "#111",
  whiteSpace: "nowrap",
};

/** Dropdown der kan rammes med en tommelfinger — 16px undgår zoom på iOS */
const mobileSelect: React.CSSProperties = {
  flex: 1, minWidth: 0, padding: "10px 8px", fontSize: "16px",
  border: "1px solid #ddd", borderRadius: "8px", background: "#fff", color: "#111",
};

const ADMIN_PAGES = [
  { href: "/admin/lager", label: "Lager" },
  { href: "/admin/udsolgt", label: "Udsolgt" },
  { href: "/admin/udsalg", label: "Udsalg" },
  { href: "/admin/ads", label: "Ads" },
  { href: "/admin/regler", label: "Regler" },
  { href: "/admin/rabatkoder", label: "Rabatkoder" },
  { href: "/admin/produkter", label: "Produkter" },
  { href: "/admin/kanaler", label: "Kanaler" },
  { href: "/admin/nyhedsbrev", label: "Nyhedsbrev" },
  { href: "/admin/lejeseddel", label: "Lejeseddel" },
  { href: "/admin/indstillinger", label: "Indstillinger" },
];

/**
 * Telefon eller ej. Admin bruges i praksis stående i døren ved udlevering,
 * så under 900 px skifter listen fra tabel til kort — en tabel med 8 kolonner
 * kan ikke læses på en telefon.
 */
function useIsMobile(maxWidth = 900): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [maxWidth]);
  return mobile;
}

/** Ordrens linjer — samme liste i tabel, kort, på lejesedlen og ved udlevering */
function OrderSummary({ b, compact }: { b: Booking; compact?: boolean }) {
  const lines = orderLines(b);
  const delivery = deliveryInfo(b);
  return (
    <div>
      {lines.length === 0 ? (
        <span style={{ color: "#aaa" }}>Ingen varelinjer</span>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {lines.map((l, i) => (
            <li key={i} style={{ fontSize: compact ? "12px" : "13px", padding: "1px 0", color: l.kind === "produkt" ? "#111" : "#555" }}>
              <span style={{ color: "#bbb" }}>•</span>{" "}
              {l.qty > 1 && <strong>{l.qty}× </strong>}
              {l.label}
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: "4px", fontSize: "11px", fontWeight: 700, color: delivery ? "#0a7a43" : "#999" }}>
        {delivery
          ? `🚚 ${delivery.out && delivery.back ? "Vi leverer OG henter" : delivery.out ? "Vi leverer — kunden afleverer selv" : "Kunden henter — vi henter igen"}${delivery.address ? ` · ${delivery.address}` : " · ADRESSE MANGLER"}`
          : "🏠 Kunden henter og afleverer selv"}
      </div>
    </div>
  );
}

/**
 * Lejeperioden i en smal kolonne. Bookingens period-tekst ("Fre 21. aug →
 * Man 24. aug (3 dage)") fylder en halv skærm på én linje, så her brydes den
 * i afhentning, aflevering og antal dage.
 */
function PeriodCell({ b }: { b: Booking }) {
  const fmt = (d: Date) => d.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" });
  const hasDates = !!b.pickup || !!b.returnDate;
  const from = hasDates ? fmt(pickupDateFromBooking(b)) : (b.period || "").split("→")[0]?.trim();
  const to = hasDates ? fmt(returnDateFromBooking(b)) : (b.period || "").split("→")[1]?.replace(/\(.*\)/, "").trim();
  return (
    <div style={{ fontSize: "12px", lineHeight: 1.35 }}>
      <div style={{ fontWeight: 600 }}>{from || "—"}</div>
      <div style={{ color: "#666" }}>→ {to || "—"}</div>
      <div style={{ color: "#aaa", fontSize: "11px" }}>{b.days} {b.days === 1 ? "dag" : "dage"}</div>
    </div>
  );
}

/**
 * Priser pr. produkt-id fra det live katalog. Bookingen gemmer kun navne og
 * en samlet total, så linjepriserne slås op her — ellers kan man ikke se hvad
 * de enkelte dele af ordren kostede.
 */
function usePriceLookup(): (id?: string) => number | undefined {
  const catalog = useProducts();
  const prices = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of catalog.speakers) map.set(s.id, s.price);
    for (const a of catalog.addons) map.set(a.id, a.price);
    for (const r of catalog.rentalProducts) map.set(r.id, r.price);
    return map;
  }, [catalog]);
  return useCallback((id?: string) => (id ? prices.get(id) : undefined), [prices]);
}

/**
 * Ordren foldet ud: hver linje med pris, kørslen for sig, og summen holdt op
 * mod ordrens total så en rabat eller en manuel justering er til at se.
 */
function OrderBreakdown({ b, priceOf }: { b: Booking; priceOf: (id?: string) => number | undefined }) {
  const lines = orderLines(b);
  const delivery = deliveryInfo(b);
  const deliveryPrice = priceOf(delivery?.id ?? undefined);

  // Prisen er pr. stk. — linjens beløb er antal × stykpris
  const priced = lines.map((l) => {
    const unit = l.price ?? priceOf(l.productId);
    return { ...l, unit, kr: typeof unit === "number" ? unit * l.qty : undefined };
  });
  const known = [...priced.map((l) => l.kr), deliveryPrice].filter((v): v is number => typeof v === "number");
  const sum = known.reduce((a, v) => a + v, 0);
  const allKnown = priced.every((l) => typeof l.kr === "number") && (!delivery || typeof deliveryPrice === "number");
  const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: "12px", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: "13px" };

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "10px", padding: "12px 14px" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
        Ordrelinjer
      </div>

      {priced.length === 0 && <div style={{ color: "#aaa", fontSize: "13px" }}>Ingen varelinjer registreret</div>}

      {priced.map((l, i) => (
        <div key={i} style={row}>
          <span style={{ fontWeight: l.kind === "produkt" ? 600 : 400 }}>
            {l.qty > 1 ? `${l.qty}× ` : ""}
            {l.label}
            <span style={{ color: "#bbb", fontSize: "11px" }}>
              {" "}
              · {l.kind === "produkt" ? "hovedprodukt" : l.kind === "kurv" ? "ekstra produkt" : "tilvalg"}
            </span>
          </span>
          <span style={{ whiteSpace: "nowrap", color: typeof l.kr === "number" ? "#111" : "#bbb" }}>
            {typeof l.kr === "number" ? `${l.kr} kr` : "—"}
            {l.qty > 1 && typeof l.unit === "number" && (
              <span style={{ color: "#aaa", fontSize: "11px" }}> ({l.qty} × {l.unit})</span>
            )}
          </span>
        </div>
      ))}

      <div style={{ ...row, color: delivery ? "#0a7a43" : "#888" }}>
        <span>
          {delivery
            ? `🚚 ${delivery.out && delivery.back ? "Levering + afhentning" : delivery.out ? "Levering (vi kører ud)" : "Afhentning (vi henter igen)"}`
            : "🏠 Kunden henter og afleverer selv"}
          {delivery && (
            <span style={{ color: delivery.address ? "#888" : "#c0392b", fontSize: "11px" }}>
              {" "}
              · {delivery.address || "ADRESSE MANGLER"}
            </span>
          )}
        </span>
        <span style={{ whiteSpace: "nowrap" }}>{typeof deliveryPrice === "number" ? `${deliveryPrice} kr` : delivery ? "—" : "0 kr"}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", paddingTop: "10px", fontSize: "15px", fontWeight: 800 }}>
        <span>Total på ordren</span>
        <span>{b.total} kr</span>
      </div>

      {allKnown && sum !== b.total && (
        <div style={{ marginTop: "4px", fontSize: "11px", color: "#856404" }}>
          Linjerne summer til {sum} kr — forskel på {sum - b.total} kr
          {b.discount ? ` (rabatkode ${b.discount.code} −${b.discount.pct}%)` : " (rabat eller manuel justering)"}
        </div>
      )}
      {!allKnown && (
        <div style={{ marginTop: "4px", fontSize: "11px", color: "#aaa" }}>
          Linjer uden pris er produkter der er fjernet eller omdøbt i kataloget siden bookingen.
        </div>
      )}
    </div>
  );
}

/** Betalingsstatus i klartekst — skal kunne ses på en armslængde på mobilen */
function PaymentBanner({ b }: { b: Booking }) {
  const paid = isPaid(b);
  const method = b.paid ? "Betalt online (Stripe)" : b.paidMethod ? PAID_METHOD_LABELS[b.paidMethod] : null;
  const deposit = hasDeposit(b)
    ? `Depositum ${b.depositAmount} kr · ${DEPOSIT_CHOICES.find((d) => d.id === (b.depositState ?? "afventer"))!.label}`
    : "Intet depositum";
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
        background: paid ? "#d4edda" : "#fff3cd",
        border: `1px solid ${paid ? "#28a745" : "#ffc107"}`,
        borderRadius: "8px", padding: "10px 12px",
      }}
    >
      <div>
        <div style={{ fontSize: "14px", fontWeight: 800, color: paid ? "#155724" : "#856404" }}>
          {paid ? `✓ BETALT${method ? ` · ${method}` : ""}` : "⏳ IKKE BETALT"}
        </div>
        <div style={{ fontSize: "11px", color: paid ? "#2f6f45" : "#8a6d1f" }}>
          {deposit}
          {!paid && b.paymentChoice === "online" && " · kunden valgte online betaling"}
        </div>
      </div>
      <div style={{ fontSize: "20px", fontWeight: 800, whiteSpace: "nowrap", color: paid ? "#155724" : "#856404" }}>
        {b.total} kr
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [inputSecret, setInputSecret] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("aktive");
  const [filterStatus, setFilterStatus] = useState<string>("alle");
  const [sortBy, setSortBy] = useState<SortField>("status");
  const [expanded, setExpanded] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const stored = localStorage.getItem("admin_secret");
    if (stored) setSecret(stored);
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke hente bookinger");
        if (res.status === 401) { localStorage.removeItem("admin_secret"); setSecret(""); }
        return;
      }
      setBookings(data.bookings || []);
    } catch { setError("Netværksfejl"); }
    finally { setLoading(false); }
  }, [secret]);

  useEffect(() => {
    if (secret) {
      fetchBookings();
      const interval = setInterval(fetchBookings, 30000);
      return () => clearInterval(interval);
    }
  }, [secret, fetchBookings]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/bookings-update?secret=${encodeURIComponent(secret)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
      else { const data = await res.json(); alert(data.error || "Opdatering fejlede"); }
    } catch { alert("Netværksfejl"); }
    finally { setUpdating(null); }
  };

  const deleteBooking = async (id: string, name: string) => {
    // Dobbelt-tjek mod fejlklik: bekræft + skriv SLET
    if (!confirm(`Slet bookingen fra "${name}"?\n\nDette fjerner den permanent og kan ikke fortrydes.`)) return;
    const typed = prompt(`Skriv SLET for at bekræfte sletning af "${name}":`);
    if (typed?.trim().toUpperCase() !== "SLET") return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/bookings-update?secret=${encodeURIComponent(secret)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });
      if (res.ok) setBookings((prev) => prev.filter((b) => b.id !== id));
      else { const data = await res.json(); alert(data.error || "Sletning fejlede"); }
    } catch { alert("Netværksfejl"); }
    finally { setUpdating(null); }
  };

  /**
   * Sætter et eller flere felter på en booking. Optimistisk opdatering med
   * rullback, så et fejlet kald ikke efterlader et hak der ser gemt ud.
   */
  const setFields = async (id: string, fields: EditableFields) => {
    let before: Booking | undefined;
    setBookings((prev) => prev.map((b) => {
      if (b.id !== id) return b;
      before = b;
      return { ...b, ...fields } as Booking;
    }));
    try {
      const res = await fetch(`/api/bookings-update?secret=${encodeURIComponent(secret)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "set_fields", fields }),
      });
      if (!res.ok) {
        if (before) setBookings((prev) => prev.map((b) => (b.id === id ? before! : b)));
        const data = await res.json();
        alert(data.error || "Kunne ikke gemme");
      }
    } catch {
      if (before) setBookings((prev) => prev.map((b) => (b.id === id ? before! : b)));
      alert("Netværksfejl");
    }
  };

  const today = useMemo(() => startOfDay(new Date()), []);

  const filtered = useMemo(() => {
    const in7 = new Date(today); in7.setDate(today.getDate() + 7);
    const inMonth = new Date(today); inMonth.setDate(today.getDate() + 30);

    return bookings
      .filter((b) => {
        const stage = bookingStage(b, today);
        // "Aktive" = alt uafsluttet, uanset dato: kommende, igangværende og
        // sager der venter på retur eller betaling. Først når udstyret er
        // registreret retur OG betalingen er modtaget, falder sagen ud.
        if (filterPeriod === "aktive") return isActiveStage(stage);
        if (filterPeriod === "7dage" || filterPeriod === "maaned") {
          if (stage === "annulleret") return false;
          const horizon = filterPeriod === "7dage" ? in7 : inMonth;
          // Overlapper vinduet — igangværende leje tæller med
          return returnDateFromBooking(b) >= today && pickupDateFromBooking(b) <= horizon;
        }
        return true;
      })
      .filter((b) => filterStatus === "alle" || b.status === filterStatus)
      .sort((a, b) => {
        const pa = pickupDateFromBooking(a).getTime();
        const pb = pickupDateFromBooking(b).getTime();
        if (sortBy === "status") {
          const oa = STAGE_META[bookingStage(a, today)].order;
          const ob = STAGE_META[bookingStage(b, today)].order;
          return oa !== ob ? oa - ob : pa - pb;
        }
        if (sortBy === "weekend") {
          const c = weekendKey(a).localeCompare(weekendKey(b));
          return c !== 0 ? c : pa - pb;
        }
        if (sortBy === "dato") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === "total") return b.total - a.total;
        if (sortBy === "navn") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [bookings, filterPeriod, filterStatus, sortBy, today]);

  // Group filtered bookings — efter status (uafsluttede sager først) eller efter weekend
  const grouped = useMemo(() => {
    if (sortBy !== "weekend" && sortBy !== "status") return null;
    const map = new Map<string, Booking[]>();
    for (const b of filtered) {
      const key = sortBy === "weekend" ? weekendKey(b) : bookingStage(b, today);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return [...map.entries()].map(([key, bs]) => {
      if (sortBy === "weekend") {
        return { key, badge: "Weekend", label: formatWeekendLabel(key), hint: "", tone: { bg: "#111", text: "#fff" }, bookings: bs };
      }
      const meta = STAGE_META[key as Stage];
      return { key, badge: meta.label, label: "", hint: meta.hint, tone: { bg: meta.border, text: "#fff" }, bookings: bs };
    });
  }, [filtered, sortBy, today]);

  const openCount = useMemo(
    () => bookings.filter((b) => bookingStage(b, today) === "afslut").length,
    [bookings, today],
  );

  if (!secret) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
        <form onSubmit={(e) => { e.preventDefault(); if (inputSecret.trim()) { localStorage.setItem("admin_secret", inputSecret.trim()); setSecret(inputSecret.trim()); setInputSecret(""); } }} style={{ background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)", maxWidth: "400px", width: "100%" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "24px" }}>Admin</h1>
          <p style={{ margin: "0 0 24px", color: "#666" }}>Indtast adgangskode</p>
          <input type="password" value={inputSecret} onChange={(e) => setInputSecret(e.target.value)} placeholder="Adgangskode" style={{ width: "100%", padding: "12px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "16px", boxSizing: "border-box", color: "#111" }} />
          <button type="submit" style={{ width: "100%", padding: "12px", fontSize: "16px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Log ind</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: isMobile ? "10px 12px" : "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", position: "sticky", top: 0, zIndex: 5 }}>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Bookinger</h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", maxWidth: "100%" }}>
          {isMobile ? (
            // Ti links i en scrollende stribe er ubrugelige med tommelfingeren
            <select
              value=""
              onChange={(e) => { if (e.target.value) window.location.href = e.target.value; }}
              style={{ ...navLink, appearance: "auto", padding: "9px 10px", fontSize: "14px" }}
            >
              <option value="">Menu…</option>
              {ADMIN_PAGES.map((p) => (
                <option key={p.href} value={p.href}>{p.label}</option>
              ))}
            </select>
          ) : (
            ADMIN_PAGES.map((p) => (
              <a key={p.href} href={p.href} style={navLink}>{p.label}</a>
            ))
          )}
          <button onClick={fetchBookings} disabled={loading} style={{ ...navLink, cursor: "pointer", border: "none" as React.CSSProperties["border"] }}>
            {loading ? "Henter..." : "↺ Opdater"}
          </button>
          <button onClick={() => { localStorage.removeItem("admin_secret"); setSecret(""); setBookings([]); }} style={{ fontSize: "13px", background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>Log ud</button>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "12px 10px 40px" : "20px 16px" }}>
        {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" }}>{error}</div>}

        {/* Filtre — chips på skærm, tre dropdowns på telefon.
            Elleve chips fyldte den halve mobilskærm før man nåede en booking. */}
        {isMobile ? (
          <div style={{ background: "#fff", borderRadius: "10px", padding: "10px", marginBottom: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                style={mobileSelect}
              >
                <option value="aktive">Aktive</option>
                <option value="7dage">7 dage</option>
                <option value="maaned">30 dage</option>
                <option value="alle">Alle</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={mobileSelect}
              >
                <option value="alle">Alle statusser</option>
                {[...EQUIPMENT_STEPS, ...CANCEL_STEPS].map((st) => (
                  <option key={st.id} value={st.id}>{st.icon} {st.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                title="Sortering"
                style={mobileSelect}
              >
                <option value="status">↕ Status</option>
                <option value="weekend">↕ Weekend</option>
                <option value="dato">↕ Oprettet</option>
                <option value="total">↕ Beløb</option>
                <option value="navn">↕ Navn</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", fontSize: "12px", color: "#888" }}>
              <span>{filtered.length} booking{filtered.length !== 1 ? "er" : ""}</span>
              {openCount > 0 && (
                <button
                  onClick={() => { setFilterPeriod("aktive"); setSortBy("status"); }}
                  style={{ background: STAGE_META.afslut.bg, color: STAGE_META.afslut.text, border: `1px solid ${STAGE_META.afslut.border}`, borderRadius: "20px", padding: "4px 12px", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
                >
                  {openCount} skal afsluttes
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {(["aktive", "7dage", "maaned", "alle"] as FilterPeriod[]).map((p) => (
                <button key={p} onClick={() => setFilterPeriod(p)} title={p === "aktive" ? "Kommende, igangværende og sager der mangler retur eller betaling" : undefined} style={{ padding: "5px 12px", fontSize: "12px", fontWeight: filterPeriod === p ? 700 : 400, background: filterPeriod === p ? "#111" : "#f0f0f0", color: filterPeriod === p ? "#fff" : "#555", border: "none", borderRadius: "20px", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {{ aktive: "Aktive", "7dage": "7 dage", maaned: "30 dage", alle: "Alle" }[p]}
                </button>
              ))}
            </div>
            <div style={{ width: "1px", height: "20px", background: "#eee" }} />
            <div style={{ display: "flex", gap: "4px", overflowX: "auto", maxWidth: "100%" }}>
              {["alle", ...EQUIPMENT_STEPS.map((s) => s.id), ...CANCEL_STEPS.map((s) => s.id)].map((s) => {
                const meta = stepMeta(s);
                const active = filterStatus === s;
                return (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{ whiteSpace: "nowrap", padding: "5px 12px", fontSize: "12px", fontWeight: active ? 700 : 400, background: active ? (s === "alle" ? "#111" : meta.bg) : "#f0f0f0", color: active ? (s === "alle" ? "#fff" : meta.text) : "#555", border: active && s !== "alle" ? `1px solid ${meta.border}` : "1px solid transparent", borderRadius: "20px", cursor: "pointer" }}>
                    {s === "alle" ? "Alle statusser" : `${meta.icon} ${meta.label}`}
                  </button>
                );
              })}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#888" }}>
              Sortér:
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)} style={{ fontSize: "12px", padding: "4px 8px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff" }}>
                <option value="status">Status</option>
                <option value="weekend">Weekend</option>
                <option value="dato">Oprettelsesdato</option>
                <option value="total">Beløb</option>
                <option value="navn">Navn</option>
              </select>
              <span style={{ color: "#bbb" }}>{filtered.length} booking{filtered.length !== 1 ? "er" : ""}</span>
              {openCount > 0 && (
                <span title="Bookinger der mangler registrering af retur og/eller betaling" style={{ background: STAGE_META.afslut.bg, color: STAGE_META.afslut.text, border: `1px solid ${STAGE_META.afslut.border}`, borderRadius: "20px", padding: "2px 10px", fontWeight: 700 }}>
                  {openCount} skal afsluttes
                </span>
              )}
            </div>
          </div>
        )}

        {/* Table or weekend groups */}
        {filtered.length === 0 && !loading && (
          <p style={{ textAlign: "center", color: "#aaa", marginTop: "60px" }}>Ingen bookinger matcher filteret</p>
        )}

        {grouped ? (
          grouped.map(({ key, badge, label, hint, tone, bookings: group }) => (
            <div key={key} style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                <span style={{ background: tone.bg, color: tone.text, borderRadius: "6px", padding: "2px 10px", fontSize: "12px", fontWeight: 700 }}>{badge}</span>
                {label && <span style={{ fontWeight: 600, fontSize: "14px" }}>{label}</span>}
                <span style={{ color: "#aaa", fontSize: "12px" }}>{group.length} booking{group.length !== 1 ? "er" : ""}</span>
                {hint && <span style={{ color: "#bbb", fontSize: "12px" }}>· {hint}</span>}
              </div>
              <BookingList mobile={isMobile} bookings={group} expanded={expanded} setExpanded={setExpanded} updateStatus={updateStatus} deleteBooking={deleteBooking} setFields={setFields} updating={updating} today={today} />
            </div>
          ))
        ) : (
          <BookingList mobile={isMobile} bookings={filtered} expanded={expanded} setExpanded={setExpanded} updateStatus={updateStatus} deleteBooking={deleteBooking} setFields={setFields} updating={updating} today={today} />
        )}
      </main>
    </div>
  );
}

const trackSelect: React.CSSProperties = {
  padding: "3px 6px", fontSize: "11px", fontWeight: 700, borderRadius: "20px", cursor: "pointer", maxWidth: "150px",
};

function IssueList({ issues }: { issues: OpenIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <>
      {issues.map((issue) => (
        <div key={issue.label} style={{ fontSize: "10px", fontWeight: 700, color: "#c0392b" }}>
          ⚠ {issue.label}
        </div>
      ))}
    </>
  );
}

/**
 * Udstyrssporet: hvor er tingene henne. Dropdownen er hele sandheden om
 * ordrens gang — også annullering, så der kun er ét sted at ændre den.
 */
function EquipmentTrack({ b, issues, updateStatus, setFields, busy }: {
  b: Booking;
  issues: OpenIssue[];
  updateStatus: (id: string, status: string) => void;
  setFields: (id: string, fields: EditableFields) => void;
  busy: boolean;
}) {
  const meta = stepMeta(b.status);
  const next = isCancelled(b) ? null : nextStep(b.status);
  // Testet/inspiceret giver først mening fra det øjeblik udstyret er pakket
  const canInspect = ["pakket", "afhentet", "afleveret"].includes(b.status);

  const onSelect = (value: string) => {
    if (value === b.status) return;
    if (value.startsWith("annulleret") && !confirm(`Annullér bookingen fra "${b.name}"?\n\nDatoerne frigives i kalenderen.`)) return;
    updateStatus(b.id, value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={b.status}
          onChange={(e) => onSelect(e.target.value)}
          disabled={busy}
          title="Hvor er udstyret i forløbet"
          style={{ ...trackSelect, background: meta.bg, color: meta.text, border: `1px solid ${meta.border}`, opacity: busy ? 0.6 : 1 }}
        >
          {EQUIPMENT_STEPS.map((s) => (
            <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
          ))}
          <optgroup label="Annullér">
            {CANCEL_STEPS.map((s) => (
              <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
            ))}
          </optgroup>
        </select>
        {next && (
          <button
            onClick={() => updateStatus(b.id, next.id)}
            disabled={busy}
            title={`Marker som ${next.label}`}
            style={{ padding: "3px 9px", fontSize: "11px", fontWeight: 600, background: next.border, color: "#fff", border: "none", borderRadius: "20px", cursor: "pointer", whiteSpace: "nowrap", opacity: busy ? 0.6 : 1 }}
          >
            {busy ? "…" : `→ ${next.label}`}
          </button>
        )}
      </div>
      {/* Returneret er det eneste statusskift der sender mail — sig det, så det
          ikke kommer bag på nogen at kunden får en anmeldelsesmail */}
      {next?.id === "afleveret" && !b.reviewMailSentAt && (
        <span style={{ fontSize: "10px", color: "#888" }}>↳ sender anmeldelsesmail til kunden</span>
      )}
      {canInspect && (
        <label
          title="Udstyret er testet/inspiceret og fundet i orden"
          style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: b.inspected ? "#155724" : "#888", cursor: "pointer" }}
        >
          <input type="checkbox" checked={!!b.inspected} onChange={(e) => setFields(b.id, { inspected: e.target.checked })} />
          Testet/inspiceret
        </label>
      )}
      <IssueList issues={issues} />
    </div>
  );
}

/** Beløbsfelt der først skriver ved blur — ikke ét kald pr. tastetryk */
function DepositAmount({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);
  const commit = () => {
    const n = Math.max(0, Math.round(Number(draft) || 0));
    if (n !== value) onCommit(n);
    setDraft(String(n));
  };
  return (
    <input
      type="number"
      min={0}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      style={{ width: "58px", padding: "2px 4px", fontSize: "11px", border: "1px solid #ddd", borderRadius: "4px", color: "#111" }}
    />
  );
}

/**
 * Betalingssporet: lejen og et eventuelt depositum, adskilt fra udstyret.
 * Stripe-betalinger er låst — dem har webhooken bekræftet.
 */
function PaymentTrack({ b, issues, setFields }: {
  b: Booking;
  issues: OpenIssue[];
  setFields: (id: string, fields: EditableFields) => void;
}) {
  const choice: PaymentChoice = b.paidManual ? (b.paidMethod ?? "kontant") : "ikke_betalt";
  const paidTone = isPaid(b)
    ? { bg: "#d4edda", text: "#155724", border: "#28a745" }
    : { bg: "#fff3cd", text: "#856404", border: "#ffc107" };

  const onSelect = (value: PaymentChoice) => {
    if (value === "ikke_betalt") setFields(b.id, { paidManual: false, paidMethod: null });
    else setFields(b.id, { paidManual: true, paidMethod: value });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
      {b.paid ? (
        <span title={b.paidAt ? `Betalt ${new Date(b.paidAt).toLocaleString("da-DK")}` : "Bekræftet af Stripe"} style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: "#d1f7e3", color: "#0a7a43", border: "1px solid #28a745", whiteSpace: "nowrap" }}>
          💳 Betalt online{b.paidAmount ? ` · ${Math.round(b.paidAmount / 100)} kr` : ""}
        </span>
      ) : (
        <select
          value={choice}
          onChange={(e) => onSelect(e.target.value as PaymentChoice)}
          title={b.paymentChoice === "online" ? "Kunden valgte online betaling — den er ikke gennemført endnu" : "Sådan er lejen betalt"}
          style={{ ...trackSelect, background: paidTone.bg, color: paidTone.text, border: `1px solid ${paidTone.border}` }}
        >
          {PAYMENT_CHOICES.map((p) => (
            <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
          ))}
        </select>
      )}

      {hasDeposit(b) ? (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#666" }}>
          <span title="Depositum">🔒</span>
          <DepositAmount value={b.depositAmount ?? 0} onCommit={(v) => setFields(b.id, v > 0 ? { depositAmount: v } : { depositAmount: 0, depositState: null })} />
          <span>kr</span>
          <select
            value={b.depositState ?? "afventer"}
            onChange={(e) => setFields(b.id, { depositState: e.target.value as DepositState })}
            title="Depositummets tilstand"
            style={{ fontSize: "11px", padding: "2px 4px", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", color: "#111", cursor: "pointer" }}
          >
            {DEPOSIT_CHOICES.map((d) => (
              <option key={d.id} value={d.id}>{d.icon} {d.label}</option>
            ))}
          </select>
          <button
            onClick={() => setFields(b.id, { depositAmount: 0, depositState: null })}
            title="Intet depositum på denne booking"
            style={{ background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: "13px", lineHeight: 1, padding: "0 2px" }}
          >
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={() => setFields(b.id, { depositAmount: DEFAULT_DEPOSIT, depositState: "afventer" })}
          title="Tilføj depositum på denne booking"
          style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "11px", padding: 0 }}
        >
          + Depositum
        </button>
      )}
      <IssueList issues={issues} />
    </div>
  );
}

interface ListProps {
  bookings: Booking[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  updateStatus: (id: string, status: string) => void;
  deleteBooking: (id: string, name: string) => void;
  setFields: (id: string, fields: EditableFields) => void;
  updating: string | null;
  today: Date;
}

/** Tabel på skærm, kort på telefon — samme data, to layouts */
function BookingList({ mobile, ...props }: ListProps & { mobile: boolean }) {
  return mobile ? <BookingCards {...props} /> : <BookingTable {...props} />;
}

/** Print, udlevering med underskrift og sletning — samme knapper begge steder */
function RowActions({ b, busy, deleteBooking, big }: {
  b: Booking;
  busy: boolean;
  deleteBooking: (id: string, name: string) => void;
  big?: boolean;
}) {
  const btn: React.CSSProperties = {
    padding: big ? "10px 14px" : "4px 10px",
    fontSize: big ? "13px" : "11px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
    textDecoration: "none",
    cursor: "pointer",
  };
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: big ? "wrap" : "nowrap" }}>
      <a
        href={`/admin/udlevering?id=${encodeURIComponent(b.id)}`}
        title="Gennemgå udstyret med kunden og få underskrift på mobilen"
        style={{ ...btn, background: b.handover ? "#d4edda" : "#111", color: b.handover ? "#155724" : "#fff", border: `1px solid ${b.handover ? "#28a745" : "#111"}`, fontWeight: 600 }}
      >
        {b.handover ? "✍️ Underskrevet" : big ? "✍️ Udlever + underskrift" : "✍️ Underskrift"}
      </a>
      <a
        href="/admin/lejeseddel"
        onClick={() => sessionStorage.setItem("lejeseddel_booking", JSON.stringify(b))}
        style={{ ...btn, background: "#f0f0f0", color: "#555", border: "1px solid #ddd" }}
      >
        Print
      </a>
      <button
        onClick={() => deleteBooking(b.id, b.name)}
        disabled={busy}
        title="Slet booking"
        style={{ ...btn, background: "#fff", color: "#dc3545", border: "1px solid #dc3545", opacity: busy ? 0.6 : 1 }}
      >
        Slet
      </button>
    </div>
  );
}

/** Kontaktoplysninger, kommentar og mail-log — vist under kortet/rækken */
function BookingDetails({ b, today }: { b: Booking; today: Date }) {
  const priceOf = usePriceLookup();
  return (
    <div style={{ paddingTop: "12px" }}>
      <OrderBreakdown b={b} priceOf={priceOf} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px 24px", fontSize: "13px", paddingTop: "12px" }}>
      <div><strong>Email:</strong> <a href={`mailto:${b.email}`} style={{ color: "#0070f3" }}>{b.email}</a></div>
      <div><strong>Telefon:</strong> <a href={`tel:${b.phone}`} style={{ color: "#0070f3" }}>{b.phone}</a></div>
      {b.company && <div><strong>Firma:</strong> {b.company}</div>}
      <div><strong>Dage:</strong> {b.days}</div>
      {b.deliveryAddress && <div><strong>Adresse:</strong> {b.deliveryAddress}</div>}
      <div>
        <strong>Sagsstatus:</strong>{" "}
        <span style={{ color: STAGE_META[bookingStage(b, today)].text }}>
          {STAGE_META[bookingStage(b, today)].label}
        </span>
        {isReturned(b) && !b.inspected && <span style={{ color: "#aaa" }}> · ikke testet</span>}
      </div>
      {b.handover && (
        <div style={{ gridColumn: "1 / -1", color: "#155724" }}>
          <strong>Kvitteret ved udlevering:</strong> {b.handover.signerName || b.name} ·{" "}
          {new Date(b.handover.signedAt).toLocaleString("da-DK")}
          {b.handover.note ? ` · ${b.handover.note}` : ""}
        </div>
      )}
      {b.comment && <div style={{ gridColumn: "1 / -1" }}><strong>Kommentar:</strong> {b.comment}</div>}
      <div style={{ gridColumn: "1 / -1" }}>
        <strong>Sendte mails:</strong>
        {(b.communications?.length ?? 0) === 0 ? (
          <span style={{ color: "#aaa" }}>
            {" "}
            {b.reviewMailSentAt
              ? `Anmeldelsesmail sendt ${new Date(b.reviewMailSentAt).toLocaleString("da-DK")}`
              : "Ingen registreret (booking fra før loggen blev indført)"}
          </span>
        ) : (
          <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
            {b.communications!.map((m, i) => (
              <li key={i} style={{ fontSize: "12px", color: "#555", marginBottom: "2px" }}>
                <span style={{ fontWeight: 600 }}>{m.label}</span>
                {" · "}
                {new Date(m.sentAt).toLocaleString("da-DK")}
                {m.to ? ` · ${m.to}` : ""}
                {m.note ? <span style={{ color: "#888" }}> · {m.note}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ gridColumn: "1 / -1", fontSize: "11px", color: "#aaa" }}>ID: {b.id}</div>
    </div>
    </div>
  );
}

/**
 * Mobilvisning: ét kort pr. booking. Rækkefølgen er den man bruger i døren —
 * hvem, hvornår, hvad der skal med, hvad der skal betales, og så handlingerne.
 */
function BookingCards({ bookings, expanded, setExpanded, updateStatus, deleteBooking, setFields, updating, today }: ListProps) {
  if (bookings.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {bookings.map((b) => {
        const issues = openIssues(b, today);
        const busy = updating === b.id;
        const stage = STAGE_META[bookingStage(b, today)];
        const isExpanded = expanded === b.id;
        return (
          <div key={b.id} style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: "14px", borderLeft: `4px solid ${stage.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "16px", fontWeight: 700 }}>{b.name}</div>
                <div style={{ fontSize: "13px", color: "#555" }}>{b.period}</div>
                <div style={{ fontSize: "12px", marginTop: "2px" }}>
                  <a href={`tel:${b.phone}`} style={{ color: "#0070f3" }}>{b.phone}</a>
                </div>
              </div>
              <span style={{ background: stage.bg, color: stage.text, border: `1px solid ${stage.border}`, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" }}>
                {stage.label}
              </span>
            </div>

            <div style={{ margin: "12px 0", padding: "10px 12px", background: "#fafafa", borderRadius: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                Det her skal med
              </div>
              <OrderSummary b={b} />
            </div>

            <PaymentBanner b={b} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Udstyr</div>
                <EquipmentTrack b={b} issues={issues.filter((i) => i.track === "udstyr")} updateStatus={updateStatus} setFields={setFields} busy={busy} />
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: "4px" }}>Betaling</div>
                <PaymentTrack b={b} issues={issues.filter((i) => i.track === "betaling")} setFields={setFields} />
              </div>
            </div>

            <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <RowActions b={b} busy={busy} deleteBooking={deleteBooking} big />
              <button onClick={() => setExpanded(isExpanded ? null : b.id)} style={{ background: "none", border: "none", color: "#0070f3", fontSize: "13px", cursor: "pointer", padding: "8px 0" }}>
                {isExpanded ? "Skjul ordre" : "Vis ordre & detaljer"}
              </button>
            </div>

            {isExpanded && <BookingDetails b={b} today={today} />}
          </div>
        );
      })}
    </div>
  );
}

function BookingTable({ bookings, expanded, setExpanded, updateStatus, deleteBooking, setFields, updating, today }: ListProps) {
  if (bookings.length === 0) return null;

  const thStyle: React.CSSProperties = { padding: "8px 12px", fontSize: "11px", fontWeight: 700, textAlign: "left", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #eee", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { padding: "10px 12px", fontSize: "13px", borderBottom: "1px solid #f5f5f5", verticalAlign: "top" };

  return (
    <div style={{ background: "#fff", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#fafafa" }}>
          <tr>
            <th style={{ ...thStyle, width: "170px" }}>Kunde</th>
            <th style={thStyle} title="Hvad der er bestilt, og hvor udstyret er i forløbet">Ordre &amp; udstyr</th>
            <th style={{ ...thStyle, width: "96px" }}>Periode</th>
            <th style={{ ...thStyle, width: "230px" }} title="Beløb, betaling, depositum og handlinger">Betaling &amp; handling</th>
            <th style={{ ...thStyle, width: "44px", textAlign: "center" }} title="Kunden har lagt en anmeldelse">⭐</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const isExpanded = expanded === b.id;
            const issues = openIssues(b, today);
            const busy = updating === b.id;
            return (
              <React.Fragment key={b.id}>
                <tr style={{ cursor: "pointer", background: isExpanded ? "#fafffe" : "transparent" }} onClick={() => setExpanded(isExpanded ? null : b.id)}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "#bbb", fontSize: "11px", width: "10px", display: "inline-block" }}>{isExpanded ? "▾" : "▸"}</span>
                      {b.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#aaa", paddingLeft: "16px" }}>
                      {new Date(b.createdAt).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}
                      <span style={{ color: "#0070f3" }}>{isExpanded ? "skjul ordre" : "vis ordre"}</span>
                    </div>
                  </td>
                  {/* Ordren og udstyrssporet hører sammen: statussen er
                      kvitteringen for præcis de varer der står lige over */}
                  <td style={tdStyle}>
                    <OrderSummary b={b} compact />
                    <div style={{ marginTop: "8px" }} onClick={(e) => e.stopPropagation()}>
                      <EquipmentTrack b={b} issues={issues.filter((i) => i.track === "udstyr")} updateStatus={updateStatus} setFields={setFields} busy={busy} />
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <PeriodCell b={b} />
                  </td>
                  {/* Beløb, betalingsspor og handlinger i én kolonne */}
                  <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                    <div style={{ fontWeight: 800, fontSize: "15px", marginBottom: "4px" }}>{b.total} kr</div>
                    <PaymentTrack b={b} issues={issues.filter((i) => i.track === "betaling")} setFields={setFields} />
                    <div style={{ marginTop: "8px" }}>
                      <RowActions b={b} busy={busy} deleteBooking={deleteBooking} />
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={!!b.reviewDone}
                      onChange={(e) => setFields(b.id, { reviewDone: e.target.checked })}
                      title={b.reviewMailSentAt ? `Anmeldelsesmail sendt ${new Date(b.reviewMailSentAt).toLocaleDateString("da-DK")}` : "Anmeldelsesmail endnu ikke sendt"}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    {b.reviewMailSentAt && !b.reviewDone && (
                      <div style={{ fontSize: "9px", color: "#aaa", marginTop: "2px" }}>mail sendt</div>
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={5} style={{ padding: "0 12px 16px", background: "#fafffe", borderBottom: "1px solid #eee" }}>
                      <BookingDetails b={b} today={today} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
