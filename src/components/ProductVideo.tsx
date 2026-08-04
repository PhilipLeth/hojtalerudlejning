"use client";

import { useEffect, useState } from "react";
import { useProducts } from "@/lib/useProducts";

/**
 * Play-knap over produktbilledet når produktet har en video i kataloget
 * (uploadet fra /admin/produkter). Klik åbner en modal med afspilleren.
 * Renderer intet hvis produktet ikke har video.
 */
export default function ProductVideo({ productId, name }: { productId: string; name: string }) {
  const { speakers, addons, rentalProducts } = useProducts();
  const [open, setOpen] = useState(false);

  const video =
    speakers.find((p) => p.id === productId)?.video ??
    rentalProducts.find((p) => p.id === productId)?.video ??
    addons.find((a) => a.id === productId)?.video;

  // Luk på Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!video) return null;

  return (
    <>
      <button
        type="button"
        aria-label={`Se video af ${name}`}
        onClick={() => setOpen(true)}
        className="group/video absolute inset-0 z-10 flex cursor-pointer items-center justify-center"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-black/60 text-white shadow-lg backdrop-blur-sm transition duration-200 group-hover/video:scale-110 group-hover/video:bg-brand-500 group-hover/video:text-black">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5-11-6.5z" />
          </svg>
        </span>
        <span className="absolute bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          Se video
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Video af ${name}`}
        >
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Luk video"
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={video}
              controls
              autoPlay
              playsInline
              className="w-full rounded-2xl bg-black shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
