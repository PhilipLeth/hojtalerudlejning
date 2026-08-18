"use client";

/* ───── Sikkerhedskopier ─────
 *
 * KV har ingen fortryd. Kopien tages automatisk hver nat, men den skal kunne
 * ses: en backup man ikke kan bekræfte eksistensen af, er ikke en backup.
 */

import { useCallback, useEffect, useState } from "react";
import { adminFetch, getAdminToken } from "@/lib/useAdminAuth";

interface BackupFile {
  key: string;
  size: number;
  uploaded: string;
  keys?: string;
}

function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function BackupPanel({ secret }: { secret: string }) {
  const [files, setFiles] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    const r = await adminFetch("/api/backup", secret);
    setLoading(false);
    if ("error" in r) {
      setError(r.error);
      return;
    }
    if (!r.res.ok) {
      setError(String(r.data.error || "Kunne ikke hente listen"));
      return;
    }
    setFiles((r.data.files as BackupFile[]) ?? []);
    setError("");
  }, [secret]);

  useEffect(() => {
    load();
  }, [load]);

  async function runNow() {
    setRunning(true);
    setError("");
    setNotice("");
    const r = await adminFetch("/api/backup", secret, { method: "POST" });
    setRunning(false);
    if ("error" in r) {
      setError(r.error);
      return;
    }
    if (!r.res.ok) {
      setError(String(r.data.error || "Kopien fejlede"));
      return;
    }
    setNotice(`Kopi taget: ${r.data.keys} nøgler, ${size(Number(r.data.size) || 0)}`);
    await load();
  }

  const newest = files[0];
  const stale = newest ? Date.now() - new Date(newest.uploaded).getTime() > 48 * 3600 * 1000 : false;

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "10px", padding: "14px 16px", marginBottom: "18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
        <strong style={{ fontSize: "14px" }}>Sikkerhedskopier</strong>
        <button
          onClick={runNow}
          disabled={running}
          style={{ marginLeft: "auto", padding: "6px 12px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", background: "#fff", color: "#111", cursor: "pointer" }}
        >
          {running ? "Tager kopi…" : "Tag en kopi nu"}
        </button>
      </div>

      <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#888", lineHeight: 1.5 }}>
        Alle ordrer, betalinger, fakturanumre og indstillinger gemmes som én fil hver nat kl. 3.30 og
        opbevares i 90 dage. Filerne ligger i jeres egen R2-bucket og kan kun hentes her, når du er logget ind.
      </p>

      {error && (
        <div style={{ background: "#fdecea", color: "#c0392b", padding: "8px 11px", borderRadius: "7px", fontSize: "12px", marginBottom: "10px" }}>
          {error}
        </div>
      )}
      {notice && (
        <div style={{ background: "#eaf6ec", color: "#2f7a4d", padding: "8px 11px", borderRadius: "7px", fontSize: "12px", marginBottom: "10px" }}>
          {notice}
        </div>
      )}
      {stale && (
        <div style={{ background: "#fdf6df", color: "#7a5c00", padding: "8px 11px", borderRadius: "7px", fontSize: "12px", marginBottom: "10px" }}>
          Nyeste kopi er over to døgn gammel — det natlige job er måske holdt op med at køre.
        </div>
      )}

      {loading && files.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>Henter…</p>
      ) : files.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#c0392b", margin: 0 }}>
          Der findes ingen kopier endnu. Tryk »Tag en kopi nu«.
        </p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: "12px" }}>
          {files.slice(0, 10).map((f) => (
            <li key={f.key} style={{ display: "flex", gap: "8px", alignItems: "baseline", padding: "3px 0", borderBottom: "1px solid #f5f5f5" }}>
              <a
                href={`/api/backup?file=${encodeURIComponent(f.key)}&secret=${encodeURIComponent(getAdminToken())}`}
                style={{ color: "#0070f3", textDecoration: "none", fontWeight: 600 }}
              >
                {f.key.replace("backups/", "").replace(".json", "")}
              </a>
              <span style={{ color: "#aaa" }}>
                {size(f.size)}
                {f.keys ? ` · ${f.keys} nøgler` : ""}
              </span>
              <span style={{ marginLeft: "auto", color: "#ccc" }}>
                {new Date(f.uploaded).toLocaleString("da-DK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
