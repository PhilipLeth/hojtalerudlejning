"use client";

/**
 * /tilbud?id=X — kundens tilbud. Sitet er en statisk eksport, så id'et står i
 * query'en, og tilbuddet hentes i browseren.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import TilbudDokument from "./TilbudDokument";
import { useProducts } from "@/lib/useProducts";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { formatAddress } from "@/lib/siteInfo";
import { tilbudBookSti, type Tilbud } from "@/lib/tilbud";

type Locale = "da" | "en";

const TEKST = {
  da: { henter: "Henter tilbuddet …", ukendt: "Vi kan ikke finde tilbuddet", ukendtTekst: "Linket er måske ufuldstændigt. Ring eller skriv, så sender vi det igen.", print: "Gem som PDF", book: "Book og betal", forside: "Til forsiden" },
  en: { henter: "Loading the offer …", ukendt: "We can't find this offer", ukendtTekst: "The link may be incomplete. Call or write to us and we will send it again.", print: "Save as PDF", book: "Book and pay", forside: "Home" },
};

export function useKontakt() {
  const site = useSiteSettings();
  return {
    telefon: site.display,
    telefonHref: site.href,
    email: site.company.email.split(",")[0].trim(),
    firma: site.company.name,
    cvr: site.company.cvr,
    adresse: formatAddress(site.company),
  };
}

export default function TilbudSide({ locale }: { locale: Locale }) {
  const s = TEKST[locale];
  const katalog = useProducts();
  const kontakt = useKontakt();
  const [tilbud, setTilbud] = useState<Tilbud | null>(null);
  const [fejl, setFejl] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      setFejl(true);
      return;
    }
    fetch(`/api/tilbud?id=${encodeURIComponent(id)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        const data = (await r.json()) as { tilbud?: Tilbud };
        if (!data.tilbud) throw new Error("tomt");
        setTilbud(data.tilbud);
        document.title = `${locale === "en" ? "Offer" : "Tilbud"} ${data.tilbud.nr}: ${data.tilbud.titel || "Lejhøjtaler.dk"}`;
      })
      .catch(() => setFejl(true));
  }, [locale]);

  // Tilbuddet er skrevet på ét sprog; åbner kunden det på det andet, viser vi
  // det på det sprog, det blev skrevet på
  const visning = tilbud;

  return (
    <main className="min-h-screen bg-[#e9ebf0] px-3 pb-24 pt-4 text-[#11131a] print:bg-white print:p-0 sm:px-6">
      <div className="mx-auto mb-4 flex max-w-[820px] items-center justify-between gap-3 print:hidden">
        <Link href={locale === "en" ? "/en" : "/"} className="text-sm text-[#4a4f5c] hover:text-[#1249cf]">
          ← {s.forside}
        </Link>
        {visning && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-[#c9ccd6] bg-white px-4 py-2 text-sm font-semibold text-[#2a2d38] transition hover:border-[#1249cf] hover:text-[#1249cf]"
            >
              {s.print}
            </button>
            {visning.status !== "booket" && (
              <a href={tilbudBookSti(visning.id, visning.locale)} className="rounded-full bg-[#1249cf] px-4 py-2 text-sm font-bold text-[#fff] transition hover:bg-[#225cdb]">
                {s.book} →
              </a>
            )}
          </div>
        )}
      </div>

      {!visning && !fejl && <p className="py-32 text-center text-[#7a7f8c]">{s.henter}</p>}
      {fejl && (
        <div className="mx-auto max-w-md py-32 text-center">
          <h1 className="text-2xl font-bold">{s.ukendt}</h1>
          <p className="mt-2 text-[#6b7080]">{s.ukendtTekst}</p>
          <p className="mt-4">
            <a href={kontakt.telefonHref} className="font-semibold text-[#1249cf]">{kontakt.telefon}</a> ·{" "}
            <a href={`mailto:${kontakt.email}`} className="font-semibold text-[#1249cf]">{kontakt.email}</a>
          </p>
        </div>
      )}
      {visning && <TilbudDokument tilbud={visning} katalog={katalog} kontakt={kontakt} />}
    </main>
  );
}
