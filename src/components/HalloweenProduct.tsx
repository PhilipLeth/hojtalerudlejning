import ProductLanding from "@/components/ProductLanding";
import Link from "next/link";
import { rentalProducts } from "@/lib/products";
import { localizedHref } from "@/lib/enPages";
import type { Locale } from "@/lib/i18n";

/** Fælles pakkeside: navn, indhold og pris kommer fra kataloget på begge sprog. */
export default function HalloweenProduct({ productId, locale = "da" }: { productId: string; locale?: Locale }) {
  const p = rentalProducts.find(product => product.id === productId)!;
  const en = locale === "en";
  const name = en ? p.name_en : p.name_da;
  return (
    <ProductLanding
      locale={locale}
      slug={p.page!.slice(1)}
      productId={p.id}
      name={name}
      headline={en ? `${name}, Halloween party rental` : `${name}, din Halloween-pakke`}
      price={p.price}
      sub={(en ? p.desc_en : p.desc_da)!}
      image={p.image}
      imageAlt={en ? "Halloween atmosphere illustration with pumpkins, purple light and fog; decorations are not included" : "Halloween-stemningsillustration med græskar, violet lys og røg; pynt medfølger ikke"}
      bullets={[
        ...p.bundle!.parts.map(part => en ? part.label_en : part.label_da),
        en ? "All cables included. One price for up to 5 rental days." : "Alle kabler med. Én pris for op til 5 dages leje.",
        en ? "Collect in Copenhagen S or add delivery at checkout." : "Hent i København S eller tilvælg levering i bookingen.",
        en ? "Atmosphere illustration. Pumpkins and decorations are not included." : "Stemningsillustration. Græskar og pynt medfølger ikke.",
      ]}
      faqExtra={[
        { q: en ? "Can I use the fog machine at any venue?" : "Kan jeg bruge røgmaskinen alle steder?", a: en ? "Ask your venue before using fog: it can activate smoke alarms. Follow the machine’s instructions and the venue’s rules." : "Aftal det med feststedet først: røg kan aktivere røgalarmer. Følg maskinens vejledning og stedets regler." },
        { q: en ? "Do I need to provide music?" : "Skal jeg selv sørge for musik?", a: en ? "Yes. The speaker packages connect to your own playlist via Bluetooth. Every Halloween package now includes a speaker." : "Ja. Pakkerne med højtalere tilsluttes din egen playliste via Bluetooth. Alle Halloween-pakker indeholder nu en højtaler." },
      ]}
    >
      <section className="mx-auto max-w-4xl px-5 pb-14 text-center">
        <h2 className="mb-6 text-2xl font-bold">{en ? "Explore the other Halloween packages" : "Se de andre Halloween-pakker"}</h2>
        <div className="flex flex-wrap justify-center gap-5">
          {rentalProducts.filter(other => other.id.startsWith("halloween_") && other.id !== p.id).map(other => (
            <Link key={other.id} href={localizedHref(other.page!, locale)} className="rounded-full border border-orange-300/40 px-6 py-3 text-orange-200 hover:bg-orange-300/10">
              {en ? other.name_en : other.name_da}
            </Link>
          ))}
        </div>
      </section>
    </ProductLanding>
  );
}
