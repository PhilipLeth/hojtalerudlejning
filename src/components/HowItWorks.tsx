const steps = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    title: "1. Vælg og book",
    text: "Vælg højtaler, periode og tilvalg. Udfyld dine oplysninger og send booking.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    title: "2. Hent din højtaler",
    text: "Hent på Halvtolv 9, København K i en padded sportstaske med alle kabler (iPhone, USB-C, AUX). Fredag kl. 14-18 eller efter aftale.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
      </svg>
    ),
    title: "3. Fest!",
    text: "Kraftig lyd til op til 100 personer. Tilkøb lys-pakke for den fulde oplevelse.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    ),
    title: "4. Aflever mandag",
    text: "Aflever udstyret mandag kl. 15-17. Betaling ved afhentning (MobilePay eller kontant).",
  },
];

export default function HowItWorks() {
  return (
    <section id="about" className="relative z-20 mx-auto max-w-4xl px-4 py-24">
      <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
        Sådan lejer du en højtaler i København
      </h2>
      <p className="mx-auto mb-6 max-w-2xl text-center text-white/50">
        At leje en højtaler behøver ikke være besværligt. Hos os booker du
        online, henter dit lydudstyr på vores adresse i indre København og
        afleverer igen efter festen. Ingen depositum, ingen lange kontrakter.
      </p>
      <p className="mx-auto mb-16 max-w-2xl text-center text-sm text-white/35">
        Vi udlejer PA-anlæg og festudstyr til private fester, firmaarrangementer
        og events i hele Københavnsområdet. Vores højtalere leveres med alle
        kabler, så du kan tilslutte din telefon med det samme og komme i gang.
      </p>

      <div className="grid gap-8 sm:grid-cols-2">
        {steps.map((s, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="mb-4 inline-flex rounded-xl bg-brand-600/20 p-3 text-brand-400">
              {s.icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
            <p className="text-sm leading-relaxed text-white/60">{s.text}</p>
          </div>
        ))}
      </div>

      {/* Opening hours */}
      <div className="mt-16 glass rounded-2xl p-8 text-center">
        <h3 className="mb-4 text-xl font-semibold">Åbningstider</h3>
        <div className="flex flex-col gap-2 text-white/70">
          <p>
            <span className="font-medium text-white">Fredag:</span> 14:00 –
            18:00 (afhentning)
          </p>
          <p>
            <span className="font-medium text-white">Mandag:</span> 15:00 –
            17:00 (aflevering)
          </p>
          <p className="mt-2 text-sm text-white/40">
            Andre tidspunkter efter aftale — skriv i kommentarfeltet ved booking.
          </p>
        </div>
      </div>
    </section>
  );
}
