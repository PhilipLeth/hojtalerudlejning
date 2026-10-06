/* ───── Tilbud ─────
 *
 * GET  ?id=X            → kundens tilbud (offentligt — id'et er nøglen).
 *                         Første visning efter afsendelse sætter "set".
 * GET  ?id=X&secret=…   → samme, men med vores interne note, og uden at
 *                         tælle som kundens visning.
 * GET  ?secret=…        → listen til /admin/tilbud.
 * POST ?secret=…        → { action: "gem" | "send" | "kopier" | "slet", … }
 *
 * Beløb regnes ALDRIG ud fra det admin sender: listen og mailen slår
 * priserne op i samme pristabel som Stripe.
 */
import { requireAdmin, resolveAdmin } from "./_lib/adminAuth";
import { loadPriceTable, type PricedItem } from "./_lib/pricing";
import { loadSiteSettings, mailFooter } from "./_lib/siteSettings";
import { notifyRecipients } from "./_lib/notify";
import { formatDkPhone } from "../../src/lib/phone";
import { TIMEOUT_MAIL_MS, timeoutSignal } from "../../src/lib/fetchTimeout";
import {
  SITE_URL,
  TILBUD_FOERSTE_NR,
  TILBUD_INDEX_KEY,
  TILBUD_PREFIX,
  TILBUD_SEQ_KEY,
  gyldigtTilbudId,
  normaliserTilbud,
  nytTilbudId,
  offentligtTilbud,
  tilbudBookSti,
  tilbudResume,
  tilbudSti,
  type Tilbud,
  type TilbudResume,
} from "../../src/lib/tilbud";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET?: string;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders });

export const onRequestOptions: PagesFunction<Env> = async () => new Response(null, { status: 204, headers: corsHeaders });

async function hent(kv: KVNamespace, id: string): Promise<Tilbud | null> {
  const raw = await kv.get(TILBUD_PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Tilbud;
  } catch {
    return null;
  }
}

async function hentIndex(kv: KVNamespace): Promise<TilbudResume[]> {
  try {
    const raw = await kv.get(TILBUD_INDEX_KEY);
    const list = raw ? (JSON.parse(raw) as TilbudResume[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Totalen som kassen ville regne den: katalogets pris × antal, minus rabatten */
export function serverTotal(table: Map<string, PricedItem>, t: Pick<Tilbud, "linjer" | "rabat">): number {
  let ore = 0;
  for (const l of t.linjer) {
    const p = table.get(l.id);
    if (p) ore += p.unitAmount * l.antal;
  }
  const kr = Math.round(ore / 100);
  return t.rabat?.pct ? Math.round(kr * (1 - t.rabat.pct / 100)) : kr;
}

async function gem(kv: KVNamespace, t: Tilbud, table?: Map<string, PricedItem>): Promise<Tilbud> {
  await kv.put(TILBUD_PREFIX + t.id, JSON.stringify(t));
  const pris = table ?? (await loadPriceTable(kv));
  const index = (await hentIndex(kv)).filter((r) => r.id !== t.id);
  index.unshift(tilbudResume(t, serverTotal(pris, t)));
  await kv.put(TILBUD_INDEX_KEY, JSON.stringify(index.slice(0, 1000)));
  return t;
}

async function naesteNr(kv: KVNamespace): Promise<number> {
  const nu = Number(await kv.get(TILBUD_SEQ_KEY)) || TILBUD_FOERSTE_NR - 1;
  const nr = nu + 1;
  await kv.put(TILBUD_SEQ_KEY, String(nr));
  return nr;
}

/** Markér et tilbud som booket — kaldes fra /api/book, når kunden har bestilt */
export async function markerBooket(kv: KVNamespace, id: unknown, bookingId: string): Promise<void> {
  if (!gyldigtTilbudId(id)) return;
  const t = await hent(kv, id);
  if (!t) return;
  await gem(kv, { ...t, status: "booket", booketAt: new Date().toISOString(), bookingId });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");
  const kv = context.env.BOOKINGS;

  if (id) {
    if (!gyldigtTilbudId(id)) return json({ error: "Ukendt tilbud" }, 404);
    const t = await hent(kv, id);
    if (!t) return json({ error: "Ukendt tilbud" }, 404);
    const admin = await resolveAdmin(context.env, context.request);
    if (admin) return json({ tilbud: t });
    // Kundens første visning efter afsendelse: så kan kollegaen se, at
    // tilbuddet er åbnet, og ringe på det rigtige tidspunkt
    if (t.status === "sendt" && !t.setAt) {
      const set = { ...t, status: "set" as const, setAt: new Date().toISOString() };
      try {
        await gem(kv, set);
      } catch (e) {
        console.error("[tilbud] kunne ikke markere som set:", e);
      }
      return json({ tilbud: offentligtTilbud(set) });
    }
    return json({ tilbud: offentligtTilbud(t) });
  }

  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;
  return json({ tilbud: await hentIndex(kv) });
};

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function dagTekst(iso: string | undefined, locale: "da" | "en"): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "da-DK", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function tilbudMailHtml(
  t: Tilbud,
  opts: { total: number; besked: string; telefon: string; email: string; footer: string },
): string {
  const en = t.locale === "en";
  const link = SITE_URL + tilbudSti(t.id, t.locale);
  const book = SITE_URL + tilbudBookSti(t.id, t.locale);
  const periode = t.fra ? (t.til && t.til !== t.fra ? `${dagTekst(t.fra, t.locale)} – ${dagTekst(t.til, t.locale)}` : dagTekst(t.fra, t.locale)) : "";
  const total = opts.total.toLocaleString("da-DK");
  const besked = esc(opts.besked).replace(/\n/g, "<br>");
  const række = (k: string, v: string) =>
    v ? `<tr><td style="padding:6px 16px 6px 0;color:#7a7f8c;font-size:13px;">${k}</td><td style="padding:6px 0;color:#11131a;font-size:14px;">${esc(v)}</td></tr>` : "";
  return `<!doctype html><html><body style="margin:0;background:#f3f4f7;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f7;padding:32px 12px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#0b0a10 url('${SITE_URL}${t.forside}') center/cover no-repeat;padding:0;">
  <div style="background:linear-gradient(180deg,rgba(7,6,11,0.25),rgba(7,6,11,0.85));padding:40px 36px 34px;">
    <div style="color:#ffffff;font-weight:700;font-size:15px;letter-spacing:0.02em;">LejHøjtaler.dk</div>
    <div style="margin-top:70px;color:#9db8ff;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;">${en ? "Offer" : "Tilbud"} nr. ${t.nr}</div>
    <div style="margin-top:8px;color:#ffffff;font-size:28px;line-height:1.2;font-weight:700;">${esc(t.titel || (en ? "Your offer" : "Jeres tilbud"))}</div>
  </div>
</td></tr>
<tr><td style="padding:32px 36px 8px;color:#11131a;font-size:15px;line-height:1.6;">${besked}</td></tr>
<tr><td style="padding:8px 36px 0;">
  <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #eceef3;padding-top:10px;">
    ${række(en ? "Date" : "Dato", periode)}
    ${række(en ? "Venue" : "Sted", t.sted ?? "")}
    ${række(en ? "Valid until" : "Gælder til", dagTekst(t.gyldigTil, t.locale))}
    <tr><td style="padding:10px 16px 6px 0;color:#7a7f8c;font-size:13px;">${en ? "Total incl. VAT" : "I alt inkl. moms"}</td><td style="padding:10px 0 6px;color:#11131a;font-size:20px;font-weight:700;">${total} kr</td></tr>
  </table>
</td></tr>
<tr><td style="padding:26px 36px 8px;">
  <a href="${link}" style="display:inline-block;background:#1249cf;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 26px;border-radius:999px;">${en ? "See the offer" : "Se tilbuddet"}</a>
  <a href="${book}" style="display:inline-block;margin-left:8px;color:#1249cf;text-decoration:none;font-weight:700;font-size:15px;padding:14px 10px;">${en ? "Book and pay →" : "Book og betal →"}</a>
</td></tr>
<tr><td style="padding:18px 36px 32px;color:#7a7f8c;font-size:13px;line-height:1.6;">
  ${en ? "Questions? Reply to this email or call" : "Spørgsmål? Svar på mailen eller ring på"} <a href="tel:+45${opts.telefon.replace(/\D/g, "")}" style="color:#11131a;">${esc(opts.telefon)}</a>.
  ${opts.footer}
</td></tr>
</table></td></tr></table></body></html>`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;
  const kv = context.env.BOOKINGS;

  let body: Record<string, unknown>;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const nu = new Date().toISOString();

  if (body.action === "gem") {
    const input = (body.tilbud ?? {}) as Record<string, unknown>;
    const id = gyldigtTilbudId(input.id) ? input.id : null;
    const før = id ? await hent(kv, id) : null;
    if (id && !før) return json({ error: "Tilbuddet findes ikke længere" }, 404);
    const ren = normaliserTilbud(input, før);
    if (!ren.kunde.navn) return json({ error: "Skriv kundens navn" }, 400);
    const t: Tilbud = {
      ...ren,
      id: før?.id ?? nytTilbudId(),
      nr: før?.nr ?? (await naesteNr(kv)),
      oprettet: før?.oprettet ?? nu,
      opdateret: nu,
      oprettetAf: før?.oprettetAf ?? (auth.legacy ? undefined : auth.name),
    };
    return json({ tilbud: await gem(kv, t) });
  }

  if (body.action === "kopier") {
    if (!gyldigtTilbudId(body.id)) return json({ error: "Ukendt tilbud" }, 404);
    const før = await hent(kv, body.id);
    if (!før) return json({ error: "Ukendt tilbud" }, 404);
    const ren = normaliserTilbud({ ...før, gyldigTil: undefined }, null);
    const t: Tilbud = {
      ...ren,
      status: "kladde",
      sendtAt: undefined,
      sendtTil: undefined,
      setAt: undefined,
      booketAt: undefined,
      bookingId: undefined,
      id: nytTilbudId(),
      nr: await naesteNr(kv),
      oprettet: nu,
      opdateret: nu,
      oprettetAf: auth.legacy ? før.oprettetAf : auth.name,
    };
    return json({ tilbud: await gem(kv, t) });
  }

  if (body.action === "slet") {
    if (!gyldigtTilbudId(body.id)) return json({ error: "Ukendt tilbud" }, 404);
    await kv.delete(TILBUD_PREFIX + body.id);
    const index = (await hentIndex(kv)).filter((r) => r.id !== body.id);
    await kv.put(TILBUD_INDEX_KEY, JSON.stringify(index));
    return json({ ok: true });
  }

  if (body.action === "send") {
    if (!gyldigtTilbudId(body.id)) return json({ error: "Ukendt tilbud" }, 404);
    const t = await hent(kv, body.id);
    if (!t) return json({ error: "Ukendt tilbud" }, 404);
    const til = String(body.til ?? t.kunde.email ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(til)) return json({ error: "Ugyldig mailadresse" }, 400);
    if (!t.linjer.length) return json({ error: "Tilbuddet er tomt" }, 400);
    if (!context.env.RESEND_API_KEY) return json({ error: "Mail er ikke sat op på serveren" }, 503);

    const table = await loadPriceTable(kv);
    const site = await loadSiteSettings(kv);
    const en = t.locale === "en";
    const emne = String(body.emne ?? "").trim().slice(0, 200) || `${en ? "Offer" : "Tilbud"} nr. ${t.nr}: ${t.titel || "Lejhøjtaler.dk"}`;
    const besked = String(body.besked ?? "").trim().slice(0, 4000);
    const html = tilbudMailHtml(t, {
      total: serverTotal(table, t),
      besked,
      telefon: formatDkPhone(site.phone),
      email: site.company.email,
      footer: mailFooter(site),
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${context.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      signal: timeoutSignal(TIMEOUT_MAIL_MS),
      body: JSON.stringify({
        from: "Lejhøjtaler.dk <info@lejhojtaler.dk>",
        to: [til],
        // Kopi til os selv, så tilbuddet kan findes i indbakken
        bcc: notifyRecipients(context.env.NOTIFY_EMAIL),
        reply_to: site.company.email.split(",")[0].trim(),
        subject: emne,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[tilbud] resend-fejl:", await res.text().catch(() => ""));
      return json({ error: "Mailen kunne ikke sendes" }, 502);
    }
    const sendt: Tilbud = {
      ...t,
      // Er det allerede set eller booket, skal en ny afsendelse ikke rulle det tilbage
      status: t.status === "kladde" ? "sendt" : t.status,
      sendtAt: nu,
      sendtTil: til,
      opdateret: nu,
    };
    return json({ tilbud: await gem(kv, sendt, table) });
  }

  return json({ error: "Ukendt handling" }, 400);
};
