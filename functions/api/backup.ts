/* ───── Sikkerhedskopi (admin + cron) ─────
 *
 * POST → tag dagens kopi og ryd gamle. Kaldes af GitHub Actions med cron-nøglen
 *        (.github/workflows/backup.yml), eller fra knappen i /admin/indstillinger.
 * GET  → hvilke kopier findes, og hent en enkelt ned (?file=backups/…json)
 *
 * Filerne indeholder alt om kunderne, så de kræver login. Cron-nøglen kan kun
 * tage en kopi — ikke hente den ned.
 */

import { requireAdmin } from "./_lib/adminAuth";
import {
  BACKUP_PREFIX,
  buildSnapshot,
  listBackups,
  pruneBackups,
  writeBackup,
  type BackupEnv,
} from "./_lib/backup";

interface Env extends BackupEnv {
  ADMIN_SECRET: string;
  /** Samme nøgle som de daglige SMS-påmindelser bruger */
  SMS_CRON_SECRET?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token, X-Cron-Secret",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

/** Sammenligning uden at afsløre hvor langt man kom */
function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const cronKey = context.request.headers.get("X-Cron-Secret");
  const cronOk = !!cronKey && !!context.env.SMS_CRON_SECRET && sameSecret(cronKey, context.env.SMS_CRON_SECRET);

  let by = "cron";
  if (!cronOk) {
    const auth = await requireAdmin(context, corsHeaders);
    if (auth instanceof Response) return auth;
    by = auth.name;
  }

  try {
    const snapshot = await buildSnapshot(context.env.BOOKINGS);
    const written = await writeBackup(context.env, snapshot);
    const removed = await pruneBackups(context.env);
    console.log(`[backup] ${written.key}: ${snapshot.keys} nøgler, ${written.size} bytes, ${removed.length} gamle fjernet (af ${by})`);
    return json({ ok: true, ...written, keys: snapshot.keys, takenAt: snapshot.takenAt, removed });
  } catch (e) {
    console.error("[backup] fejlede:", e);
    return json({ error: e instanceof Error ? e.message : "Sikkerhedskopien fejlede" }, 500);
  }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  const file = new URL(context.request.url).searchParams.get("file");
  if (file) {
    // Kun filer under backups/ — ikke resten af R2
    if (!file.startsWith(BACKUP_PREFIX) || file.includes("..")) {
      return json({ error: "Ugyldig fil" }, 400);
    }
    const object = await context.env.MEDIA.get(file);
    if (!object) return json({ error: "Filen findes ikke" }, 404);
    console.log("[backup] hentet", file, "af", auth.name);
    return new Response(object.body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${file.slice(BACKUP_PREFIX.length)}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const files = await listBackups(context.env);
  return json({ files, newest: files[0] ?? null });
};
