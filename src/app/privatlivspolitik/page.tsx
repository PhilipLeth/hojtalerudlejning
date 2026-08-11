import { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privatlivspolitik | Lejhøjtaler.dk",
  description:
    "Sådan behandler Lejhøjtaler.dk dine personoplysninger: hvad vi indsamler, hvorfor, hvor længe vi gemmer det, og hvilke rettigheder du har efter GDPR.",
  alternates: { canonical: "https://lejhojtaler.dk/privatlivspolitik" },
  robots: { index: true, follow: true },
};

const UPDATED = "5. august 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-bold text-white sm:text-2xl">{title}</h2>
      <div className="space-y-3 text-white/60">{children}</div>
    </section>
  );
}

export default function PrivatlivspolitikPage() {
  return (
    <>
      <main className="relative z-20 min-h-screen bg-[#07060b]">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-400">
            Lejhøjtaler.dk
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Privatlivspolitik</h1>
          <p className="mt-4 text-white/40">Senest opdateret {UPDATED}</p>

          <div className="mt-12">
            <Section title="Hvem er dataansvarlig?">
              <p>
                Scharling Studio (CVR 40994904), Halvtolv 9, 1. th, 1436 København K, er
                dataansvarlig for de personoplysninger, du giver os på lejhojtaler.dk.
              </p>
              <p>
                Har du spørgsmål til vores behandling af dine oplysninger, kan du skrive til{" "}
                <a href="mailto:info@lejhojtaler.dk" className="text-brand-400 hover:underline">
                  info@lejhojtaler.dk
                </a>{" "}
                eller ringe på{" "}
                <a href="tel:+4531132852" className="text-brand-400 hover:underline">
                  31 13 28 52
                </a>
                .
              </p>
            </Section>

            <Section title="Hvilke oplysninger indsamler vi?">
              <p>Når du booker udstyr, beder vi om:</p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Navn, e-mailadresse og telefonnummer</li>
                <li>Leveringsadresse, hvis du vælger levering</li>
                <li>Din bestilling: udstyr, datoer og eventuel kommentar</li>
              </ul>
              <p>
                Betaler du online, håndteres kortoplysningerne af Stripe. Vi ser og gemmer
                aldrig dit kortnummer.
              </p>
              <p>
                Vi bruger desuden Google Analytics og Google Tag Manager til statistik om
                brugen af sitet. Disse data er ikke knyttet til dit navn.
              </p>
            </Section>

            <Section title="Hvorfor og på hvilket grundlag?">
              <ul className="ml-5 list-disc space-y-2">
                <li>
                  <strong className="text-white/80">For at gennemføre din booking</strong> — navn,
                  kontaktoplysninger og bestilling. Grundlag: opfyldelse af aftalen med dig
                  (databeskyttelsesforordningens art. 6, stk. 1, litra b).
                </li>
                <li>
                  <strong className="text-white/80">For at sende dig bekræftelse og praktisk
                  information</strong> om afhentning og aflevering. Grundlag: aftalen med dig.
                </li>
                <li>
                  <strong className="text-white/80">For at bogføre lejeaftalen</strong>. Grundlag:
                  retlig forpligtelse efter bogføringsloven (art. 6, stk. 1, litra c).
                </li>
                <li>
                  <strong className="text-white/80">For at sende nyhedsbrev og tilbud</strong> —
                  kun hvis du aktivt har sat flueben. Grundlag: dit samtykke (art. 6, stk. 1,
                  litra a). Du kan altid trække samtykket tilbage.
                </li>
                <li>
                  <strong className="text-white/80">For at bede om en anmeldelse</strong> efter endt
                  leje. Grundlag: vores legitime interesse i at få feedback (art. 6, stk. 1,
                  litra f).
                </li>
              </ul>
            </Section>

            <Section title="Hvor længe gemmer vi dine oplysninger?">
              <ul className="ml-5 list-disc space-y-1">
                <li>Bookinger og lejeaftaler: 5 år efter regnskabsårets udløb (bogføringsloven)</li>
                <li>Henvendelser på mail og telefon: op til 2 år</li>
                <li>Nyhedsbrev: indtil du melder dig fra</li>
              </ul>
            </Section>

            <Section title="Hvem deler vi oplysninger med?">
              <p>
                Vi sælger aldrig dine oplysninger. Vi bruger følgende databehandlere, som kun
                må behandle data efter vores instruks:
              </p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Cloudflare — hosting og drift af sitet</li>
                <li>Resend — udsendelse af bekræftelses- og servicemails</li>
                <li>Stripe — betalingsafvikling, hvis du betaler online</li>
                <li>Google — statistik om brugen af sitet</li>
              </ul>
            </Section>

            <Section title="Dine rettigheder">
              <p>Du har efter databeskyttelsesforordningen ret til at:</p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Få indsigt i, hvilke oplysninger vi har om dig</li>
                <li>Få rettet forkerte oplysninger</li>
                <li>Få slettet dine oplysninger, når vi ikke længere har pligt til at gemme dem</li>
                <li>Gøre indsigelse mod behandlingen</li>
                <li>Få dine oplysninger udleveret i et almindeligt format (dataportabilitet)</li>
                <li>Trække et samtykke tilbage — det påvirker ikke behandlingen frem til da</li>
              </ul>
              <p>
                Skriv til{" "}
                <a href="mailto:info@lejhojtaler.dk" className="text-brand-400 hover:underline">
                  info@lejhojtaler.dk
                </a>
                , så svarer vi inden for en måned.
              </p>
            </Section>

            <Section title="Klage">
              <p>
                Er du utilfreds med vores behandling af dine oplysninger, kan du klage til
                Datatilsynet, Carl Jacobsens Vej 35, 2500 Valby —{" "}
                <a
                  href="https://www.datatilsynet.dk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:underline"
                >
                  datatilsynet.dk
                </a>
                .
              </p>
            </Section>

            <p className="mt-12 text-sm text-white/40">
              Se også vores{" "}
              <Link href="/lejevilkaar" className="text-brand-400 hover:underline">
                lejevilkår
              </Link>
              .
            </p>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
