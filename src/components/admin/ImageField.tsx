"use client";

import { useRef, useState } from "react";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666",
  marginBottom: "4px",
};

export default function ImageField({
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
    setUploading(true);
    try {
      const secret = localStorage.getItem("admin_secret") ?? "";
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/upload?secret=${encodeURIComponent(secret)}`, {
        method: "POST",
        body: fd,
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.size > 500_000) {
      setUploadError("Filen er for stor — max 500 kB");
      return;
    }
    handleFile(file);
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>

      {/* Drop zone / upload button */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: "2px dashed #ddd",
          borderRadius: "8px",
          padding: "12px 16px",
          textAlign: "center",
          cursor: "pointer",
          background: "#fafafa",
          transition: "border-color 0.15s",
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
          <span>Uploader...</span>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>
              Klik eller træk billede hertil
              <span style={{ display: "block", fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
                Max 500 kB · JPG, PNG, WebP
              </span>
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 500_000) {
            setUploadError("Filen er for stor — max 500 kB");
            return;
          }
          handleFile(file);
          e.target.value = "";
        }}
      />

      {uploadError && (
        <p style={{ color: "#dc3545", fontSize: "12px", margin: "4px 0 0" }}>{uploadError}</p>
      )}

      {/* Preview */}
      {value && (
        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            style={{ maxHeight: "56px", maxWidth: "80px", objectFit: "contain", borderRadius: "6px", border: "1px solid #eee" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span style={{ fontSize: "12px", color: "#888", wordBreak: "break-all", flex: 1 }}>{value}</span>
        </div>
      )}
    </div>
  );
}
