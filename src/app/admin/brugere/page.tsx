"use client";

import { useCallback, useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import { useAdminAuth } from "@/lib/useAdminAuth";

interface UserRow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "10px",
  padding: "16px",
  marginBottom: "14px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  boxSizing: "border-box",
  color: "#111",
};

export default function BrugerePage() {
  const { secret, user, ready, isLoggedIn, unauthorized } = useAdminAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPass, setNewPass] = useState("");

  const [pwId, setPwId] = useState("");
  const [pwVal, setPwVal] = useState("");

  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin-users?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { unauthorized(); return; }
        setError(data.error || "Kunne ikke hente brugere");
        return;
      }
      setUsers(data.users || []);
    } catch {
      setError("Netværksfejl");
    } finally {
      setLoading(false);
    }
  }, [secret, unauthorized]);

  useEffect(() => { load(); }, [load]);

  async function post(body: Record<string, unknown>) {
    setMsg("");
    setError("");
    const res = await fetch(`/api/admin-users?secret=${encodeURIComponent(secret)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Handling fejlede");
      return;
    }
    setUsers(data.users || []);
    setMsg("Gemt");
  }

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Admin-brugere" />;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <AdminNav
        title="Brugere"
        actions={
          user && (
            <span style={{ fontSize: "13px", color: "#666" }}>
              Logget ind som <strong>{user.name}</strong>
            </span>
          )
        }
      />

      <main style={{ maxWidth: "560px", margin: "0 auto", padding: "16px 20px 40px" }}>
        <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#666" }}>
          Administrer hvem der kan logge ind i admin. Adgangskoder gemmes hashed i KV.
        </p>

        {error && <div style={{ ...card, background: "#f8d7da", color: "#721c24" }}>{error}</div>}
        {msg && <div style={{ ...card, background: "#d4edda", color: "#155724" }}>{msg}</div>}

        <div style={card}>
          <h2 style={{ margin: "0 0 12px", fontSize: "16px" }}>Aktive brugere</h2>
          {loading && <p style={{ color: "#888", margin: 0 }}>Henter…</p>}
          {!loading && users.length === 0 && <p style={{ color: "#888", margin: 0 }}>Ingen brugere endnu.</p>}
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #f0f0f0",
                opacity: u.active ? 1 : 0.5,
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{u.name}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{u.id}{!u.active ? " · deaktiveret" : ""}</div>
              </div>
              {u.active && u.id !== user?.id && (
                <button
                  type="button"
                  onClick={() => post({ action: "deactivate", id: u.id })}
                  style={{ fontSize: "12px", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: "pointer" }}
                >
                  Deaktivér
                </button>
              )}
              {!u.active && (
                <button
                  type="button"
                  onClick={() => post({ action: "activate", id: u.id })}
                  style={{ fontSize: "12px", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", cursor: "pointer" }}
                >
                  Aktivér
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={card}>
          <h2 style={{ margin: "0 0 12px", fontSize: "16px" }}>Skift adgangskode</h2>
          <select value={pwId} onChange={(e) => setPwId(e.target.value)} style={{ ...input, marginBottom: "8px" }}>
            <option value="">Vælg bruger…</option>
            {users.filter((u) => u.active).map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <input
            type="password"
            placeholder="Ny adgangskode (min. 4 tegn)"
            value={pwVal}
            onChange={(e) => setPwVal(e.target.value)}
            style={{ ...input, marginBottom: "8px" }}
          />
          <button
            type="button"
            disabled={!pwId || pwVal.length < 4}
            onClick={() => { post({ action: "set_password", id: pwId, password: pwVal }); setPwVal(""); }}
            style={{ padding: "10px 16px", fontSize: "14px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            Gem adgangskode
          </button>
        </div>

        <div style={card}>
          <h2 style={{ margin: "0 0 12px", fontSize: "16px" }}>Tilføj bruger</h2>
          <input placeholder="Id (fx maria)" value={newId} onChange={(e) => setNewId(e.target.value)} style={{ ...input, marginBottom: "8px" }} />
          <input placeholder="Navn" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ ...input, marginBottom: "8px" }} />
          <input type="password" placeholder="Adgangskode" value={newPass} onChange={(e) => setNewPass(e.target.value)} style={{ ...input, marginBottom: "8px" }} />
          <button
            type="button"
            disabled={!newId || !newName || newPass.length < 4}
            onClick={() => {
              post({ action: "create", id: newId, name: newName, password: newPass });
              setNewId("");
              setNewName("");
              setNewPass("");
            }}
            style={{ padding: "10px 16px", fontSize: "14px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            Opret bruger
          </button>
        </div>
      </main>
    </div>
  );
}
