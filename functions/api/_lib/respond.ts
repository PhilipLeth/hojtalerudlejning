/** Små helpers til JSON-svar fra Pages Functions. */

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

export function fejl(message: string, status = 400): Response {
  return json({ error: message }, status);
}

/** Fælles env for alle api-functions. */
export interface Env {
  DATA: KVNamespace;
  MEDIA: R2Bucket;
  PLATFORM_SECRET?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
  RATE_LIMIT_HOUR?: string;
}
