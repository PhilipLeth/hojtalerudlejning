import Link from "next/link";
import LivePrice, { LiveStartPrice } from "@/components/LivePrice";

/**
 * "Kombiner med…"-boksen nederst på en produktside.
 *
 * Ni produktsider havde hver sin håndbyggede udgave af nøjagtig samme boks —
 * samme glass-kort, samme knapper, forskellig tekst. Da de blev lagt om til
 * ProductLanding, var det den eneste del, der ikke passede ind i komponenten,
 * så den fik sin egen i stedet for at blive kopieret ind som rå JSX ni gange.
 *
 * Sendes til ProductLanding som children.
 *
 * Prisen på knappen skrives ikke ind i `label` — den slås op i kataloget via
 * `priceId`. Ellers står "Se røgmaskine – 245 kr" tilbage, når røgmaskinen er
 * steget til 595, og knappen lover en pris, bookingen ikke kender.
 */
export default function UpsellBox({
  title,
  text,
  links,
}: {
  title: string;
  text: string;
  links: Array<{
    href: string;
    label: string;
    /** Produkt-id — prisen hentes fra kataloget og skrives efter label'en. */
    priceId?: string;
    /** "fra 295 kr" i stedet for "295 kr" — når produktet har flere varianter. */
    fra?: boolean;
    /** Knap til en kategoriside: "fra X kr" hvor X er billigste højtaler. */
    startpris?: boolean;
  }>;
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
              {l.priceId && (
                <>
                  {" – "}
                  <LivePrice productId={l.priceId} prefix={l.fra ? "fra " : ""} suffix=" kr" />
                </>
              )}
              {l.startpris && (
                <>
                  {" – "}
                  <LiveStartPrice />
                </>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
