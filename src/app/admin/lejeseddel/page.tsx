"use client";

import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

import { useState, useEffect, useCallback } from "react";
import { orderLines, deliveryInfo, type OrderBooking } from "@/lib/orderLines";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { formatCompanyLine } from "@/lib/siteInfo";

interface Booking extends OrderBooking {
  id: string;
  speaker: string;
  speakerSize: string;
  period: string;
  days: number;
  addons: string[];
  deliveryAddress?: string;
  total: number;
  name: string;
  email: string;
  phone: string;
  comment: string;
  status: string;
  /** Depositum registreret i ordreoverblikket — 0 betyder intet depositum */
  depositAmount?: number;
  /** Indbetalinger på ordren — sedlen skal vise hvad der mangler, ikke kun prisen */
  payments?: Array<{ amount?: number; method?: string }>;
  invoice?: { number?: string } | null;
  pickup?: string;
  returnDate?: string;
  personalNote?: string;
  /** Kundens underskrift ved udlevering (metadata — billedet hentes for sig) */
  handover?: { signedAt: string; signerName?: string; note?: string; items?: string[] };
  createdAt: string;
}

export default function LejeseddelPage() {
  const { secret, user, ready, isLoggedIn, logout, unauthorized } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Editable fields for the rental slip
  const [deposit, setDeposit] = useState("500");
  const [payMethod, setPayMethod] = useState("MobilePay");
  // Afhentningsstedet kommer fra /admin/indstillinger, men kan rettes på den
  // enkelte seddel (fx hvis udstyret afleveres et andet sted)
  const { pickupAddress, company } = useSiteSettings();
  const [pickupPlace, setPickupPlace] = useState("");
  useEffect(() => {
    setPickupPlace((prev) => prev || pickupAddress);
  }, [pickupAddress]);
  const [notes, setNotes] = useState("");
  /** "seddel" er én A4-side til udlevering; "bilag" er de fulde lejevilkår */
  const [mode, setMode] = useState<"seddel" | "bilag">("seddel");
  const [signatureImg, setSignatureImg] = useState<string | null>(null);


  const fetchBookings = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
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
      setBookings(data.bookings || []);
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    if (secret) fetchBookings();
  }, [secret, fetchBookings]);

  // Auto-select booking from sessionStorage (when coming from "Print lejeseddel" button)
  useEffect(() => {
    const stored = sessionStorage.getItem("lejeseddel_booking");
    if (stored) {
      try {
        setSelected(JSON.parse(stored));
        sessionStorage.removeItem("lejeseddel_booking");
      } catch { /* ignore */ }
    }
  }, []);

  // Er der registreret et depositum på bookingen, er det dét der skal stå på
  // sedlen — ellers beholdes standardbeløbet
  useEffect(() => {
    if (selected?.depositAmount !== undefined) setDeposit(String(selected.depositAmount));
  }, [selected]);

  // Underskriften fra udleveringen ligger for sig i KV — hentes kun for den
  // booking der er valgt, så sedlen kan trykkes med kundens kvittering på
  useEffect(() => {
    setSignatureImg(null);
    if (!selected || !secret) return;
    let cancelled = false;
    fetch(`/api/handover?secret=${encodeURIComponent(secret)}&id=${encodeURIComponent(selected.id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d?.signature) setSignatureImg(d.signature); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [selected, secret]);

  /**
   * Udstyrslisten er ordrens egne linjer — hovedprodukt, kurv-varer og tilvalg.
   * Tidligere blev alt kaldt "Højttaler (...)", så en ordre på en lyskæde stod
   * som "Højttaler (Lyskæde varm hvid — —)" og kurv-varer manglede helt.
   */
  function getEquipmentRows(b: Booking) {
    const rows: { item: string; qty: string }[] = orderLines(b).map((l) => ({
      item: l.label,
      qty: String(l.qty),
    }));
    rows.push({ item: "Strømkabel", qty: "1" });
    rows.push({ item: "AUX-kabel + iPhone-adapter", qty: "1" });
    // Tre tomme linjer til det, der bliver aftalt i døren
    for (let i = 0; i < 3; i++) rows.push({ item: "", qty: "" });
    return rows;
  }

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Lejeseddel" />;

  // Booking selection screen
  if (!selected) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
        <AdminNav title="Lejeseddel" />
        <main style={{ maxWidth: "700px", margin: "0 auto", padding: "24px" }}>
          {error && <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>{error}</div>}
          {loading && <p style={{ textAlign: "center", color: "#888" }}>Henter bookinger...</p>}
          <p style={{ color: "#666", marginBottom: "16px" }}>Vælg en booking for at generere lejeseddel:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {bookings.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelected(b)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "14px 18px", cursor: "pointer", textAlign: "left", fontSize: "14px" }}
              >
                <div>
                  <strong>{b.name}</strong>
                  <span style={{ color: "#888", marginLeft: "12px" }}>{b.speaker} — {b.period}</span>
                </div>
                <span style={{ color: "#888", fontSize: "13px" }}>{b.total} kr</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }


  const equipment = getEquipmentRows(selected);
  const paid = (selected.payments ?? []).reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);
  const rest = Math.max(0, (Number(selected.total) || 0) - paid);
  const kr = (n: number) => `${Math.round(n).toLocaleString("da-DK")} kr`;
  const delivery = deliveryInfo(selected);
  const koersel = !delivery
    ? "Lejer henter og afleverer selv"
    : delivery.out && delivery.back
      ? "Vi leverer og henter igen"
      : delivery.out
        ? "Vi leverer — lejer afleverer selv"
        : "Lejer henter — vi henter igen";
  const bemaerkninger = [selected.comment, selected.personalNote, notes].filter(Boolean).join(" · ");

  return (
    <>
      <style>{`
        body { background: #f5f5f5 !important; color: #111 !important; }
        @page { size: A4; margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: #fff !important; }
          .print-page { padding: 0 !important; margin: 0 !important; max-width: none !important; box-shadow: none !important; border-radius: 0 !important; }
          .seddel { font-size: 10pt; }
          .seddel table { page-break-inside: avoid; }
          /* Én side er hele pointen — hellere lidt mindre skrift end to sider */
          .seddel .udstyr td { padding: 2.5px 6px; }
        }
        .seddel { font-family: system-ui, -apple-system, sans-serif; color: #111; line-height: 1.35; }
        .seddel h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #666; margin: 12px 0 4px; font-weight: 700; }
        .seddel table { width: 100%; border-collapse: collapse; }
        .seddel .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; }
        .seddel .box { border: 1px solid #ddd; border-radius: 6px; padding: 8px 10px; }
        .seddel .row { display: flex; gap: 6px; font-size: 12.5px; padding: 1px 0; }
        .seddel .row b { color: #555; font-weight: 600; min-width: 74px; }
        .udstyr th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.04em; color: #777; border-bottom: 1.5px solid #111; padding: 3px 6px; }
        .udstyr td { border-bottom: 1px solid #eee; padding: 4px 6px; font-size: 12.5px; }
        .udstyr .midt { text-align: center; width: 42px; }
        .rental-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .rental-table td, .rental-table th { border: 1px solid #ccc; padding: 7px 9px; text-align: left; font-size: 12px; }
        .rental-table td:first-child { width: 170px; font-weight: 500; color: #444; }
        .section-title { font-size: 14px; font-weight: 700; margin: 16px 0 6px; padding-bottom: 3px; border-bottom: 2px solid #111; }
      `}</style>

      {/* Værktøjslinje — kommer ikke med på tryk */}
      <div className="no-print" style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", fontFamily: "system-ui, sans-serif" }}>
        <button onClick={() => setSelected(null)} style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", color: "#111" }}>
          &larr; Vælg anden booking
        </button>
        <div style={{ display: "flex", border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
          {(["seddel", "bilag"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{ padding: "8px 14px", fontSize: "13px", border: "none", cursor: "pointer", background: mode === m ? "#111" : "#fff", color: mode === m ? "#fff" : "#555" }}
            >
              {m === "seddel" ? "Lejeseddel (1 side)" : "Bilag: lejevilkår"}
            </button>
          ))}
        </div>
        <label style={{ fontSize: "13px", color: "#666" }}>
          Depositum:
          <input value={deposit} onChange={(e) => setDeposit(e.target.value)} style={{ marginLeft: "6px", width: "70px", padding: "4px 8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", color: "#111" }} />
        </label>
        <label style={{ fontSize: "13px", color: "#666" }}>
          Betales med:
          <input value={payMethod} onChange={(e) => setPayMethod(e.target.value)} style={{ marginLeft: "6px", width: "90px", padding: "4px 8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", color: "#111" }} />
        </label>
        <label style={{ fontSize: "13px", color: "#666", flex: 1, minWidth: "200px" }}>
          Bemærkning:
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fx »henter kl. 16 i stedet«" style={{ marginLeft: "6px", width: "70%", padding: "4px 8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", color: "#111" }} />
        </label>
        <button onClick={() => window.print()} style={{ padding: "8px 20px", fontSize: "14px", fontWeight: 600, background: "#111", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          Print
        </button>
      </div>

      <div className="print-page" style={{ maxWidth: "760px", margin: "16px auto 24px", padding: "26px 28px", background: "#fff", borderRadius: "12px" }}>
        {mode === "seddel" ? (
          <div className="seddel">
            {/* Hoved: hvem, hvad og hvilken ordre */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", borderBottom: "2px solid #111", paddingBottom: "8px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.01em" }}>Lejeseddel</div>
                <div style={{ fontSize: "11.5px", color: "#666" }}>{formatCompanyLine(company)}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: "11.5px", color: "#666" }}>
                <div>Ordre <strong style={{ color: "#111" }}>{selected.id.replace("booking_", "")}</strong></div>
                <div>{new Date().toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            </div>

            {/* Kunde og leje ved siden af hinanden — det man skal bruge i døren */}
            <div className="grid" style={{ marginTop: "10px" }}>
              <div className="box">
                <h2 style={{ margin: "0 0 3px" }}>Lejer</h2>
                <div className="row"><b>Navn</b> <span>{selected.name}</span></div>
                <div className="row"><b>Telefon</b> <span>{selected.phone}</span></div>
                <div className="row"><b>E-mail</b> <span>{selected.email}</span></div>
                <div className="row"><b>Adresse</b> <span>{selected.deliveryAddress || "—"}</span></div>
              </div>
              <div className="box">
                <h2 style={{ margin: "0 0 3px" }}>Leje</h2>
                <div className="row"><b>Periode</b> <span>{selected.period} ({selected.days} {selected.days === 1 ? "dag" : "dage"})</span></div>
                <div className="row"><b>Kørsel</b> <span>{koersel}</span></div>
                <div className="row"><b>Sted</b> <span>{delivery?.address || pickupPlace}</span></div>
                <div className="row"><b>Bestilt</b> <span>{new Date(selected.createdAt).toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" })}</span></div>
              </div>
            </div>

            {/* Pakkelisten: krydses af på vej ud og på vej ind */}
            <h2>Udstyr</h2>
            <table className="udstyr">
              <thead>
                <tr>
                  <th className="midt">Antal</th>
                  <th>Udstyr</th>
                  <th className="midt">Ud</th>
                  <th className="midt">Ind</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((eq, i) => (
                  <tr key={i}>
                    <td className="midt">{eq.qty}</td>
                    <td>{eq.item}</td>
                    <td className="midt">☐</td>
                    <td className="midt">☐</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Økonomi: hvad der er betalt, og hvad der mangler */}
            <div className="grid" style={{ marginTop: "12px" }}>
              <div className="box">
                <h2 style={{ margin: "0 0 3px" }}>Betaling</h2>
                <div className="row"><b>Lejepris</b> <span>{kr(Number(selected.total) || 0)}</span></div>
                <div className="row"><b>Betalt</b> <span>{paid > 0 ? kr(paid) : "—"}</span></div>
                <div className="row">
                  <b>Rest</b>{" "}
                  <span style={{ fontWeight: 700 }}>
                    {rest > 0 ? `${kr(rest)} — ${payMethod} ved afhentning` : "Betalt"}
                  </span>
                </div>
                <div className="row"><b>Depositum</b> <span>{Number(deposit) > 0 ? kr(Number(deposit)) : "Intet"}</span></div>
              </div>
              <div className="box">
                <h2 style={{ margin: "0 0 3px" }}>Bemærkninger</h2>
                <div style={{ fontSize: "12.5px", minHeight: "48px", whiteSpace: "pre-wrap" }}>{bemaerkninger || " "}</div>
              </div>
            </div>

            {/* Det korte, der skrives under på. Resten står i bilaget. */}
            <h2>Det du skriver under på</h2>
            <ul style={{ margin: "0 0 8px", paddingLeft: "18px", fontSize: "11.5px", color: "#333", lineHeight: 1.4 }}>
              <li>Udstyret er modtaget i god og funktionsdygtig stand, medmindre andet er noteret ovenfor.</li>
              <li>Lejer hæfter for skade og bortkomst fra udlevering til aflevering, og udstyret må ikke lånes videre.</li>
              <li>Afleveres udstyret for sent uden aftale, kan der opkræves leje pr. påbegyndt døgn.</li>
              <li>De fulde lejevilkår står i bilaget og er en del af denne aftale.</li>
            </ul>

            {/* Underskrift: kundens er det eneste der skal indhentes i døren */}
            <div className="grid" style={{ marginTop: "14px" }}>
              <div>
                {signatureImg ? (
                  <img src={signatureImg} alt="Lejers underskrift" style={{ display: "block", maxWidth: "100%", maxHeight: "56px", objectFit: "contain" }} />
                ) : (
                  <div style={{ height: "56px" }} />
                )}
                <div style={{ borderTop: "1px solid #111", paddingTop: "4px", fontSize: "11.5px" }}>
                  Lejers underskrift — {selected.handover?.signerName || selected.name}
                  <br />
                  Dato:{" "}
                  {selected.handover?.signedAt
                    ? new Date(selected.handover.signedAt).toLocaleString("da-DK")
                    : "________________"}
                </div>
              </div>
              <div>
                <div style={{ height: "56px" }} />
                <div style={{ borderTop: "1px solid #111", paddingTop: "4px", fontSize: "11.5px" }}>
                  Udleveret af ({company.name})
                  <br />
                  Dato: ________________
                </div>
              </div>
            </div>

            {selected.handover && (
              <p style={{ fontSize: "11px", color: "#155724", margin: "8px 0 0" }}>
                Kvitteret digitalt ved udlevering {new Date(selected.handover.signedAt).toLocaleString("da-DK")}
                {selected.handover.note ? ` — ${selected.handover.note}` : ""}
              </p>
            )}
          </div>
        ) : (
          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: 1.5 }}>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 700 }}>Bilag — lejevilkår</h1>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                Hører til lejeseddel for ordre {selected.id.replace("booking_", "")} · {formatCompanyLine(company)}
              </p>
            </div>

            <h3 className="section-title">1. Lejers ansvar og hæftelse</h3>
            <ul style={{ fontSize: "12px", color: "#444", paddingLeft: "20px", margin: "0 0 8px" }}>
              <li>Lejer hæfter fra modtagelse til aflevering for enhver skade, bortkomst eller beskadigelse — uanset årsag.</li>
              <li>Udstyret skal beskyttes mod regn, fugt, stød og overbelastning.</li>
              <li>Ved skade eller bortkomst erstattes udlejers fulde udgift til reparation eller nyanskaffelse.</li>
              <li>Udstyret må ikke videreudlejes eller udlånes til tredjepart.</li>
              <li>Fejl eller skader skal meddeles udlejer hurtigst muligt.</li>
            </ul>

            <h3 className="section-title">2. Depositum</h3>
            <p style={{ fontSize: "12px", color: "#444", margin: "0 0 8px" }}>
              Depositum tilbagebetales ved retur af udstyret i samme stand som ved udlevering, og når det er
              konstateret, at udstyret er intakt og fuldt funktionsdueligt. Ved skade, mangler eller forsinket
              retur kan depositummet helt eller delvist tilbageholdes.
            </p>

            <h3 className="section-title">3. Forsinket retur</h3>
            <p style={{ fontSize: "12px", color: "#444", margin: "0 0 8px" }}>
              Returneres udstyret senere end aftalt uden forudgående aftale, kan udlejer opkræve gebyr svarende
              til normal lejepris pr. ekstra døgn, samt kompensation for tabt indtjening.
            </p>

            <h3 className="section-title">4. Annullering</h3>
            <p style={{ fontSize: "12px", color: "#444", margin: "0 0 8px" }}>
              Annullering skal ske skriftligt (sms eller e-mail). Vilkår for tilbagebetaling aftales individuelt.
            </p>

            <h3 className="section-title">5. Ansvarsfraskrivelse</h3>
            <p style={{ fontSize: "12px", color: "#444", margin: "0 0 8px" }}>
              Udlejer er ikke ansvarlig for driftstab, følgeskader eller andre indirekte skader. Udlejer er
              heller ikke ansvarlig for personskade eller skade på tredjemands ejendom forårsaget af lejers brug
              af udstyret.
            </p>

            <h3 className="section-title">6. Øvrige bestemmelser</h3>
            <ul style={{ fontSize: "12px", color: "#444", paddingLeft: "20px", margin: "0 0 8px" }}>
              <li>Det lejede udstyr forbliver til enhver tid {company.name}s ejendom.</li>
              <li>Lejer skal være myndig (18 år eller derover).</li>
              <li>Tvister afgøres efter dansk ret ved de danske domstole.</li>
            </ul>

            <p style={{ fontSize: "11.5px", color: "#666", marginTop: "16px" }}>
              Vilkårene er en del af lejeaftalen og accepteres ved underskrift på lejesedlen.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
