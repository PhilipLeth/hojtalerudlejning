"use client";

import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

import { useState, useEffect, useCallback } from "react";
import { orderLines, deliveryInfo, type OrderBooking } from "@/lib/orderLines";

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
  const [pickupPlace, setPickupPlace] = useState("Halvtolv 9, 1057 København K");
  const [notes, setNotes] = useState("");
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
    rows.push({ item: "AUX-kabel", qty: "1" });
    // Plads til håndskrevne tilføjelser
    while (rows.length < 8) {
      rows.push({ item: "", qty: "" });
    }
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

  return (
    <>
      {/* Override dark theme + print styles */}
      <style>{`
        body { background: #f5f5f5 !important; color: #111 !important; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: #fff !important; }
          .print-page { padding: 20mm 15mm !important; font-size: 11pt !important; max-width: none !important; background: #fff !important; }
          .print-page table { page-break-inside: avoid; }
        }
        .rental-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .rental-table td, .rental-table th { border: 1px solid #ccc; padding: 8px 10px; text-align: left; font-size: 13px; }
        .rental-table th { background: #f7f7f7; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.02em; }
        .rental-table td:first-child { width: 180px; font-weight: 500; color: #444; }
        .section-title { font-size: 15px; font-weight: 700; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #111; }
      `}</style>

      {/* Controls bar (hidden on print) */}
      <div className="no-print" style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", fontFamily: "system-ui, sans-serif" }}>
        <button onClick={() => setSelected(null)} style={{ padding: "8px 16px", fontSize: "14px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", color: "#111" }}>
          &larr; Vælg anden booking
        </button>
        <div style={{ flex: 1, minWidth: "8px" }} />
        <label style={{ fontSize: "13px", color: "#666" }}>
          Depositum:
          <input value={deposit} onChange={(e) => setDeposit(e.target.value)} style={{ marginLeft: "6px", width: "80px", padding: "4px 8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", color: "#111" }} />
        </label>
        <label style={{ fontSize: "13px", color: "#666" }}>
          Betaling:
          <input value={payMethod} onChange={(e) => setPayMethod(e.target.value)} style={{ marginLeft: "6px", width: "100px", padding: "4px 8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", color: "#111" }} />
        </label>
        <label style={{ fontSize: "13px", color: "#666" }}>
          Afhentning:
          <input value={pickupPlace} onChange={(e) => setPickupPlace(e.target.value)} style={{ marginLeft: "6px", width: "100%", maxWidth: "220px", padding: "4px 8px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", color: "#111" }} />
        </label>
        <button onClick={() => window.print()} style={{ padding: "8px 20px", fontSize: "14px", fontWeight: 600, background: "#111", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          Print
        </button>
      </div>

      {/* Editable notes (hidden on print) */}
      <div className="no-print" style={{ maxWidth: "700px", margin: "12px auto 0", padding: "0 24px", fontFamily: "system-ui, sans-serif" }}>
        <label style={{ fontSize: "13px", color: "#666" }}>
          Bemærkninger (vises på sedlen):
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            style={{ display: "block", width: "100%", marginTop: "4px", padding: "8px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px", resize: "vertical", boxSizing: "border-box", color: "#111" }}
            placeholder="Evt. ekstra noter..." />
        </label>
      </div>

      {/* Printable rental slip */}
      <div className="print-page" style={{ maxWidth: "700px", margin: "0 auto", padding: "24px", fontFamily: "Georgia, 'Times New Roman', serif", color: "#111", lineHeight: 1.5, background: "#fff", borderRadius: "12px", marginTop: "16px", marginBottom: "24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, letterSpacing: "0.02em" }}>
            Lejekontrakt &mdash; udlejning af højtalerudstyr
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>lejhøjtaler.dk &mdash; Scharling Studio &mdash; CVR 40994904</p>
        </div>

        <p style={{ fontSize: "13px", color: "#444", marginBottom: "20px" }}>
          Denne kontrakt indgås mellem udlejer og lejer i forbindelse med udlejning af lydudstyr (herunder højttalere, stativer, kabler og evt. tilbehør). Begge parter bekræfter ved underskrift, at de har læst og accepteret vilkårene nedenfor.
        </p>

        {/* 1. Parter */}
        <h3 className="section-title">1. Parter</h3>
        <table className="rental-table">
          <tbody>
            <tr><td>Udlejer:</td><td>Scharling Studio (lejhøjtaler.dk) — CVR 40994904</td></tr>
            <tr><td>Kontakt:</td><td>31 13 28 52 / hey@lejhojtaler.dk</td></tr>
          </tbody>
        </table>
        <table className="rental-table">
          <tbody>
            <tr><td>Lejers navn:</td><td>{selected.name}</td></tr>
            <tr><td>Telefon:</td><td>{selected.phone}</td></tr>
            <tr><td>E-mail:</td><td>{selected.email}</td></tr>
            <tr><td>Adresse:</td><td>{selected.deliveryAddress || "______________________________________"}</td></tr>
          </tbody>
        </table>

        {/* 2. Lejeperiode */}
        <h3 className="section-title">2. Lejeperiode</h3>
        <table className="rental-table">
          <tbody>
            <tr><td>Periode:</td><td>{selected.period} ({selected.days} {selected.days === 1 ? "dag" : "dage"})</td></tr>
            <tr><td>Afhentningssted:</td><td>{pickupPlace}</td></tr>
            <tr>
              <td>Kørsel:</td>
              <td>
                {(() => {
                  const d = deliveryInfo(selected);
                  if (!d) return "Lejer henter og afleverer selv";
                  const dir = d.out && d.back
                    ? "Udlejer leverer og henter igen"
                    : d.out
                      ? "Udlejer leverer — lejer afleverer selv"
                      : "Lejer henter — udlejer henter igen";
                  return d.address ? `${dir} — ${d.address}` : dir;
                })()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 3. Udlejet udstyr */}
        <h3 className="section-title">3. Udlejet udstyr</h3>
        <table className="rental-table">
          <thead>
            <tr>
              <th style={{ width: "24px" }}>&#10003;</th>
              <th>Udstyr</th>
              <th style={{ width: "50px" }}>Antal</th>
              <th>Stand ved udlevering</th>
              <th>Stand ved retur</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((eq, i) => (
              <tr key={i}>
                <td style={{ textAlign: "center" }}>{eq.item ? "☐" : ""}</td>
                <td>{eq.item || <span style={{ color: "#ccc" }}>___________________________</span>}</td>
                <td style={{ textAlign: "center" }}>{eq.qty}</td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "-8px" }}>
          Lejer bekræfter ved underskrift at have modtaget ovenstående udstyr i den anførte stand på afhentningstidspunktet, samt at udstyret er funktionsdueligt og uden synlige skader, medmindre andet er noteret ovenfor.
        </p>
        {selected.handover && (
          <p style={{ fontSize: "12px", color: "#155724", marginTop: "4px" }}>
            Kvitteret digitalt ved udlevering {new Date(selected.handover.signedAt).toLocaleString("da-DK")}
            {selected.handover.note ? ` — bemærkning: ${selected.handover.note}` : ""}
          </p>
        )}

        {/* 4. Betaling og depositum */}
        <h3 className="section-title">4. Betaling og depositum</h3>
        <table className="rental-table">
          <tbody>
            <tr><td>Lejepris:</td><td>{selected.total} kr.</td></tr>
            <tr><td>Depositum:</td><td>{deposit} kr.</td></tr>
            <tr><td>Betalingsmetode:</td><td>{payMethod}</td></tr>
          </tbody>
        </table>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "-8px" }}>
          Depositum tilbagebetales ved retur af udstyret i samme stand som ved udlevering, og når det er konstateret, at udstyret er intakt og fuldt funktionsdueligt. Ved skade, mangler eller forsinket retur kan depositummet helt eller delvist tilbageholdes.
        </p>

        {/* 5. Lejers ansvar */}
        <h3 className="section-title">5. Lejers ansvar og hæftelse</h3>
        <ul style={{ fontSize: "12px", color: "#444", paddingLeft: "20px", margin: "0 0 8px" }}>
          <li>Lejer hæfter fra modtagelse til aflevering for enhver skade, bortkomst eller beskadigelse — uanset årsag.</li>
          <li>Udstyret skal beskyttes mod regn, fugt, stød og overbelastning.</li>
          <li>Ved skade eller bortkomst erstattes udlejers fulde udgift til reparation eller nyanskaffelse.</li>
          <li>Udstyret må ikke videreudlejes eller udlånes til tredjepart.</li>
          <li>Fejl eller skader skal meddeles udlejer hurtigst muligt.</li>
        </ul>

        {/* 6. Forsinket retur */}
        <h3 className="section-title">6. Forsinket retur</h3>
        <p style={{ fontSize: "12px", color: "#444", margin: "0 0 8px" }}>
          Returneres udstyret senere end aftalt uden forudgående aftale, kan udlejer opkræve gebyr svarende til normal lejepris pr. ekstra døgn, samt kompensation for tabt indtjening.
        </p>

        {/* 7. Annullering */}
        <h3 className="section-title">7. Annullering</h3>
        <p style={{ fontSize: "12px", color: "#444", margin: "0 0 8px" }}>
          Annullering skal ske skriftligt (sms eller e-mail). Vilkår for tilbagebetaling aftales individuelt.
        </p>

        {/* 8. Ansvarsfraskrivelse */}
        <h3 className="section-title">8. Ansvarsfraskrivelse</h3>
        <p style={{ fontSize: "12px", color: "#444", margin: "0 0 8px" }}>
          Udlejer er ikke ansvarlig for driftstab, følgeskader eller andre indirekte skader. Udlejer er heller ikke ansvarlig for personskade eller skade på tredjemands ejendom forårsaget af lejers brug af udstyret.
        </p>

        {/* 9. Øvrige bestemmelser */}
        <h3 className="section-title">9. Øvrige bestemmelser</h3>
        <ul style={{ fontSize: "12px", color: "#444", paddingLeft: "20px", margin: "0 0 8px" }}>
          <li>Det lejede udstyr forbliver til enhver tid Scharling Studios ejendom.</li>
          <li>Lejer skal være myndig (18 år eller derover).</li>
          <li>Tvister afgøres efter dansk ret ved de danske domstole.</li>
        </ul>

        {/* Notes */}
        {notes && (
          <>
            <h3 className="section-title">Bemærkninger</h3>
            <p style={{ fontSize: "12px", color: "#444", margin: "0 0 8px", whiteSpace: "pre-wrap" }}>{notes}</p>
          </>
        )}

        {/* Signatures */}
        <h3 className="section-title">Underskrifter</h3>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "16px" }}>
          Ved underskrift bekræfter begge parter at have læst og accepteret ovenstående vilkår.
        </p>
        <table className="rental-table">
          <tbody>
            <tr>
              <td style={{ width: "50%", height: "100px", verticalAlign: "bottom", paddingBottom: "12px" }}>
                <div style={{ borderTop: "1px solid #111", paddingTop: "6px", fontSize: "12px" }}>
                  Udlejer (lejhøjtaler.dk / Scharling Studio)<br />
                  Dato: ____________________
                </div>
              </td>
              <td style={{ width: "50%", height: "100px", verticalAlign: "bottom", paddingBottom: "12px" }}>
                {signatureImg && (
                  <img
                    src={signatureImg}
                    alt="Lejers underskrift"
                    style={{ display: "block", maxWidth: "100%", maxHeight: "70px", objectFit: "contain" }}
                  />
                )}
                <div style={{ borderTop: "1px solid #111", paddingTop: "6px", fontSize: "12px" }}>
                  Lejer: {selected.handover?.signerName || selected.name}<br />
                  Dato: {selected.handover?.signedAt
                    ? new Date(selected.handover.signedAt).toLocaleString("da-DK")
                    : "____________________"}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
