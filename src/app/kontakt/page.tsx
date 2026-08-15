import { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import PhoneLink, { PhoneText } from "@/components/PhoneLink";

export const metadata: Metadata = {
  title: "Kontakt os | Lejhøjtaler.dk",
  description:
    "Kontakt Lejhøjtaler.dk — skriv til info@lejhojtaler.dk, ring eller brug formularen. Vi svarer som regel samme dag.",
  alternates: { canonical: "https://lejhojtaler.dk/kontakt" },
};

export default function KontaktPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-4xl font-bold">Kontakt os</h1>
      <p className="mt-3 text-white/60">
        Spørgsmål om udstyr, datoer eller noget helt tredje? Skriv eller ring — vi svarer som regel samme dag.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a
          href="mailto:info@lejhojtaler.dk"
          className="glass flex items-center gap-3 rounded-2xl p-4 transition hover:bg-white/5"
        >
          <span className="text-2xl">✉️</span>
          <span>
            <span className="block text-sm text-white/50">Email</span>
            <span className="font-semibold text-brand-400">info@lejhojtaler.dk</span>
          </span>
        </a>
        <PhoneLink hideNumber className="glass flex items-center gap-3 rounded-2xl p-4 transition hover:bg-white/5">
          <span className="text-2xl">📞</span>
          <span>
            <span className="block text-sm text-white/50">Telefon</span>
            <span className="font-semibold text-brand-400">
              <PhoneText />
            </span>
          </span>
        </PhoneLink>
      </div>

      <div className="mt-8">
        <ContactForm />
      </div>

      <p className="mt-8 text-sm text-white/40">
        Afhentning: Halvtolv 9, 1. th, 1436 København K · Fredag 14–18, aflevering mandag 15–17 · CVR 40994904
      </p>
    </section>
  );
}
