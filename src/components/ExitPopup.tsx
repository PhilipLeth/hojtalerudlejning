"use client";

import { useState, useEffect, useCallback } from "react";

export default function ExitPopup({ locale = "da" }: { locale?: "da" | "en" }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const heading = locale === "da" ? "Vent! Faa 10% paa din foerste leje" : "Wait! Get 10% off your first rental";
  const desc = locale === "da"
    ? "Tilmeld dig vores nyhedsbrev og faa en rabatkode."
    : "Subscribe to our newsletter and get a discount code.";
  const placeholder = locale === "da" ? "Din email" : "Your email";
  const btnText = locale === "da" ? "Faa rabat" : "Get discount";
  const doneText = locale === "da" ? "Tjek din indbakke!" : "Check your inbox!";
  const closeText = locale === "da" ? "Nej tak" : "No thanks";

  const handleExit = useCallback((e: MouseEvent) => {
    if (e.clientY < 5) {
      setShow(true);
      document.removeEventListener("mouseout", handleExit);
    }
  }, []);

  useEffect(() => {
    // Don't show if already dismissed or subscribed
    if (sessionStorage.getItem("exit_popup_shown")) return;

    // Wait 5 seconds before arming
    const timer = setTimeout(() => {
      document.addEventListener("mouseout", handleExit);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", handleExit);
    };
  }, [handleExit]);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem("exit_popup_shown", "1");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setStatus("done");
      sessionStorage.setItem("exit_popup_shown", "1");
    } catch {
      setStatus("done");
    }
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-[#111] border border-white/10 p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-white/30 hover:text-white text-xl leading-none"
          aria-label="Luk"
        >
          &times;
        </button>

        {status === "done" ? (
          <>
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-lg font-bold text-white">{doneText}</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">🔊</div>
            <h2 className="text-lg font-bold text-white mb-2">{heading}</h2>
            <p className="text-sm text-white/50 mb-6">{desc}</p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand-400/50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-400 transition disabled:opacity-50"
              >
                {status === "loading" ? "..." : btnText}
              </button>
            </form>
            <button
              onClick={handleClose}
              className="mt-4 text-xs text-white/30 hover:text-white/50 transition"
            >
              {closeText}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
