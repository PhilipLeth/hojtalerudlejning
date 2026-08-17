"use client";

import { useState } from "react";
import { useAdminAuth, type LoginUserOption } from "@/lib/useAdminAuth";

const formStyle: React.CSSProperties = {
  background: "#fff",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  maxWidth: "400px",
  width: "100%",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  fontSize: "16px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  marginBottom: "12px",
  boxSizing: "border-box",
  color: "#111",
};

interface AdminLoginProps {
  title?: string;
  subtitle?: string;
  /** Efter login — fx redirect til /admin */
  onSuccess?: () => void;
}

export default function AdminLogin({
  title = "Admin",
  subtitle = "Vælg hvem du er og indtast adgangskode",
  onSuccess,
}: AdminLoginProps) {
  const { login, loginUsers } = useAdminAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const users: LoginUserOption[] = loginUsers.length
    ? loginUsers
    : [
        { id: "frederik", name: "Frederik" },
        { id: "philip", name: "Philip" },
      ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !password.trim()) {
      setError("Vælg bruger og indtast adgangskode");
      return;
    }
    setLoading(true);
    setError("");
    const err = await login(userId, password.trim());
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    onSuccess?.();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        color: "#111",
        fontFamily: "system-ui, sans-serif",
        padding: "20px",
      }}
    >
      <form onSubmit={submit} style={formStyle}>
        <h1 style={{ margin: "0 0 8px", fontSize: "24px" }}>{title}</h1>
        <p style={{ margin: "0 0 20px", color: "#666", fontSize: "14px" }}>{subtitle}</p>

        {error && (
          <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "4px" }}>
          Hvem er du?
        </label>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={inputStyle}
          required
        >
          <option value="">Vælg bruger…</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "4px" }}>
          Adgangskode
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Adgangskode"
          style={inputStyle}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            background: loading ? "#666" : "#000",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Logger ind…" : "Log ind"}
        </button>
      </form>
    </div>
  );
}
