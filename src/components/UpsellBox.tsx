import Link from "next/link";

/**
 * "Kombiner med…"-boksen nederst på en produktside.
 *
 * Ni produktsider havde hver sin håndbyggede udgave af nøjagtig samme boks —
 * samme glass-kort, samme knapper, forskellig tekst. Da de blev lagt om til
 * ProductLanding, var det den eneste del, der ikke passede ind i komponenten,
 * så den fik sin egen i stedet for at blive kopieret ind som rå JSX ni gange.
 *
 * Sendes til ProductLanding som children.
 */
export default function UpsellBox({
  title,
  text,
  links,
}: {
  title: string;
  text: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-24">
      <div className="glass rounded-2xl p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
        <p className="mx-auto mb-6 max-w-md text-white/50">{text}</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
