interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
  RESEND_API_KEY: string;
  /** Direkte "skriv en anmeldelse"-link fra Google Business Profile (g.page/r/…/review) */
  GOOGLE_REVIEW_URL?: string;
}

// Direkte "skriv en anmeldelse"-link fra Google Business Profile. Ligger som
// default i koden (det er en offentlig URL, ikke en hemmelighed), så mailen
// altid virker. GOOGLE_REVIEW_URL kan overskrive det uden ny deploy.
// Sender videre til search.google.com/local/writereview?placeid=ChIJ9UxZq-xTUkYRsiSY3hvy-MY
const GOOGLE_REVIEW_FALLBACK = "https://g.page/r/CbIkmN4b8vjGEBM/review";

function reviewMailHtml(name: string, reviewUrl: string, locale?: string): { subject: string; html: string } {
  if (locale === "en") {
    return {
      subject: "Thanks for renting with us — got 30 seconds? ⭐",
      html: `
        <div style="font-family:sans-serif;max-width:480px;">
          <p>Hi ${name},</p>
          <p>We hope you had a great party with the music pumping!</p>
          <p>We'd really appreciate it if you'd take 30 seconds to leave us a review — it means a lot to us as a small business and helps others find us.</p>
          <p style="margin:20px 0;">
            <a href="${reviewUrl}" style="display:inline-block;background:#bfa000;color:#000;font-weight:bold;padding:12px 24px;border-radius:24px;text-decoration:none;">⭐ Review us on Google</a>
          </p>
          <p>If you have any questions, or need gear for your next party, you're always welcome to reply to this email.</p>
          <p>Thanks again!</p>
          <p>Best regards,<br>Lejhøjtaler.dk</p>
          <p style="margin-top:16px;color:#bbb;font-size:12px;">Scharling Studio &middot; Halvtolv 9, 1. th &middot; 1436 København K &middot; CVR 40994904</p>
        </div>`,
    };
  }
  return {
    subject: "Tak for denne gang — vil du give os en anmeldelse? ⭐",
    html: `
      <div style="font-family:sans-serif;max-width:480px;">
        <p>Hej ${name},</p>
        <p>Håber I har haft en fed weekend med musikken kørende!</p>
        <p>Vi vil sætte stor pris på, hvis du vil bruge 30 sekunder på at give os en anmeldelse på Google — det betyder rigtig meget for os som lille virksomhed, og hjælper andre med at finde os.</p>
        <p style="margin:20px 0;">
          <a href="${reviewUrl}" style="display:inline-block;background:#bfa000;color:#000;font-weight:bold;padding:12px 24px;border-radius:24px;text-decoration:none;">⭐ Anmeld os på Google</a>
        </p>
        <p>Har du spørgsmål, eller mangler du udstyr til næste fest, er du altid velkommen til at svare på denne mail.</p>
        <p>Mange tak for denne gang!</p>
        <p>Bedste hilsner,<br>Lejhøjtaler.dk</p>
        <p style="margin-top:16px;color:#bbb;font-size:12px;">Scharling Studio &middot; Halvtolv 9, 1. th &middot; 1436 København K &middot; CVR 40994904</p>
      </div>`,
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

interface UpdateBody {
  id: string;
  status?: string;
  action?: "delete";
}

const VALID_STATUSES = ["ny", "bekraeftet", "afhentet", "afleveret"];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const secret = url.searchParams.get("secret");

  if (!context.env.ADMIN_SECRET || secret !== context.env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const body: UpdateBody = await context.request.json();

    // Slet booking (kræver eksplicit action)
    if (body.action === "delete") {
      if (!body.id || !body.id.startsWith("booking_")) {
        return new Response(JSON.stringify({ error: "Invalid booking id" }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      const existing = await context.env.BOOKINGS.get(body.id);
      if (!existing) {
        return new Response(JSON.stringify({ error: "Booking not found" }), {
          status: 404,
          headers: corsHeaders,
        });
      }
      await context.env.BOOKINGS.delete(body.id);
      return new Response(JSON.stringify({ ok: true, deleted: body.id }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (!body.id || !body.status) {
      return new Response(JSON.stringify({ error: "Missing id or status" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!VALID_STATUSES.includes(body.status)) {
      return new Response(
        JSON.stringify({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    const existing = await context.env.BOOKINGS.get(body.id);
    if (!existing) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const booking = JSON.parse(existing);
    const previousStatus = booking.status;
    booking.status = body.status;
    booking.updatedAt = new Date().toISOString();

    // Follow-up anmeldelsesmail (Google) når udstyret er afleveret — kun én gang
    if (
      body.status === "afleveret" &&
      previousStatus !== "afleveret" &&
      !booking.reviewMailSentAt &&
      booking.email &&
      context.env.RESEND_API_KEY
    ) {
      try {
        const reviewUrl = context.env.GOOGLE_REVIEW_URL || GOOGLE_REVIEW_FALLBACK;
        const mail = reviewMailHtml(booking.name || "", reviewUrl, booking.locale);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Lejhøjtaler.dk <booking@lejhojtaler.dk>",
            to: [booking.email],
            subject: mail.subject,
            html: mail.html,
          }),
        });
        if (res.ok) {
          const sentAt = new Date().toISOString();
          booking.reviewMailSentAt = sentAt;
          booking.communications = [
            ...(Array.isArray(booking.communications) ? booking.communications : []),
            {
              type: "anmeldelse",
              label: "Anmeldelsesmail (Google)",
              to: booking.email,
              sentAt,
            },
          ];
        } else {
          console.error("Review mail failed:", await res.text());
        }
      } catch (e) {
        // Statusopdateringen må ikke fejle pga. mailen
        console.error("Review mail error:", e);
      }
    }

    await context.env.BOOKINGS.put(body.id, JSON.stringify(booking));

    return new Response(JSON.stringify({ ok: true, booking }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("Update error:", e);
    return new Response(JSON.stringify({ error: "Failed to update booking" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
