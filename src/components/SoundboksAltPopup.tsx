"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "soundboks_mackie_popup_dismissed";

/** Popup on Soundboks-page: henvisning til Mackie Thump GO */
export default function SoundboksAltPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#111] p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 text-xl leading-none text-white/30 hover:text-white"
          aria-label="Luk"
        >
          &times;
        </button>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-400">
          Tip
        </p>
        <h2 className="mb-3 text-xl font-bold text-white">
          Overvej Mackie Thump GO
        </h2>
        <p className="mb-6 text-sm text-white/50">
          Billigere batterihøjtaler — mobil, let at tage med, og ofte nok til de fleste fester. Fra 350 kr.
        </p>
        <Link
          href="/mackie-thump-go"
          onClick={dismiss}
          className="inline-block w-full rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400"
        >
          Se Mackie Thump GO
        </Link>
        <button
          onClick={dismiss}
          className="mt-3 w-full text-sm text-white/40 transition hover:text-white/60"
        >
          Nej tak, jeg vil have Soundboks
        </button>
      </div>
    </div>
  );
}
