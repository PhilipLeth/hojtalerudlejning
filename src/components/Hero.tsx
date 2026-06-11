export default function Hero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url(/images/hero.png)" }}
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07060b]/60 via-transparent to-[#07060b]" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-brand-600/15 blur-[120px]" />

      <div className="relative z-10 max-w-2xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
          København
        </p>
        <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
          Lej en højtaler
          <br />
          <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
            fra 400 kr
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
          Kraftig lyd til din fest. Hent fredag, aflever mandag.
          <br />
          Book online på 2 minutter.
        </p>
        <a
          href="#book"
          className="mt-8 inline-block rounded-full bg-brand-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-brand-500 active:scale-95"
        >
          Book nu
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
