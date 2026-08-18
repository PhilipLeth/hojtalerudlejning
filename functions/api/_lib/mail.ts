/**
 * Forespørgsels-mail til tenanten via Resend (samme leverandør som
 * lejhojtalers bookingmails). Uden nøgle springes afsendelse over —
 * forespørgslen ligger stadig i KV og ses i admin.
 */

import type { QuoteRequest, TenantRecord } from "../../../shared/types";

interface MailEnv {
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
}

export type MailStatus = "sendt" | "ingen-noegle" | "ingen-modtager" | "fejl";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildMailHtml(req: QuoteRequest, origin: string): string {
  const billede = req.imageUrl
    ? `<p><a href="${origin}${req.imageUrl}"><img src="${origin}${req.imageUrl}" alt="Kundens valgte opstilling" style="max-width:480px;border-radius:8px"/></a></p>`
    : "";
  const scene = req.sceneUrl ? `<p><a href="${origin}${req.sceneUrl}">Kundens originale foto</a></p>` : "";
  return [
    `<h2>Ny tilbudsforespørgsel</h2>`,
    `<p><strong>${esc(req.name)}</strong><br/>`,
    `<a href="mailto:${esc(req.email)}">${esc(req.email)}</a> · <a href="tel:${esc(req.phone)}">${esc(req.phone)}</a></p>`,
    `<p><strong>Produkter:</strong> ${req.productNames.map(esc).join(", ") || "(ingen valgt)"}</p>`,
    req.message ? `<p><strong>Besked:</strong> ${esc(req.message)}</p>` : "",
    billede,
    scene,
    `<p style="color:#888">Svar direkte på denne mail — den går til kunden.</p>`,
  ].join("\n");
}

export async function sendRequestMail(
  env: MailEnv,
  tenant: TenantRecord,
  req: QuoteRequest,
  origin: string,
): Promise<MailStatus> {
  if (!env.RESEND_API_KEY) return "ingen-noegle";
  if (!tenant.notifyEmail) return "ingen-modtager";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.MAIL_FROM ?? "Furniture Viz <onboarding@resend.dev>",
        to: [tenant.notifyEmail],
        reply_to: req.email,
        subject: `Tilbudsforespørgsel fra ${req.name} — ${req.productNames.join(", ").slice(0, 80) || "møbler"}`,
        html: buildMailHtml(req, origin),
      }),
    });
    if (!res.ok) {
      console.log("[mail] Resend-fejl", res.status, (await res.text()).slice(0, 200));
      return "fejl";
    }
    return "sendt";
  } catch (e) {
    console.log("[mail] netværksfejl", e instanceof Error ? e.message : e);
    return "fejl";
  }
}
