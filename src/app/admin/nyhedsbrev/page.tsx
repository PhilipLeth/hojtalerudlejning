"use client";

import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

import { useState, useEffect, useCallback } from "react";

interface Subscriber {
  email: string;
  subscribedAt: string;
}

export default function NyhedsbrevPage() {
  const { secret, user, ready, isLoggedIn, logout, unauthorized } = useAdminAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const fetchSubscribers = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/newsletter?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kunne ikke hente tilmeldinger");
        return;
      }
      setSubscribers(data.subscribers || []);
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    if (secret) fetchSubscribers();
  }, [secret, fetchSubscribers]);

  const exportCsv = () => {
    const csv = ["Email,Tilmeldt"]
      .concat(subscribers.map((s) => `${s.email},${s.subscribedAt?.slice(0, 10) || ""}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nyhedsbrev-tilmeldinger.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Nyhedsbrev" />;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <AdminNav
        actions={
          <>
            <span style={{ fontSize: "13px", color: "#666" }}>{subscribers.length} tilmeldt{subscribers.length !== 1 ? "e" : ""}</span>
            {subscribers.length > 0 && (
              <button onClick={exportCsv} style={{ padding: "8px 16px", fontSize: "14px", background: "#000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                Eksporter CSV
              </button>
            )}
          </>
        }
      />

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
        {error && (
          <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {loading && <p style={{ textAlign: "center", color: "#888" }}>Henter...</p>}

        {!loading && subscribers.length === 0 && !error && (
          <p style={{ textAlign: "center", color: "#888", marginTop: "60px" }}>Ingen tilmeldinger endnu</p>
        )}

        {subscribers.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #eee", background: "#fafafa" }}>
                  <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600 }}>Email</th>
                  <th style={{ textAlign: "left", padding: "12px 20px", fontWeight: 600 }}>Tilmeldt</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.email} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px 20px" }}>
                      <a href={`mailto:${s.email}`} style={{ color: "#0070f3" }}>{s.email}</a>
                    </td>
                    <td style={{ padding: "10px 20px", color: "#888" }}>
                      {s.subscribedAt
                        ? new Date(s.subscribedAt).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
