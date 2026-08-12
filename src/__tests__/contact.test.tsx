/**
 * Kontaktformular: validering, API-adfærd (honeypot, Resend-kald, reply_to)
 * og komponentens succes/fejl-flow.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { validateContact, onRequestPost } from "../../functions/api/contact";
import ContactForm from "@/components/ContactForm";

describe("validateContact", () => {
  const valid = { name: "Anna", email: "anna@example.com", message: "Hej, kan jeg leje lys?" };

  it("godkender en normal besked", () => {
    const v = validateContact(valid);
    expect(v.ok).toBe(true);
  });

  it("trimmer felter", () => {
    const v = validateContact({ ...valid, name: "  Anna  " });
    expect(v.ok && v.name).toBe("Anna");
  });

  it("afviser manglende navn, dårlig email og tom besked", () => {
    expect(validateContact({ ...valid, name: "" }).ok).toBe(false);
    expect(validateContact({ ...valid, email: "ikke-en-mail" }).ok).toBe(false);
    expect(validateContact({ ...valid, message: "hej" }).ok).toBe(false);
  });

  it("afviser beskeder over 5000 tegn", () => {
    expect(validateContact({ ...valid, message: "x".repeat(5001) }).ok).toBe(false);
  });

  it("markerer udfyldt honeypot som bot — uden fejlbesked", () => {
    const v = validateContact({ ...valid, website: "http://spam.example" });
    expect(v.ok).toBe(false);
    expect("honeypot" in v && v.honeypot).toBe(true);
  });
});

describe("POST /api/contact", () => {
  const env = { RESEND_API_KEY: "re_test", NOTIFY_EMAIL: "info@lejhojtaler.dk" };

  function ctx(body: unknown) {
    return {
      env,
      request: new Request("https://lejhojtaler.dk/api/contact", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    } as Parameters<typeof onRequestPost>[0];
  }

  // setup.ts stubber fetch globalt — brug en frisk stub pr. test, ellers
  // lækker kald fra én test ind i den næstes assertions
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  it("sender mail via Resend med kundens adresse som reply_to", async () => {
    const res = await onRequestPost(ctx({ name: "Anna", email: "anna@example.com", message: "Kan jeg leje lys på lørdag?" }));
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(payload.to).toEqual(["info@lejhojtaler.dk"]);
    expect(payload.reply_to).toBe("anna@example.com");
    expect(payload.subject).toContain("Anna");
  });

  it("escaper HTML i beskeden, så en kunde ikke kan injicere markup i mailen", async () => {
    await onRequestPost(ctx({ name: "Anna", email: "a@b.dk", message: "<script>alert(1)</script> hej" }));
    const payload = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(payload.html).not.toContain("<script>");
    expect(payload.html).toContain("&lt;script&gt;");
  });

  it("giver honeypot-bots et falsk OK uden at sende mail", async () => {
    const res = await onRequestPost(ctx({ name: "Bot", email: "bot@spam.dk", message: "spam spam", website: "spam.dk" }));
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("afviser ugyldig input med 400 og fejlbesked", async () => {
    const res = await onRequestPost(ctx({ name: "A", email: "nej", message: "" }));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBeTruthy();
  });

  it("svarer 502 når Resend fejler — så kunden ved beskeden IKKE er sendt", async () => {
    fetchMock.mockResolvedValue(new Response("boom", { status: 500 }));
    const res = await onRequestPost(ctx({ name: "Anna", email: "a@b.dk", message: "hej med jer" }));
    expect(res.status).toBe(502);
  });
});

describe("ContactForm-komponenten", () => {
  it("viser succes efter afsendelse", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })));
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByPlaceholderText("Navn"), "Anna");
    await user.type(screen.getByPlaceholderText("Email"), "anna@example.com");
    await user.type(screen.getByPlaceholderText(/Din besked/), "Kan jeg leje lys på lørdag?");
    await user.click(screen.getByRole("button", { name: /Send besked/ }));
    await waitFor(() => expect(screen.getByTestId("contact-success")).toBeInTheDocument());
  });

  it("viser serverens fejlbesked og lader brugeren prøve igen", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Ugyldig emailadresse" }), { status: 400 })));
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(screen.getByPlaceholderText("Navn"), "Anna");
    await user.type(screen.getByPlaceholderText("Email"), "anna@example.com");
    await user.type(screen.getByPlaceholderText(/Din besked/), "hej hej hej");
    await user.click(screen.getByRole("button", { name: /Send besked/ }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Ugyldig emailadresse"));
    expect(screen.getByRole("button", { name: /Send besked/ })).toBeEnabled();
  });
});
