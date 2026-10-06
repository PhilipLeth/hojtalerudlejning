"use client";

/**
 * /admin/tilbud — byg et tilbud på et par minutter.
 *
 * Venstre side er en shop: hele kataloget, søgning, faner og hurtigknapper til
 * tekniker, kørsel og forbrugsmaterialer, og kurven nederst med − antal +.
 * Højre side er tilbuddet, præcis som kunden får det (samme komponent).
 *
 * Et tilbud er en kurv med id'er og antal, ikke et dokument med priser.
 * Kunden åbner det fra mailen eller QR-koden, og det ligger i den rigtige
 * kurv, hvor han kan rette det og betale. Se src/lib/tilbud.ts.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import TilbudDokument, { kr, periodeTekst } from "@/components/TilbudDokument";
import { useKontakt } from "@/components/TilbudSide";
import TilbudBilleder from "@/components/admin/TilbudBilleder";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { useProducts } from "@/lib/useProducts";
import { useIsMobile } from "@/lib/useIsMobile";
import { thumbSrcSet, THUMB_IMAGE_SIZES } from "@/lib/imageSrcSet";
import { DELIVERY_ADDON_IDS } from "@/lib/products";
import {
  FORBRUG_ID,
  STANDARD_FORSIDE,
  TEKNIKER_ID,
  TILBUD_GYLDIG_DAGE,
  findVare,
  iDag,
  kanTilbydes,
  plusDage,
  prissaet,
  standardIntro,
  tilbudBookSti,
  tilbudSti,
  type Tilbud,
  type TilbudResume,
  type TilbudStatus,
  type TilbudVare,
} from "@/lib/tilbud";

type Kladde = Omit<Tilbud, "id" | "nr" | "oprettet" | "opdateret"> & Partial<Pick<Tilbud, "id" | "nr" | "oprettet" | "opdateret">>;

function tomKladde(): Kladde {
  return {
    status: "kladde",
    locale: "da",
    kunde: { navn: "" },
    titel: "",
    intro: "",
    forside: STANDARD_FORSIDE,
    linjer: [],
    rabat: null,
    gyldigTil: plusDage(iDag(), TILBUD_GYLDIG_DAGE),
  };
}

const STATUS: Record<TilbudStatus, { navn: string; farve: string; bg: string }> = {
  kladde: { navn: "Kladde", farve: "#5b6070", bg: "#eef0f4" },
  sendt: { navn: "Sendt", farve: "#174ea6", bg: "#e5edff" },
  set: { navn: "Set af kunden", farve: "#7a4d00", bg: "#fff1d6" },
  booket: { navn: "Booket", farve: "#0f6b3a", bg: "#dcf5e6" },
};

function StatusPille({ status }: { status: TilbudStatus }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: s.farve, background: s.bg }}>
      {s.navn}
    </span>
  );
}

type Fane = "udstyr" | "kunde" | "billeder" | "brev";
type Filter = "alle" | "hojtaler" | "lyd" | "lys" | "roeg" | "av" | "pakke" | "tilbehoer";

const FILTRE: Array<{ id: Filter; navn: string }> = [
  { id: "alle", navn: "Alle" },
  { id: "hojtaler", navn: "Højtalere" },
  { id: "lyd", navn: "Lyd" },
  { id: "lys", navn: "Lys" },
  { id: "pakke", navn: "Pakker" },
  { id: "tilbehoer", navn: "Tilbehør" },
  { id: "roeg", navn: "Røg" },
  { id: "av", navn: "AV" },
];

function passer(v: TilbudVare, f: Filter): boolean {
  if (f === "alle") return true;
  if (f === "hojtaler") return v.slags === "hojtaler";
  if (f === "pakke") return v.slags === "pakke";
  if (f === "tilbehoer") return v.slags === "tilvalg" || v.slags === "ydelse";
  return v.slags === "udstyr" && v.kategori === f;
}

const knap = "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
const knapLys = `${knap} border-[#dfe2ea] bg-white text-[#2a2d38] hover:border-[#1249cf] hover:text-[#1249cf]`;
const knapBlaa = `${knap} border-[#1249cf] bg-[#1249cf] text-white hover:bg-[#103dae]`;
const felt = "w-full rounded-lg border border-[#dfe2ea] bg-white px-3 py-2 text-[14px] text-[#11131a] outline-none transition focus:border-[#1249cf] focus:ring-2 focus:ring-[#1249cf]/15";
const etiket = "mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7f8c]";

function Antal({ antal, onMinus, onPlus, enhed }: { antal: number; onMinus: () => void; onPlus: () => void; enhed?: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <button type="button" onClick={onMinus} aria-label="Én færre" className="h-7 w-7 rounded-md border border-[#dfe2ea] bg-white text-[#4a4f5c] hover:border-[#1249cf] hover:text-[#1249cf]">
        −
      </button>
      <span className="min-w-[38px] text-center text-[13px] font-semibold tabular-nums">
        {antal}
        {enhed ? <span className="ml-0.5 font-normal text-[#7a7f8c]">{enhed}</span> : null}
      </span>
      <button type="button" onClick={onPlus} aria-label="Én mere" className="h-7 w-7 rounded-md border border-[#dfe2ea] bg-white text-[#4a4f5c] hover:border-[#1249cf] hover:text-[#1249cf]">
        +
      </button>
    </span>
  );
}

export default function TilbudAdminPage() {
  const { secret, user, isLoggedIn, unauthorized } = useAdminAuth();
  const katalog = useProducts();
  const kontakt = useKontakt();
  const isMobile = useIsMobile();

  const [kladde, setKladde] = useState<Kladde>(tomKladde);
  const [aendret, setAendret] = useState(false);
  const [fane, setFane] = useState<Fane>("udstyr");
  const [filter, setFilter] = useState<Filter>("alle");
  const [soeg, setSoeg] = useState("");
  const [gemmer, setGemmer] = useState(false);
  const [besked, setBesked] = useState<{ tekst: string; fejl?: boolean } | null>(null);
  const [liste, setListe] = useState<TilbudResume[] | null>(null);
  const [visListe, setVisListe] = useState(false);
  const [visSend, setVisSend] = useState(false);
  const [rabatInput, setRabatInput] = useState("");
  const [rabatFejl, setRabatFejl] = useState("");

  const api = useCallback((ekstra = "") => `/api/tilbud?secret=${encodeURIComponent(secret)}${ekstra}`, [secret]);

  const vis = useCallback((tekst: string, fejl = false) => {
    setBesked({ tekst, fejl });
    window.setTimeout(() => setBesked((b) => (b?.tekst === tekst ? null : b)), 4000);
  }, []);

  /* ── Hent liste og evt. ?id= ── */
  const hentListe = useCallback(async () => {
    if (!secret) return;
    try {
      const r = await fetch(api());
      if (r.status === 401) return unauthorized();
      const data = (await r.json()) as { tilbud?: TilbudResume[] };
      setListe(data.tilbud ?? []);
    } catch {
      setListe([]);
    }
  }, [api, secret, unauthorized]);

  const aabn = useCallback(
    async (id: string) => {
      try {
        const r = await fetch(api(`&id=${encodeURIComponent(id)}`));
        if (r.status === 401) return unauthorized();
        const data = (await r.json()) as { tilbud?: Tilbud; error?: string };
        if (!data.tilbud) throw new Error(data.error || "Ukendt tilbud");
        setKladde(data.tilbud);
        setRabatInput(data.tilbud.rabat?.code ?? "");
        setAendret(false);
        setVisListe(false);
        window.history.replaceState(null, "", `/admin/tilbud?id=${data.tilbud.id}`);
      } catch (e) {
        vis(e instanceof Error ? e.message : "Kunne ikke åbne tilbuddet", true);
      }
    },
    [api, unauthorized, vis],
  );

  const startet = useRef(false);
  useEffect(() => {
    if (!secret || startet.current) return;
    startet.current = true;
    hentListe();
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) aabn(id);
  }, [secret, hentListe, aabn]);

  // Lukker man fanen med ændringer, der ikke er gemt, skal browseren spørge
  useEffect(() => {
    if (!aendret) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [aendret]);

  /* ── Redigering ── */
  const ret = useCallback((fn: (k: Kladde) => Kladde) => {
    setKladde((k) => fn(k));
    setAendret(true);
  }, []);

  const antalAf = (id: string) => kladde.linjer.find((l) => l.id === id)?.antal ?? 0;

  const saetAntal = useCallback(
    (id: string, antal: number) =>
      ret((k) => {
        const findes = k.linjer.some((l) => l.id === id);
        if (antal <= 0) return { ...k, linjer: k.linjer.filter((l) => l.id !== id) };
        if (findes) return { ...k, linjer: k.linjer.map((l) => (l.id === id ? { ...l, antal: Math.min(999, antal) } : l)) };
        return { ...k, linjer: [...k.linjer, { id, antal }] };
      }),
    [ret],
  );

  const laegTil = (id: string, n = 1) => saetAntal(id, antalAf(id) + n);

  const leveringValgt = kladde.linjer.find((l) => (DELIVERY_ADDON_IDS as readonly string[]).includes(l.id))?.id ?? null;
  const vaelgLevering = (id: string | null) =>
    ret((k) => {
      const uden = k.linjer.filter((l) => !(DELIVERY_ADDON_IDS as readonly string[]).includes(l.id));
      return { ...k, linjer: id ? [...uden, { id, antal: 1 }] : uden, leveringsadresse: id ? k.leveringsadresse : undefined };
    });

  /* ── Shoppen ── */
  const varer = useMemo(() => {
    const ids = [
      ...katalog.speakers.map((s) => s.id),
      ...katalog.rentalProducts.map((r) => r.id),
      ...katalog.addons.map((a) => a.id),
    ];
    const ud: TilbudVare[] = [];
    for (const id of [...new Set(ids)]) {
      if (!kanTilbydes(id) || (DELIVERY_ADDON_IDS as readonly string[]).includes(id)) continue;
      const v = findVare(katalog, id, kladde.locale);
      if (v && v.pris > 0) ud.push(v);
    }
    return ud;
  }, [katalog, kladde.locale]);

  const synlige = useMemo(() => {
    const q = soeg.trim().toLowerCase();
    return varer.filter((v) => passer(v, filter) && (!q || `${v.navn} ${v.beskrivelse ?? ""} ${v.id}`.toLowerCase().includes(q)));
  }, [varer, filter, soeg]);

  const leveringer = useMemo(
    () => DELIVERY_ADDON_IDS.map((id) => findVare(katalog, id, kladde.locale)).filter((v): v is TilbudVare => !!v),
    [katalog, kladde.locale],
  );

  /*
   * Ledigheden på datoerne. Kurven afviser et antal, der ikke er ledigt, så
   * det skal kollegaen se, mens han bygger tilbuddet — ikke kunden, når han
   * vil betale.
   */
  const [ledighed, setLedighed] = useState<{ inventory: Record<string, number>; booked: Record<string, number> } | null>(null);
  useEffect(() => {
    if (!kladde.fra) {
      setLedighed(null);
      return;
    }
    const til = kladde.til && kladde.til > kladde.fra ? kladde.til : plusDage(kladde.fra, 1);
    let aktiv = true;
    fetch(`/api/availability?from=${kladde.fra}&to=${til}`)
      .then((r) => r.json())
      .then((d: { inventory?: Record<string, number>; booked?: Record<string, number> } | null) => {
        if (aktiv) setLedighed({ inventory: d?.inventory ?? {}, booked: d?.booked ?? {} });
      })
      .catch(() => aktiv && setLedighed(null));
    return () => {
      aktiv = false;
    };
  }, [kladde.fra, kladde.til]);
  const ledigeAf = (id: string): number | null =>
    ledighed && ledighed.inventory[id] !== undefined ? Math.max(0, ledighed.inventory[id] - (ledighed.booked[id] ?? 0)) : null;

  const tekniker = findVare(katalog, TEKNIKER_ID, kladde.locale);
  const forbrug = findVare(katalog, FORBRUG_ID, kladde.locale);
  const sum = useMemo(() => prissaet(kladde, katalog), [kladde, katalog]);

  /* ── Gem, send, kopiér ── */
  async function gem(stille = false): Promise<Tilbud | null> {
    if (!kladde.kunde.navn.trim()) {
      setFane("kunde");
      vis("Skriv kundens navn, før tilbuddet gemmes", true);
      return null;
    }
    setGemmer(true);
    try {
      const r = await fetch(api(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "gem", tilbud: kladde }),
      });
      if (r.status === 401) {
        unauthorized();
        return null;
      }
      const data = (await r.json()) as { tilbud?: Tilbud; error?: string };
      if (!r.ok || !data.tilbud) throw new Error(data.error || "Kunne ikke gemme");
      setKladde(data.tilbud);
      setAendret(false);
      window.history.replaceState(null, "", `/admin/tilbud?id=${data.tilbud.id}`);
      if (!stille) vis(`Tilbud nr. ${data.tilbud.nr} er gemt`);
      hentListe();
      return data.tilbud;
    } catch (e) {
      vis(e instanceof Error ? e.message : "Kunne ikke gemme", true);
      return null;
    } finally {
      setGemmer(false);
    }
  }

  /** Links kræver et gemt tilbud — gem først, hvis der er ændringer */
  async function gemtTilbud(): Promise<Tilbud | null> {
    if (kladde.id && !aendret) return kladde as Tilbud;
    return gem(true);
  }

  async function aabnKundevisning() {
    const t = await gemtTilbud();
    if (t) window.open(tilbudSti(t.id, t.locale), "_blank", "noopener");
  }

  async function kopierLink() {
    const t = await gemtTilbud();
    if (!t) return;
    const url = `${window.location.origin}${tilbudSti(t.id, t.locale)}`;
    try {
      await navigator.clipboard.writeText(url);
      vis("Linket til tilbuddet er kopieret");
    } catch {
      window.prompt("Kopiér linket:", url);
    }
  }

  async function kopierTilbud(id: string) {
    try {
      const r = await fetch(api(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "kopier", id }) });
      const data = (await r.json()) as { tilbud?: Tilbud; error?: string };
      if (!data.tilbud) throw new Error(data.error || "Kunne ikke kopiere");
      setKladde(data.tilbud);
      setRabatInput(data.tilbud.rabat?.code ?? "");
      setAendret(false);
      setVisListe(false);
      window.history.replaceState(null, "", `/admin/tilbud?id=${data.tilbud.id}`);
      vis(`Kopieret som tilbud nr. ${data.tilbud.nr}`);
      hentListe();
    } catch (e) {
      vis(e instanceof Error ? e.message : "Kunne ikke kopiere", true);
    }
  }

  async function sletTilbud(r: TilbudResume) {
    if (!window.confirm(`Slet tilbud nr. ${r.nr} til ${r.kunde}? Linket holder op med at virke.`)) return;
    await fetch(api(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "slet", id: r.id }) });
    if (kladde.id === r.id) nyt(true);
    hentListe();
  }

  function nyt(uden = false) {
    if (!uden && aendret && !window.confirm("Tilbuddet har ændringer, der ikke er gemt. Start et nyt alligevel?")) return;
    setKladde(tomKladde());
    setRabatInput("");
    setAendret(false);
    setFane("udstyr");
    window.history.replaceState(null, "", "/admin/tilbud");
  }

  async function tjekRabat() {
    const code = rabatInput.trim();
    setRabatFejl("");
    if (!code) {
      ret((k) => ({ ...k, rabat: null }));
      return;
    }
    try {
      const q = new URLSearchParams({ code });
      if (kladde.fra) q.set("pickup", kladde.fra);
      if (kladde.til) q.set("returnDate", kladde.til);
      const r = await fetch(`/api/discount?${q.toString()}`);
      const data = (await r.json()) as { valid: boolean; code?: string; pct?: number };
      if (data.valid && data.code && data.pct) ret((k) => ({ ...k, rabat: { code: data.code!, pct: data.pct! } }));
      else {
        setRabatFejl("Koden findes ikke eller gælder ikke på datoerne");
        ret((k) => ({ ...k, rabat: null }));
      }
    } catch {
      setRabatFejl("Kunne ikke tjekke koden");
    }
  }

  if (!isLoggedIn) return <AdminLogin title="Tilbud" />;

  const afsender = user?.name;
  const status = (kladde.status ?? "kladde") as TilbudStatus;

  /* ── Venstre: shop, kunde, forside ── */
  const venstre = (
    <aside className={`flex min-h-0 flex-col border-[#e7e8ee] bg-white ${isMobile ? "border-b" : "border-r"}`}>
      <div className="flex gap-1 border-b border-[#e7e8ee] px-3 pt-3">
        {(
          [
            ["udstyr", `Udstyr${kladde.linjer.length ? ` (${kladde.linjer.length})` : ""}`],
            ["kunde", "Kunde & event"],
            ["billeder", `Billeder${kladde.billeder?.length ? ` (${kladde.billeder.length})` : ""}`],
            ["brev", "Brev"],
          ] as Array<[Fane, string]>
        ).map(([id, navn]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFane(id)}
            className={`-mb-px rounded-t-lg border px-3 py-2 text-[13px] font-semibold transition ${
              fane === id ? "border-[#e7e8ee] border-b-white bg-white text-[#11131a]" : "border-transparent text-[#7a7f8c] hover:text-[#11131a]"
            }`}
          >
            {navn}
          </button>
        ))}
      </div>

      {fane === "udstyr" && (
        <>
          <div className="space-y-3 border-b border-[#eef0f4] p-3">
            {/* Hurtigknapperne: det, der står på næsten hvert tilbud */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {tekniker && (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#e7e8ee] bg-[#f7f8fb] px-2.5 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold">Tekniker</span>
                    <span className="block text-[11px] text-[#7a7f8c]">{kr(tekniker.pris, "da")} pr. time</span>
                  </span>
                  <Antal antal={antalAf(TEKNIKER_ID)} enhed="t" onMinus={() => saetAntal(TEKNIKER_ID, antalAf(TEKNIKER_ID) - 1)} onPlus={() => laegTil(TEKNIKER_ID)} />
                </div>
              )}
              {forbrug && (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-[#e7e8ee] bg-[#f7f8fb] px-2.5 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-semibold">Forbrugsmaterialer</span>
                    <span className="block text-[11px] text-[#7a7f8c]">{kr(forbrug.pris, "da")} pr. stk.</span>
                  </span>
                  <Antal antal={antalAf(FORBRUG_ID)} enhed="stk" onMinus={() => saetAntal(FORBRUG_ID, antalAf(FORBRUG_ID) - 1)} onPlus={() => laegTil(FORBRUG_ID)} />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <label className="min-w-0 flex-1">
                <span className={etiket}>Kørsel</span>
                <select className={felt} value={leveringValgt ?? ""} onChange={(e) => vaelgLevering(e.target.value || null)}>
                  <option value="">Kunden henter selv</option>
                  {leveringer.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.navn} · {kr(v.pris, "da")}
                    </option>
                  ))}
                </select>
              </label>
              {leveringValgt && (
                <label className="min-w-0 flex-1">
                  <span className={etiket}>Adresse</span>
                  <input className={felt} placeholder="Vej, postnr. og by" value={kladde.leveringsadresse ?? ""} onChange={(e) => ret((k) => ({ ...k, leveringsadresse: e.target.value }))} />
                </label>
              )}
            </div>
            <input className={felt} type="search" placeholder="Søg i udstyret: uplight, stativ, mikrofon …" value={soeg} onChange={(e) => setSoeg(e.target.value)} />
            <div className="flex flex-wrap gap-1.5">
              {FILTRE.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition ${filter === f.id ? "bg-[#1249cf] text-white" : "bg-[#eef0f4] text-[#4a4f5c] hover:bg-[#e2e6ee]"}`}
                >
                  {f.navn}
                </button>
              ))}
            </div>
          </div>

          <ul className="min-h-[180px] flex-1 overflow-y-auto">
            {synlige.map((v) => {
              const n = antalAf(v.id);
              return (
                <li key={v.id} className={`flex items-center gap-3 border-b border-[#f1f2f5] px-3 py-2 ${n ? "bg-[#f4f7ff]" : ""}`}>
                  <button type="button" onClick={() => laegTil(v.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" title="Læg én i tilbuddet">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f4f5f8]">
                      {v.billede ? <img src={v.billede} srcSet={thumbSrcSet(v.billede)} sizes={THUMB_IMAGE_SIZES} alt="" className="h-full w-full object-contain p-0.5" loading="lazy" /> : <span className="text-[10px] text-[#9aa0ad]">{v.slags === "ydelse" ? "Ydelse" : ""}</span>}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-[#11131a]">{v.navn}</span>
                      <span className="block text-[12px] text-[#7a7f8c]">
                        {kr(v.pris, "da")}
                        {v.enhed === "timer" ? " pr. time" : ""}
                        {(() => {
                          const ledige = ledigeAf(v.id);
                          return ledige === null ? null : <span className={ledige ? "" : "text-red-600"}> · {ledige} ledige</span>;
                        })()}
                      </span>
                    </span>
                  </button>
                  {n > 0 ? (
                    <Antal antal={n} onMinus={() => saetAntal(v.id, n - 1)} onPlus={() => laegTil(v.id)} />
                  ) : (
                    <button type="button" onClick={() => laegTil(v.id)} className="h-8 w-8 shrink-0 rounded-full bg-[#11131a] text-lg leading-none text-white hover:bg-[#1249cf]" aria-label={`Læg ${v.navn} i tilbuddet`}>
                      +
                    </button>
                  )}
                </li>
              );
            })}
            {synlige.length === 0 && <li className="p-6 text-center text-sm text-[#9aa0ad]">Intet udstyr matcher søgningen</li>}
          </ul>

          {/* Kurven: det, der står på tilbuddet lige nu */}
          <div className="max-h-[30%] overflow-y-auto border-t-2 border-[#11131a] bg-[#fafbfc] p-3">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#7a7f8c]">På tilbuddet</p>
              <p className="text-[17px] font-bold tabular-nums">{kr(sum.total, "da")}</p>
            </div>
            {sum.linjer.length === 0 && <p className="py-2 text-[13px] text-[#9aa0ad]">Tryk + på udstyret ovenfor.</p>}
            {sum.linjer.map((l) => {
              const erKoersel = (DELIVERY_ADDON_IDS as readonly string[]).includes(l.id);
              return (
                <div key={l.id} className="flex items-center gap-2 py-1">
                  <span className="min-w-0 flex-1 truncate text-[13px]">
                    {l.vare?.navn ?? `Udgået: ${l.id}`}
                    {(() => {
                      const ledige = ledigeAf(l.id);
                      return ledige !== null && l.antal > ledige ? (
                        <span className="ml-1.5 rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-700">kun {ledige} ledig{ledige === 1 ? "" : "e"}</span>
                      ) : null;
                    })()}
                  </span>
                  {!erKoersel && <Antal antal={l.antal} enhed={l.vare?.enhed === "timer" ? "t" : undefined} onMinus={() => saetAntal(l.id, l.antal - 1)} onPlus={() => saetAntal(l.id, l.antal + 1)} />}
                  <span className="w-[78px] text-right text-[13px] font-semibold tabular-nums">{kr(l.beloeb, "da")}</span>
                  <button type="button" onClick={() => (erKoersel ? vaelgLevering(null) : saetAntal(l.id, 0))} className="px-1 text-[#9aa0ad] hover:text-red-600" aria-label="Fjern">
                    ✕
                  </button>
                </div>
              );
            })}
            {sum.rabatBeloeb > 0 && (
              <p className="mt-1 text-right text-[12px] text-emerald-700">
                Rabat {kladde.rabat?.code} −{kladde.rabat?.pct} % = −{kr(sum.rabatBeloeb, "da")}
              </p>
            )}
          </div>
        </>
      )}

      {fane === "kunde" && (
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2">
              <span className={etiket}>Kundens navn *</span>
              <input className={felt} value={kladde.kunde.navn} onChange={(e) => ret((k) => ({ ...k, kunde: { ...k.kunde, navn: e.target.value } }))} placeholder="Mette Hansen" />
            </label>
            <label className="col-span-2">
              <span className={etiket}>Firma</span>
              <input className={felt} value={kladde.kunde.firma ?? ""} onChange={(e) => ret((k) => ({ ...k, kunde: { ...k.kunde, firma: e.target.value } }))} placeholder="Valgfrit" />
            </label>
            <label>
              <span className={etiket}>Mail</span>
              <input className={felt} type="email" value={kladde.kunde.email ?? ""} onChange={(e) => ret((k) => ({ ...k, kunde: { ...k.kunde, email: e.target.value } }))} />
            </label>
            <label>
              <span className={etiket}>Telefon</span>
              <input className={felt} type="tel" value={kladde.kunde.telefon ?? ""} onChange={(e) => ret((k) => ({ ...k, kunde: { ...k.kunde, telefon: e.target.value } }))} />
            </label>
          </div>

          <hr className="border-[#eef0f4]" />

          <label className="block">
            <span className={etiket}>Overskrift på forsiden</span>
            <input className={felt} value={kladde.titel} onChange={(e) => ret((k) => ({ ...k, titel: e.target.value }))} placeholder="Lyd og lys til julefrokosten" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={etiket}>Fra (afhentning/levering)</span>
              <input className={felt} type="date" value={kladde.fra ?? ""} onChange={(e) => ret((k) => ({ ...k, fra: e.target.value || undefined, til: k.til && e.target.value && k.til < e.target.value ? e.target.value : k.til }))} />
            </label>
            <label>
              <span className={etiket}>Til (retur)</span>
              <input className={felt} type="date" min={kladde.fra} value={kladde.til ?? ""} onChange={(e) => ret((k) => ({ ...k, til: e.target.value || undefined }))} />
            </label>
            <label className="col-span-2 sm:col-span-1">
              <span className={etiket}>Sted</span>
              <input className={felt} value={kladde.sted ?? ""} onChange={(e) => ret((k) => ({ ...k, sted: e.target.value }))} placeholder="Kantinen, Novo Nordisk, Bagsværd" />
            </label>
            <label>
              <span className={etiket}>Gæster</span>
              <input className={felt} type="number" min={1} value={kladde.gaester ?? ""} onChange={(e) => ret((k) => ({ ...k, gaester: Number(e.target.value) || undefined }))} />
            </label>
          </div>
          {kladde.fra && <p className="-mt-2 text-[12px] text-[#7a7f8c]">{periodeTekst(kladde, "da")}. Kunden får datoerne udfyldt i kurven.</p>}

          <hr className="border-[#eef0f4]" />

          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={etiket}>Sprog</span>
              <select className={felt} value={kladde.locale} onChange={(e) => ret((k) => ({ ...k, locale: e.target.value === "en" ? "en" : "da" }))}>
                <option value="da">Dansk</option>
                <option value="en">Engelsk</option>
              </select>
            </label>
            <label>
              <span className={etiket}>Gælder til</span>
              <input className={felt} type="date" value={kladde.gyldigTil} onChange={(e) => ret((k) => ({ ...k, gyldigTil: e.target.value || plusDage(iDag(), TILBUD_GYLDIG_DAGE) }))} />
            </label>
          </div>
          <div>
            <span className={etiket}>Rabatkode (lægges på i kurven af sig selv)</span>
            <div className="flex gap-2">
              <input className={felt} value={rabatInput} onChange={(e) => setRabatInput(e.target.value)} placeholder="Opret koden under Rabatkoder" />
              <button type="button" className={knapLys} onClick={tjekRabat}>
                {rabatInput.trim() ? "Tjek" : "Fjern"}
              </button>
            </div>
            {kladde.rabat && <p className="mt-1 text-[12px] text-emerald-700">✓ {kladde.rabat.code}: {kladde.rabat.pct} % rabat</p>}
            {rabatFejl && <p className="mt-1 text-[12px] text-red-600">{rabatFejl}</p>}
          </div>
          <label className="block">
            <span className={etiket}>Intern note (ses kun her)</span>
            <textarea className={`${felt} min-h-[70px]`} value={kladde.note ?? ""} onChange={(e) => ret((k) => ({ ...k, note: e.target.value }))} placeholder="Fx: ringer tirsdag, vil gerne have røg med hvis budgettet holder" />
          </label>
        </div>
      )}

      {fane === "billeder" && (
        <TilbudBilleder secret={secret} katalog={katalog} tilbud={kladde} onChange={(patch) => ret((k) => ({ ...k, ...patch }))} />
      )}

      {fane === "brev" && (
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <label className="block">
            <span className={etiket}>Brevet til kunden</span>
            <textarea
              className={`${felt} min-h-[260px] leading-relaxed`}
              value={kladde.intro}
              onChange={(e) => ret((k) => ({ ...k, intro: e.target.value }))}
              placeholder={standardIntro(kladde, afsender)}
            />
          </label>
          <button type="button" className={knapLys} onClick={() => ret((k) => ({ ...k, intro: standardIntro(k, afsender) }))}>
            Indsæt standardbrevet
          </button>
          <p className="text-[12px] text-[#7a7f8c]">Står feltet tomt, får kunden standardbrevet med jeres navn under.</p>
        </div>
      )}
    </aside>
  );

  /* ── Højre: tilbuddet som kunden ser det ── */
  const visning: Tilbud = {
    ...kladde,
    id: kladde.id ?? "",
    nr: kladde.nr ?? 0,
    oprettet: kladde.oprettet ?? new Date().toISOString(),
    opdateret: kladde.opdateret ?? new Date().toISOString(),
    oprettetAf: kladde.oprettetAf ?? afsender,
  };

  return (
    <div className="flex h-screen flex-col bg-[#e9ebf0]">
      <AdminNav
        title={kladde.nr ? `Tilbud nr. ${kladde.nr}` : "Nyt tilbud"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusPille status={status} />
            {aendret && <span className="text-[12px] text-[#b45309]">Ikke gemt</span>}
            <button type="button" className={knapLys} onClick={() => { setVisListe(true); hentListe(); }}>
              Alle tilbud{liste ? ` (${liste.length})` : ""}
            </button>
            <button type="button" className={knapLys} onClick={() => nyt()}>
              + Nyt
            </button>
            <button type="button" className={knapLys} onClick={aabnKundevisning} disabled={gemmer}>
              Kundevisning ↗
            </button>
            <button type="button" className={knapLys} onClick={kopierLink} disabled={gemmer}>
              Kopiér link
            </button>
            <button type="button" className={knapLys} onClick={() => gem()} disabled={gemmer}>
              {gemmer ? "Gemmer …" : "Gem"}
            </button>
            <button
              type="button"
              className={knapBlaa}
              disabled={gemmer || sum.linjer.length === 0}
              onClick={async () => {
                const t = await gemtTilbud();
                if (t) setVisSend(true);
              }}
            >
              Send til kunde
            </button>
          </div>
        }
      />

      {(kladde.sendtAt || kladde.setAt || kladde.booketAt) && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 border-b border-[#e7e8ee] bg-white px-5 py-2 text-[12px] text-[#5b6070]">
          {kladde.sendtAt && <span>Sendt {new Date(kladde.sendtAt).toLocaleString("da-DK", { dateStyle: "medium", timeStyle: "short" })} til {kladde.sendtTil}</span>}
          {kladde.setAt && <span>Åbnet af kunden {new Date(kladde.setAt).toLocaleString("da-DK", { dateStyle: "medium", timeStyle: "short" })}</span>}
          {kladde.booketAt && (
            <span className="font-semibold text-emerald-700">
              Booket {new Date(kladde.booketAt).toLocaleString("da-DK", { dateStyle: "medium", timeStyle: "short" })}
              {kladde.bookingId ? ` · ordre ${kladde.bookingId.replace("booking_", "")}` : ""}
            </span>
          )}
        </div>
      )}

      <div className={isMobile ? "flex-1 overflow-y-auto" : "grid min-h-0 flex-1 grid-cols-[minmax(380px,460px)_1fr]"}>
        {venstre}
        <section className={isMobile ? "p-3" : "min-h-0 overflow-y-auto px-6 py-6"}>
          <TilbudDokument tilbud={visning} katalog={katalog} kontakt={kontakt} forhaandsvisning />
        </section>
      </div>

      {besked && (
        <div className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg ${besked.fejl ? "bg-red-600" : "bg-[#11131a]"}`}>
          {besked.tekst}
        </div>
      )}

      {visListe && <TilbudListe liste={liste} aktiv={kladde.id} onLuk={() => setVisListe(false)} onAabn={aabn} onKopier={kopierTilbud} onSlet={sletTilbud} />}

      {visSend && kladde.id && (
        <SendDialog
          tilbud={visning}
          total={sum.total}
          afsender={afsender}
          onLuk={() => setVisSend(false)}
          onSend={async (til, emne, tekst) => {
            const r = await fetch(api(), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "send", id: kladde.id, til, emne, besked: tekst }),
            });
            const data = (await r.json()) as { tilbud?: Tilbud; error?: string };
            if (!r.ok || !data.tilbud) throw new Error(data.error || "Mailen kunne ikke sendes");
            setKladde(data.tilbud);
            setAendret(false);
            setVisSend(false);
            vis(`Tilbuddet er sendt til ${til}`);
            hentListe();
          }}
        />
      )}
    </div>
  );
}

/* ───── Listen over tilbud ───── */

function TilbudListe({
  liste,
  aktiv,
  onLuk,
  onAabn,
  onKopier,
  onSlet,
}: {
  liste: TilbudResume[] | null;
  aktiv?: string;
  onLuk: () => void;
  onAabn: (id: string) => void;
  onKopier: (id: string) => void;
  onSlet: (r: TilbudResume) => void;
}) {
  const [q, setQ] = useState("");
  const vist = (liste ?? []).filter((r) => !q || `${r.nr} ${r.kunde} ${r.titel}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-16" onClick={onLuk}>
      <div className="max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[#eef0f4] p-4">
          <h2 className="text-[17px] font-bold">Alle tilbud</h2>
          <input className={`${felt} ml-auto max-w-xs`} type="search" placeholder="Søg på nr., kunde eller titel" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
          <button type="button" onClick={onLuk} className="px-2 text-xl text-[#9aa0ad] hover:text-[#11131a]" aria-label="Luk">
            ✕
          </button>
        </div>
        <div className="max-h-[calc(80vh-70px)] overflow-y-auto">
          {liste === null && <p className="p-8 text-center text-[#9aa0ad]">Henter …</p>}
          {liste && vist.length === 0 && <p className="p-8 text-center text-[#9aa0ad]">Ingen tilbud endnu</p>}
          <table className="w-full text-[13px]">
            <tbody>
              {vist.map((r) => (
                <tr key={r.id} className={`border-b border-[#f1f2f5] ${r.id === aktiv ? "bg-[#f4f7ff]" : "hover:bg-[#fafbfc]"}`}>
                  <td className="py-3 pl-4 font-mono text-[12px] text-[#7a7f8c]">#{r.nr}</td>
                  <td className="cursor-pointer py-3 pl-3" onClick={() => onAabn(r.id)}>
                    <p className="font-semibold">{r.kunde || "Uden navn"}</p>
                    <p className="text-[12px] text-[#7a7f8c]">
                      {r.titel || "Uden overskrift"}
                      {r.fra ? ` · ${periodeTekst(r, "da")}` : ""}
                    </p>
                  </td>
                  <td className="py-3 pl-3">
                    <StatusPille status={r.status} />
                  </td>
                  <td className="py-3 pl-3 text-right font-semibold tabular-nums">{kr(r.total, "da")}</td>
                  <td className="py-3 pl-3 text-[12px] text-[#7a7f8c]">
                    {new Date(r.opdateret).toLocaleDateString("da-DK", { day: "numeric", month: "short" })}
                    {r.oprettetAf ? ` · ${r.oprettetAf}` : ""}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-3 pr-4 text-right">
                    <button type="button" className="mr-3 font-semibold text-[#1249cf] hover:underline" onClick={() => onAabn(r.id)}>
                      Åbn
                    </button>
                    <button type="button" className="mr-3 text-[#4a4f5c] hover:underline" onClick={() => onKopier(r.id)} title="Lav et nyt tilbud med samme indhold">
                      Kopiér
                    </button>
                    <button type="button" className="text-[#9aa0ad] hover:text-red-600" onClick={() => onSlet(r)} aria-label="Slet">
                      Slet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ───── Send til kunde ───── */

function SendDialog({
  tilbud: t,
  total,
  afsender,
  onLuk,
  onSend,
}: {
  tilbud: Tilbud;
  total: number;
  afsender?: string;
  onLuk: () => void;
  onSend: (til: string, emne: string, besked: string) => Promise<void>;
}) {
  const en = t.locale === "en";
  const fornavn = t.kunde.navn.split(/\s+/)[0] || "";
  const [til, setTil] = useState(t.kunde.email ?? "");
  const [emne, setEmne] = useState(`${en ? "Offer" : "Tilbud"} nr. ${t.nr}${t.titel ? `: ${t.titel}` : ""}`);
  const [tekst, setTekst] = useState(
    en
      ? `Dear ${fornavn},\n\nThank you for your enquiry. Here is our offer${t.titel ? ` for ${t.titel.toLowerCase()}` : ""}.\n\nYou can see the full offer, change it and book and pay directly from the link below. Everything is ready in your cart.\n\nBest regards\n${afsender ?? "Lejhøjtaler.dk"}`
      : `Kære ${fornavn}\n\nTak for jeres henvendelse. Her er vores tilbud${t.titel ? ` på ${t.titel.charAt(0).toLowerCase()}${t.titel.slice(1)}` : ""}.\n\nI kan se hele tilbuddet, rette i det og booke og betale direkte fra linket herunder. Det hele ligger klar i kurven.\n\nVenlig hilsen\n${afsender ?? "Lejhøjtaler.dk"}`,
  );
  const [sender, setSender] = useState(false);
  const [fejl, setFejl] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-16" onClick={onLuk}>
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[18px] font-bold">Send tilbud nr. {t.nr}</h2>
        <p className="mt-1 text-[13px] text-[#7a7f8c]">
          Kunden får en mail med forsidebilledet, totalen på {kr(total, "da")} og to knapper: se tilbuddet, og book og betal. Vi får en kopi.
        </p>
        <div className="mt-5 space-y-3">
          <label className="block">
            <span className={etiket}>Til</span>
            <input className={felt} type="email" value={til} onChange={(e) => setTil(e.target.value)} />
          </label>
          <label className="block">
            <span className={etiket}>Emne</span>
            <input className={felt} value={emne} onChange={(e) => setEmne(e.target.value)} />
          </label>
          <label className="block">
            <span className={etiket}>Besked</span>
            <textarea className={`${felt} min-h-[200px] leading-relaxed`} value={tekst} onChange={(e) => setTekst(e.target.value)} />
          </label>
          <p className="text-[12px] text-[#7a7f8c]">
            Linket: <span className="font-mono">lejhojtaler.dk{tilbudSti(t.id, t.locale)}</span> · QR-koden peger på{" "}
            <span className="font-mono">{tilbudBookSti(t.id, t.locale)}</span>
          </p>
        </div>
        {fejl && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{fejl}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={knapLys} onClick={onLuk}>
            Annullér
          </button>
          <button
            type="button"
            className={knapBlaa}
            disabled={sender || !til.trim()}
            onClick={async () => {
              setSender(true);
              setFejl("");
              try {
                await onSend(til.trim(), emne, tekst);
              } catch (e) {
                setFejl(e instanceof Error ? e.message : "Mailen kunne ikke sendes");
              } finally {
                setSender(false);
              }
            }}
          >
            {sender ? "Sender …" : `Send til ${til.trim() || "kunden"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
