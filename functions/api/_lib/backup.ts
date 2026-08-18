/* ───── Sikkerhedskopi af KV ─────
 *
 * Alt hvad forretningen ved — ordrer, betalinger, fakturanumre, indstillinger —
 * ligger i én KV-namespace. Der er ingen fortryd i KV: en overskrevet eller
 * slettet nøgle er væk. Derfor et dagligt øjebliksbillede i R2, som ligger i
 * samme Cloudflare-konto, men er en anden tjeneste: en fejl i det ene sted
 * tager ikke det andet med.
 *
 * Kopien lægges under "backups/" og kan IKKE hentes udefra: billed-ruten
 * (/api/image/[key]) slår kun op under "img/", og filerne kræver login.
 */

export interface BackupEnv {
  BOOKINGS: KVNamespace;
  MEDIA: R2Bucket;
}

export const BACKUP_PREFIX = "backups/";

/**
 * Nøgler der ikke skal med.
 *
 * Sessioner er kortlivede og ville lade en gammel kopi genskabe et login, der
 * burde være udløbet. De gamle base64-billeder i KV fylder megabytes og ligger
 * i forvejen som filer i R2.
 */
const SKIP_PREFIXES = ["admin_session_", "image:"];

export interface Snapshot {
  version: 1;
  takenAt: string;
  keys: number;
  data: Record<string, unknown>;
}

/** Hele KV som ét objekt. Værdier der er JSON gemmes som JSON, så filen kan læses. */
export async function buildSnapshot(kv: KVNamespace): Promise<Snapshot> {
  const data: Record<string, unknown> = {};
  let cursor: string | undefined;
  let count = 0;

  do {
    const page = await kv.list({ cursor });
    for (const key of page.keys) {
      if (SKIP_PREFIXES.some((p) => key.name.startsWith(p))) continue;
      const raw = await kv.get(key.name);
      if (raw === null) continue;
      try {
        data[key.name] = JSON.parse(raw);
      } catch {
        // Ikke-JSON (fx en tæller) gemmes som den står
        data[key.name] = raw;
      }
      count++;
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return { version: 1, takenAt: new Date().toISOString(), keys: count, data };
}

/** Filnavnet for en dag. Én kopi pr. dag — en ekstra kørsel overskriver dagens. */
export function backupKey(at: Date): string {
  return `${BACKUP_PREFIX}${at.toISOString().slice(0, 10)}.json`;
}

export async function writeBackup(env: BackupEnv, snapshot: Snapshot): Promise<{ key: string; size: number }> {
  const key = backupKey(new Date(snapshot.takenAt));
  const body = JSON.stringify(snapshot);
  await env.MEDIA.put(key, body, {
    httpMetadata: { contentType: "application/json" },
    customMetadata: { keys: String(snapshot.keys), takenAt: snapshot.takenAt },
  });
  return { key, size: body.length };
}

export interface BackupFile {
  key: string;
  size: number;
  uploaded: string;
  keys?: string;
}

export async function listBackups(env: BackupEnv): Promise<BackupFile[]> {
  const out: BackupFile[] = [];
  let cursor: string | undefined;
  do {
    const page = await env.MEDIA.list({ prefix: BACKUP_PREFIX, cursor, include: ["customMetadata"] });
    for (const o of page.objects) {
      out.push({
        key: o.key,
        size: o.size,
        uploaded: o.uploaded.toISOString(),
        keys: o.customMetadata?.keys,
      });
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  // Nyeste først
  return out.sort((a, b) => b.key.localeCompare(a.key));
}

/**
 * Ryd op. 90 dage er valgt så en fejl, der først opdages efter en sæson, stadig
 * kan rulles tilbage — filerne fylder kilobytes, så det er ikke pladsen der
 * begrænser.
 */
export async function pruneBackups(env: BackupEnv, keepDays = 90): Promise<string[]> {
  const cutoff = new Date(Date.now() - keepDays * 86400000).toISOString().slice(0, 10);
  const removed: string[] = [];
  for (const file of await listBackups(env)) {
    const day = file.key.slice(BACKUP_PREFIX.length, BACKUP_PREFIX.length + 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(day) && day < cutoff) {
      await env.MEDIA.delete(file.key);
      removed.push(file.key);
    }
  }
  return removed;
}
