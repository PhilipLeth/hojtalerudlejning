import { type Locale, t } from "@/lib/i18n";

export default function Hero({ locale = "da" }: { locale?: Locale }) {
  const s = t[locale].hero;
  return (
    <section className="hero-section relative flex min-h-[85vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
      {/* Fixed background image */}
      <div
        role="img"
        aria-label="Festscenemning med lyd og lys i København"
        className="fixed inset-0 bg-cover bg-center opacity-55"
        style={{ backgroundImage: "url(/images/hero.png)" }}
      />
      {/* Gradient overlays */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[120px]" />

      <div className="relative z-10 max-w-2xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
          {s.location}
        </p>
        <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
          {s.title}
          <br />
          <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
            {s.titleHighlight}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
          {s.subtitle}
        </p>

        <a
          href="#book"
          className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
        >
          {s.cta}
        </a>

        {/* Urgency + phone on one line */}
        <div className="mx-auto mt-5 flex items-center justify-center gap-3 text-sm text-white/50">
          <span className="inline-flex items-center gap-1.5 text-orange-300">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
            </span>
            {s.urgency}
          </span>
          <span className="text-white/20">|</span>
          <a href="tel:+4550150731" className="inline-flex items-center gap-1 transition hover:text-brand-400">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {s.phone}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-bounce text-white/30">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
