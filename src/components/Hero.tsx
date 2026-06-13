import { type Locale, t } from "@/lib/i18n";

export default function Hero({ locale = "da" }: { locale?: Locale }) {
  const s = t[locale].hero;
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
      {/* Fixed background image */}
      <div
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
          <br />
          {s.subtitleLine2}
        </p>
        <a
          href="#book"
          className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
        >
          {s.cta}
        </a>
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
