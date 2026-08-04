"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 100_000_000; // 100 MB
const ALLOWED = ["video/mp4", "video/webm", "video/quicktime"];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666",
  marginBottom: "4px",
};

/** Video-upload til produkter (instruktioner/demo). Rå body → R2 via /api/upload-video. */
export default function VideoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFile = async (file: File) => {
    setUploadError("");
    if (!ALLOWED.includes(file.type)) {
      setUploadError("Kun video — MP4, WebM eller MOV");
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError("Videoen er for stor — max 100 MB");
      return;
    }
    setUploading(true);
    try {
      const secret = localStorage.getItem("admin_secret") ?? "";
      // Rå body (ikke multipart) så filen streames direkte til R2
      const res = await fetch(`/api/upload-video?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload fejlede");
        return;
      }
      onChange(data.url);
    } catch {
      setUploadError("Netværksfejl ved upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>

      <div
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: "2px dashed #ddd",
          borderRadius: "8px",
          padding: "12px 16px",
          textAlign: "center",
          cursor: "pointer",
          background: "#fafafa",
          fontSize: "13px",
          color: "#888",
          minHeight: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {uploading ? (
          <span>Uploader video... (kan tage et øjeblik)</span>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>
              Klik eller træk video hertil
              <span style={{ display: "block", fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
                Max 100 MB · MP4, WebM, MOV
              </span>
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {uploadError && (
        <p style={{ color: "#dc3545", fontSize: "12px", margin: "4px 0 0" }}>{uploadError}</p>
      )}

      {value && (
        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <video
            src={value}
            style={{ maxHeight: "56px", maxWidth: "100px", borderRadius: "6px", border: "1px solid #eee", background: "#000" }}
            muted
            playsInline
          />
          <span style={{ fontSize: "12px", color: "#888", wordBreak: "break-all", flex: 1 }}>{value}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ padding: "2px 10px", fontSize: "12px", background: "#fff", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", color: "#c0392b" }}
          >
            Fjern
          </button>
        </div>
      )}
    </div>
  );
}
