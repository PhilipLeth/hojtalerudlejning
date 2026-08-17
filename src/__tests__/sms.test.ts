import { describe, it, expect, vi } from "vitest";
import {
  CpsmsGateway,
  GatewayApiSms,
  LogSmsGateway,
  TwilioSms,
  UnconfiguredSmsGateway,
  cleanSender,
  displayPhone,
  resolveProvider,
  smsBalance,
  smsConfigured,
  smsFromEnv,
  smsLength,
  toE164Dk,
} from "@/lib/sms";
import {
  DEFAULT_SMS_SETTINGS,
  SMS_TYPES,
  buildSms,
  parseSmsSettings,
  placeLine,
  renderSms,
  smsAutoEnabled,
  smsLogEntry,
  smsVarsFor,
} from "@/lib/smsTemplates";
import { copenhagenDateKey, remindersDue } from "@/lib/smsReminders";

describe("telefonnumre", () => {
  it("tager danske numre i alle de former kunder skriver dem", () => {
    for (const raw of ["31132852", "31 13 28 52", "+45 31 13 28 52", "+4531132852", "0045 31132852", "45 31 13 28 52", " 3113-2852 "]) {
      expect(toE164Dk(raw)).toBe("+4531132852");
    }
  });

  it("afviser det der ikke kan sendes til", () => {
    // For kort, for langt, og numre der ikke findes i Danmark
    expect(toE164Dk("1234")).toBeNull();
    expect(toE164Dk("11223344")).toBeNull();
    expect(toE164Dk("")).toBeNull();
    expect(toE164Dk(null)).toBeNull();
    expect(toE164Dk("ring til mig")).toBeNull();
    // Ni cifre uden landekode er en tastefejl, ikke et nummer
    expect(toE164Dk("311328521")).toBeNull();
  });

  it("beholder et otte-cifret nummer der tilfældigvis starter med 45", () => {
    expect(toE164Dk("45454545")).toBe("+4545454545");
  });

  it("tager udenlandske numre når landekoden er skrevet eksplicit", () => {
    expect(toE164Dk("+46 70 123 45 67")).toBe("+46701234567");
    expect(toE164Dk("004917612345678")).toBe("+4917612345678");
  });

  it("viser danske numre læsbart i admin", () => {
    expect(displayPhone("+4531132852")).toBe("31 13 28 52");
    expect(displayPhone("+46701234567")).toBe("+46701234567");
  });
});

describe("beskedlængde", () => {
  it("tæller dansk tekst som GSM-7 — æ, ø og å fylder ét tegn", () => {
    const text = "Husk at aflevere højtaleren i dag på Halvtolv 9. Ring hvis I mangler mere tid.";
    const t = smsLength(text);
    expect(t.unicode).toBe(false);
    expect(t.segments).toBe(1);
    expect(t.chars).toBe(text.length);
  });

  it("et enkelt emoji halverer grænsen og kan koste en besked mere", () => {
    const text = `Tak for denne gang ⭐ ${"a".repeat(60)}`;
    const t = smsLength(text);
    expect(t.unicode).toBe(true);
    expect(t.segments).toBe(2);
  });

  it("deler lange beskeder i 153-tegns dele", () => {
    expect(smsLength("a".repeat(160)).segments).toBe(1);
    expect(smsLength("a".repeat(161)).segments).toBe(2);
    expect(smsLength("a".repeat(306)).segments).toBe(2);
    expect(smsLength("a".repeat(307)).segments).toBe(3);
  });

  it("regner € og { som to tegn", () => {
    expect(smsLength("€").chars).toBe(2);
    expect(smsLength("{}").chars).toBe(4);
  });
});

describe("gateway-valg", () => {
  it("dev-tilstand logger og sender ingenting", async () => {
    const gw = smsFromEnv({ SMS_DEV_MODE: "1" });
    expect(gw).toBeInstanceOf(LogSmsGateway);
    // Dev vinder over en token, så en lokal kørsel aldrig sender rigtige beskeder
    expect(smsFromEnv({ SMS_DEV_MODE: "1", SMS_API_TOKEN: "hemmelig" })).toBeInstanceOf(LogSmsGateway);
  });

  it("nøglerne afgør udbyderen, så et skifte kun kræver nye secrets", () => {
    expect(resolveProvider({ SMS_API_TOKEN: "tok" })).toBe("gatewayapi");
    expect(resolveProvider({ SMS_API_TOKEN: "tok", SMS_USERNAME: "frederik" })).toBe("cpsms");
    expect(resolveProvider({ SMS_API_TOKEN: "tok", SMS_ACCOUNT_SID: "AC123" })).toBe("twilio");
    expect(resolveProvider({})).toBeNull();
    // SMS_PROVIDER vinder, når flere sæt nøgler ligger side om side
    expect(resolveProvider({ SMS_PROVIDER: "gatewayapi", SMS_API_TOKEN: "tok", SMS_ACCOUNT_SID: "AC1" })).toBe("gatewayapi");
  });

  it("bygger den gateway udbyderen kræver", () => {
    expect(smsFromEnv({ SMS_API_TOKEN: "tok" })).toBeInstanceOf(GatewayApiSms);
    expect(smsFromEnv({ SMS_API_TOKEN: "tok", SMS_USERNAME: "frederik" })).toBeInstanceOf(CpsmsGateway);
    expect(smsFromEnv({ SMS_API_TOKEN: "tok", SMS_ACCOUNT_SID: "AC123" })).toBeInstanceOf(TwilioSms);
  });

  it("halve nøglesæt tæller ikke som opsat", () => {
    // CPSMS uden brugernavn og Twilio uden Account SID kan ikke sende
    expect(smsConfigured({ SMS_PROVIDER: "cpsms", SMS_API_TOKEN: "tok" })).toBe(false);
    expect(smsConfigured({ SMS_PROVIDER: "twilio", SMS_API_TOKEN: "tok" })).toBe(false);
    expect(smsFromEnv({ SMS_PROVIDER: "twilio", SMS_API_TOKEN: "tok" })).toBeInstanceOf(UnconfiguredSmsGateway);
  });

  it("produktion uden nøgler fejler højlydt i stedet for at love levering", async () => {
    const gw = smsFromEnv({});
    expect(gw).toBeInstanceOf(UnconfiguredSmsGateway);
    expect(await gw.send("+4531132852", "hej")).toEqual({ ok: false, error: "sms_ikke_konfigureret" });
    expect(smsConfigured({})).toBe(false);
    expect(smsConfigured({ SMS_API_TOKEN: "tok" })).toBe(true);
  });

  it("afsendernavnet holdes inden for GatewayAPI's regler", () => {
    // Æ, ø, å og punktum findes ikke i et afsendernavn, og der er kun plads til 11 tegn
    expect(cleanSender("Lejhøjtaler.dk")).toBe("Lejhjtalerd");
    expect(cleanSender("")).toBe("Lejhojtaler");
    expect(cleanSender("abcdefghijklmnop").length).toBe(11);
  });
});

describe("GatewayAPI-kaldet", () => {
  function fakeFetch(status: number, body: unknown) {
    return vi.fn(async () =>
      new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
    ) as unknown as typeof fetch;
  }

  it("sender token, afsender og nummer som gatewayen vil have det", async () => {
    const f = fakeFetch(200, { ids: [123456] });
    const gw = new GatewayApiSms("tok", "Lejhojtaler", f);
    const res = await gw.send("+4531132852", "Hej Agnes");

    expect(res).toEqual({ ok: true, id: "123456" });
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://gatewayapi.com/rest/mtsms");
    expect((init as RequestInit).headers).toMatchObject({ Authorization: "Token tok" });
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({
      sender: "Lejhojtaler",
      message: "Hej Agnes",
      class: "standard",
      // msisdn skal være et tal uden plus
      recipients: [{ msisdn: 4531132852 }],
    });
  });

  it("giver fejlkoden videre, så admin kan se om det er token eller saldo", async () => {
    expect((await new GatewayApiSms("tok", "L", fakeFetch(401, {})).send("+4531132852", "x")).error).toBe("gatewayapi_401");
    expect((await new GatewayApiSms("tok", "L", fakeFetch(402, {})).send("+4531132852", "x")).error).toBe("gatewayapi_402");
  });

  it("et netværk der falder ud må ikke kaste videre", async () => {
    const boom = (async () => {
      throw new Error("no net");
    }) as unknown as typeof fetch;
    expect(await new GatewayApiSms("tok", "L", boom).send("+4531132852", "x")).toEqual({
      ok: false,
      error: "netvaerksfejl",
    });
  });

  it("saldoen hentes, og en fejl giver null i stedet for at vælte siden", async () => {
    const env = { SMS_API_TOKEN: "tok" };
    expect(await smsBalance(env, fakeFetch(200, { credit: 412.5, currency: "DKK" }))).toEqual({
      credit: 412.5,
      currency: "DKK",
    });
    expect(await smsBalance(env, fakeFetch(500, {}))).toBeNull();
    // Twilio svarer med balance som streng
    expect(
      await smsBalance({ SMS_API_TOKEN: "tok", SMS_ACCOUNT_SID: "AC1" }, fakeFetch(200, { balance: "12.29", currency: "USD" })),
    ).toEqual({ credit: 12.29, currency: "USD" });
    // CPSMS har ingen saldo vi kalder — hellere ingenting end et gæt
    expect(await smsBalance({ SMS_API_TOKEN: "tok", SMS_USERNAME: "frederik" }, fakeFetch(200, { credit: 5 }))).toBeNull();
  });
});

describe("CPSMS-kaldet", () => {
  function fakeFetch(status: number, body: unknown) {
    return vi.fn(async () =>
      new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
    ) as unknown as typeof fetch;
  }

  it("sender Basic auth og nummer uden plus, som CPSMS vil have det", async () => {
    const f = fakeFetch(200, { success: [{ to: "4531132852", cost: 1, smsAmount: 1 }] });
    const res = await new CpsmsGateway("frederik", "noegle", "Lejhojtaler", f).send("+4531132852", "Hej Agnes");

    expect(res.ok).toBe(true);
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api.cpsms.dk/v2/send");
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: `Basic ${btoa("frederik:noegle")}`,
    });
    expect(JSON.parse(String((init as RequestInit).body))).toMatchObject({
      to: "4531132852",
      from: "Lejhojtaler",
      message: "Hej Agnes",
    });
  });

  it("fanger fejl i kroppen, selv når status er 200", async () => {
    const f = fakeFetch(200, { error: { code: 400, message: "Phone number should be specified as a number" } });
    expect(await new CpsmsGateway("u", "k", "L", f).send("+4531132852", "x")).toEqual({
      ok: false,
      error: "cpsms_400",
    });
  });
});

describe("Twilio-kaldet", () => {
  function fakeFetch(status: number, body: unknown) {
    return vi.fn(async () =>
      new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
    ) as unknown as typeof fetch;
  }

  it("sender form-encoded To/From/Body med Basic auth", async () => {
    const f = fakeFetch(201, { sid: "SM123", status: "queued" });
    const res = await new TwilioSms("AC1", "tok", "+4571234567", f).send("+4531132852", "Hej Agnes");

    expect(res).toEqual({ ok: true, id: "SM123" });
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://api.twilio.com/2010-04-01/Accounts/AC1/Messages.json");
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: `Basic ${btoa("AC1:tok")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    });
    const form = new URLSearchParams(String((init as RequestInit).body));
    expect(form.get("To")).toBe("+4531132852");
    expect(form.get("From")).toBe("+4571234567");
    expect(form.get("Body")).toBe("Hej Agnes");
  });

  it("et MG-id sendes som Messaging Service, ikke som afsendernummer", async () => {
    const f = fakeFetch(201, { sid: "SM1" });
    await new TwilioSms("AC1", "tok", "MG9", f).send("+4531132852", "x");
    const form = new URLSearchParams(String(((f as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit).body));
    expect(form.get("MessagingServiceSid")).toBe("MG9");
    expect(form.get("From")).toBeNull();
  });

  it("bruger Twilios egen fejlkode, så beskeden til admin kan være præcis", async () => {
    const f = fakeFetch(400, { code: 21606, message: "The From phone number is not a valid, SMS-capable Twilio number" });
    expect((await new TwilioSms("AC1", "tok", "Lejhojtaler", f).send("+4531132852", "x")).error).toBe("twilio_21606");
  });
});

describe("skabeloner", () => {
  const booking = {
    name: "Agnes Dahle Stæhr",
    phone: "31 13 28 52",
    period: "fre 21. aug → man 24. aug",
    pickup: "2026-08-21",
    returnDate: "2026-08-24",
    speaker: "Stor højtalerpakke",
    cartItems: [{ name: "Lys-pakke" }],
    total: 1995,
  };

  it("udfylder shortcodes fra ordren", () => {
    const vars = smsVarsFor(booking, { telefon: "31 13 28 52" });
    expect(vars.fornavn).toBe("Agnes");
    expect(vars.produkter).toBe("Stor højtalerpakke, Lys-pakke");
    expect(vars.dato).toContain("21. aug");
    expect(vars.returdato).toContain("24. aug");
    expect(vars.total).toBe("1.995 kr");
  });

  it("fjerner ukendte shortcodes i stedet for at sende dem til kunden", () => {
    expect(renderSms("Hej {{fornvan}}{{fornavn}}!", { fornavn: "Agnes" })).toBe("Hej Agnes!");
  });

  it("efterlader hverken dobbelte mellemrum eller tomme parenteser når en shortcode er tom", () => {
    const text = renderSms("Hej {{fornavn}}! I morgen ({{dato}}) står {{produkter}} klar.", {
      fornavn: "Agnes",
      dato: "",
      produkter: "Soundboks",
    });
    expect(text).toBe("Hej Agnes! I morgen står Soundboks klar.");
  });

  it("siger hvor udstyret skal hentes eller leveres", () => {
    expect(placeLine({ deliveryOptionId: "levering_begge", deliveryAddress: "Nørrebrogade 1" })).toBe(
      "Vi leverer til Nørrebrogade 1",
    );
    expect(placeLine({ addonIds: ["afhentning_retur"], deliveryAddress: "Nørrebrogade 1" })).toContain(
      "Hentes hos os",
    );
    expect(placeLine({})).toContain("Halvtolv 9");
  });

  it("standardteksterne bliver én besked på en almindelig ordre", () => {
    const vars = smsVarsFor(booking, { telefon: "31 13 28 52", link: "https://g.page/r/CbIkmN4b8vjGEBM/review" });
    for (const def of SMS_TYPES) {
      const built = buildSms(DEFAULT_SMS_SETTINGS, def.id, vars);
      expect(built.text, def.id).not.toContain("{{");
      expect(built.length.segments, `${def.id}: ${built.text}`).toBe(1);
      expect(built.length.unicode, def.id).toBe(false);
    }
  });

  it("hovedafbryderen slår alle typer fra på én gang", () => {
    expect(smsAutoEnabled(DEFAULT_SMS_SETTINGS, "bekraeftet")).toBe(true);
    expect(smsAutoEnabled({ ...DEFAULT_SMS_SETTINGS, enabled: false }, "bekraeftet")).toBe(false);
    // Mail dækker de to, så de er slukket som udgangspunkt
    expect(smsAutoEnabled(DEFAULT_SMS_SETTINGS, "booking_modtaget")).toBe(false);
    expect(smsAutoEnabled(DEFAULT_SMS_SETTINGS, "tak")).toBe(false);
  });

  it("parser vrøvl fra KV til brugbare indstillinger", () => {
    const s = parseSmsSettings({
      enabled: true,
      sender: "Lejhøjtaler.dk!!",
      templates: { bekraeftet: { enabled: false, text: "  Hej  " }, ukendt: { text: "x" } },
    });
    expect(s.sender).toBe("Lejhjtalerd");
    expect(s.templates.bekraeftet).toEqual({ enabled: false, text: "Hej" });
    // Manglende typer falder tilbage på standarden
    expect(s.templates.tak.text).toBe(DEFAULT_SMS_SETTINGS.templates.tak.text);
    expect(Object.keys(s.templates).sort()).toEqual(SMS_TYPES.map((t) => t.id).sort());
  });

  it("tom skabelon falder tilbage i stedet for at sende en tom besked", () => {
    expect(parseSmsSettings({ templates: { bekraeftet: { text: "   " } } }).templates.bekraeftet.text).toBe(
      DEFAULT_SMS_SETTINGS.templates.bekraeftet.text,
    );
  });

  it("loggen bærer beskedens tekst — en SMS kan ikke slås op bagefter", () => {
    const entry = smsLogEntry("bekraeftet", "+4531132852", "Din booking er bekræftet", "2026-08-17T10:00:00.000Z");
    expect(entry).toEqual({
      type: "sms_bekraeftet",
      label: "SMS: Booking bekræftet",
      to: "+4531132852",
      sentAt: "2026-08-17T10:00:00.000Z",
      note: "Din booking er bekræftet",
    });
    expect(smsLogEntry("manuel", "+4531132852", "hej").label).toBe("SMS: Skrevet i hånden");
  });
});

describe("påmindelser", () => {
  // Mandag 17. august 2026 kl. 07:00 UTC = 09:00 dansk tid, når jobbet kører.
  // Påmindelserne gælder dagen selv: hentes i dag, afleveres i dag.
  const now = new Date("2026-08-17T07:00:00Z");

  it("finder dansk dato uanset at kørslen sker i UTC", () => {
    expect(copenhagenDateKey(now)).toBe("2026-08-17");
    expect(copenhagenDateKey(now, 1)).toBe("2026-08-18");
    // 23:30 dansk tid er stadig den 17., så morgendagen er den 18.
    expect(copenhagenDateKey(new Date("2026-08-17T21:30:00Z"), 1)).toBe("2026-08-18");
    // Efter midnat i Danmark (00:30 den 18.) er morgendagen den 19.
    expect(copenhagenDateKey(new Date("2026-08-17T22:30:00Z"), 1)).toBe("2026-08-19");
  });

  it("minder om dagens afhentninger og dagens afleveringer", () => {
    const due = remindersDue(
      [
        { id: "booking_1", status: "bekraeftet", pickup: "2026-08-17", returnDate: "2026-08-20" },
        { id: "booking_2", status: "afhentet", pickup: "2026-08-14", returnDate: "2026-08-17" },
        { id: "booking_3", status: "bekraeftet", pickup: "2026-08-25", returnDate: "2026-08-28" },
      ],
      now,
    );
    expect(due).toEqual([
      { id: "booking_1", type: "afhentning_i_morgen" },
      { id: "booking_2", type: "retur_i_morgen" },
    ]);
  });

  it("sender ikke to gange, selv om jobbet kører igen", () => {
    const due = remindersDue(
      [
        {
          id: "booking_1",
          status: "bekraeftet",
          pickup: "2026-08-17",
          returnDate: "2026-08-20",
          smsSent: { afhentning_i_morgen: "2026-08-17T07:00:00.000Z" },
        },
      ],
      now,
    );
    expect(due).toEqual([]);
  });

  it("springer annullerede over, og minder ikke om at aflevere det der er afleveret", () => {
    const due = remindersDue(
      [
        { id: "booking_1", status: "annulleret_kunde", pickup: "2026-08-17", returnDate: "2026-08-20" },
        { id: "booking_2", status: "afleveret", pickup: "2026-08-14", returnDate: "2026-08-17" },
        { id: "booking_3", status: "afhentet", pickup: "2026-08-17", returnDate: "2026-08-20" },
      ],
      now,
    );
    // booking_3 er allerede hentet, så afhentningspåmindelsen er overflødig
    expect(due).toEqual([]);
  });

  it("en ordre uden datoer giver ingen påmindelse", () => {
    expect(remindersDue([{ id: "booking_1", status: "ny" }], now)).toEqual([]);
    expect(remindersDue([{ status: "ny", pickup: "2026-08-17" }], now)).toEqual([]);
  });
});
