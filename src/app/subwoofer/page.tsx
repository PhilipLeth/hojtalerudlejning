import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";

export const metadata: Metadata = {
  title: 'Lej Subwoofer 12" København | 295 kr | Lejhøjtaler.dk',
  description:
    'Lej en Behringer 12" aktiv subwoofer i København fra 295 kr/weekend. Giver festen den dybe bas — passer til alle vores højtalerpakker. Book online på 2 min.',
  keywords: [
    "lej subwoofer",
    "subwoofer leje københavn",
    "behringer subwoofer leje",
    "lej bas til fest",
    "aktiv subwoofer udlejning",
  ],
  alternates: { canonical: "https://lejhojtaler.dk/subwoofer" },
  openGraph: {
    title: 'Lej Subwoofer 12" København | 295 kr',
    description:
      'Behringer 12" aktiv subwoofer — den dybe bas til festen. Passer til alle vores højtalerpakker. Book online.',
    url: "https://lejhojtaler.dk/subwoofer",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      slug="subwoofer"
      name={'Subwoofer 12"'}
      price={295}
      headline="Lej subwoofer i København"
      sub={'Behringer 12" aktiv subwoofer — den dybe bas der får festen til at sidde i kroppen.'}
      image="/images/product-subwoofer-v2.png"
      imageAlt={'Behringer 12" aktiv subwoofer til leje i København'}
      productId="subwoofer"
      bullets={[
        'Behringer 12" aktiv subwoofer med indbygget forstærker',
        "Tilføjer dyb bas til alle vores højtalerpakker",
        "Strøm- og signalkabler medfølger",
        "Klar på 5 minutter — bare sæt den mellem højtalerne",
        "Perfekt til dans, DJ og fester over 40 personer",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-4 text-2xl font-bold">Hvornår giver en subwoofer mening?</h2>
          <p className="mb-4 text-white/50">
            Vores højtalerpakker spiller flot og højt i sig selv — men de gengiver ikke de
            dybeste basfrekvenser. Skal der danses til hiphop, house eller andet med tryk i,
            er det subwooferen der giver den fysiske fornemmelse af bas.
          </p>
          <p className="text-white/50">
            Tilvælg den direkte i bookingen sammen med din højtalerpakke — så står den klar
            til afhentning sammen med resten af udstyret.
          </p>
        </div>
      </section>
    </ProductLanding>
  );
}
