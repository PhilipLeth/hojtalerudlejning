"use client";

import { useEffect, useState, useRef } from "react";

export default function ExitIntent() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const fired = useRef(false);

  useEffect(() => {
    // Don't show if already shown this session
    if (sessionStorage.getItem("exitIntentShown")) return;

    const show = () => {
      if (fired.current) return;

      // Don't show if user scrolled past 50% (likely engaged with booking)
      const scrollPct =
        window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPct > 0.5) return;

      fired.current = true;
      sessionStorage.setItem("exitIntentShown", "1");
      setVisible(true);
    };

    // Desktop: mouse leaves viewport
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY < 0) show();
    };
    document.addEventListener("mouseout", handleMouseOut);

    // Mobile: 45-second timer
    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || "ontouchstart" in window);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isMobile) {
      timer = setTimeout(show, 45_000);
    }

    return () => {
      document.removeEventListener("mouseout", handleMouseOut);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    localStorage.setItem("newsletterSignup", email);
    setSubmitted(true);
    setTimeout(() => setVisible(false), 2200);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setVisible(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative mx-4 w-full max-w-sm animate-pop-in rounded-2xl border border-white/10 bg-[#0d0c12]/95 p-8 shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
          aria-label="Luk"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {submitted ? (
          <p className="py-6 text-center text-lg font-semibold text-brand-400">
            Tak! Vi skriver snart.
          </p>
        ) : (
          <>
            <h2 className="mb-2 text-xl font-bold text-white">
              Vent! Få 10% på din første leje
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-white/60">
              Tilmeld dig vores nyhedsbrev og få en rabatkode.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Din email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-400"
              >
                Få rabat
              </button>
            </form>
            <button
              onClick={() => setVisible(false)}
              className="mt-3 w-full text-center text-sm text-white/40 transition hover:text-white/60"
            >
              Nej tak
            </button>
          </>
        )}
      </div>

    </div>
  );
}
