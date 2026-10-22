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
  /** Efter login, fx redirect til /admin */
  onSuccess?: () => void;
}

export default function AdminLogin({
  title = "Admin",
  subtitle = "Vælg hvem du er og indtast adgangskode",
  onSuccess,
}: AdminLoginProps) {
  const { login, loginUsers, requestMagicLink, redeemingLink, magicError } = useAdminAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkSentTo, setLinkSentTo] = useState("");
  const [sendingLink, setSendingLink] = useState(false);

  const shownError = error || (!linkSentTo ? magicError : "");
  const selected = loginUsers.find((u) => u.id === userId);
  // Før brugerlisten er hentet ved vi ikke om der er mail — vis knappen, serveren afgør det
  const canSendLink = !!userId && (selected ? selected.hasEmail !== false : true);

  async function sendLink() {
    if (!userId) {
      setError("Vælg hvem du er først");
      return;
    }
    setSendingLink(true);
    setError("");
    setLinkSentTo("");
    const r = await requestMagicLink(userId);
    setSendingLink(false);
    if ("error" in r) setError(r.error);
    else setLinkSentTo(r.sentTo);
  }

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

        {redeemingLink && (
          <div style={{ background: "#e8f0fe", color: "#1a3d7c", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "14px" }}>
            Logger ind med dit link…
          </div>
        )}

        {shownError && (
          <div style={{ background: "#f8d7da", color: "#721c24", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "14px" }}>
            {shownError}
          </div>
        )}

        {linkSentTo && (
          <div style={{ background: "#d4edda", color: "#155724", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px", fontSize: "14px" }}>
            Login-link sendt til {linkSentTo}. Det virker i 15 minutter. Tjek også spam.
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

        <div style={{ textAlign: "center", margin: "16px 0 0", fontSize: "14px", color: "#666" }}>
          Glemt koden?{" "}
          <button
            type="button"
            onClick={sendLink}
            disabled={sendingLink || !canSendLink}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              color: canSendLink ? "#000" : "#999",
              textDecoration: "underline",
              cursor: sendingLink || !canSendLink ? "default" : "pointer",
            }}
          >
            {sendingLink ? "Sender…" : "Send mig et login-link på mail"}
          </button>
        </div>
      </form>
    </div>
  );
}
