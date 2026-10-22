/**
 * Login-link på mail. Samme Resend-afsender som ordremails, så linket kommer
 * fra en adresse Frederik og Philip allerede kender og har whitelistet.
 */
import { TIMEOUT_MAIL_MS, timeoutSignal } from "../../../src/lib/fetchTimeout";
import { MAGIC_TTL_SEC } from "./adminAuth";

export interface MagicMailEnv {
  RESEND_API_KEY?: string;
}

export function magicLinkMail(name: string, link: string): { subject: string; html: string } {
  const minutter = Math.round(MAGIC_TTL_SEC / 60);
  return {
    subject: "Dit login-link til Lejhøjtaler admin",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#111">
        <h2 style="margin:0 0 12px">Hej ${name}</h2>
        <p>Tryk på knappen for at logge ind i admin. Linket virker én gang og i ${minutter} minutter.</p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#000;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Log ind</a>
        </p>
        <p style="color:#666;font-size:13px">Har du ikke bedt om linket, kan du bare ignorere mailen. Ingen kan logge ind uden den.</p>
        <p style="color:#999;font-size:12px;word-break:break-all">${link}</p>
      </div>`,
  };
}

export async function sendMagicLinkMail(
  env: MagicMailEnv,
  to: string,
  name: string,
  link: string,
): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  const mail = magicLinkMail(name, link);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      signal: timeoutSignal(TIMEOUT_MAIL_MS),
      body: JSON.stringify({ from: "Lejhøjtaler.dk <info@lejhojtaler.dk>", to: [to], subject: mail.subject, html: mail.html }),
    });
    if (!res.ok) {
      console.error("[magicMail] resend:", (await res.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[magicMail] kunne ikke sende:", e);
    return false;
  }
}
