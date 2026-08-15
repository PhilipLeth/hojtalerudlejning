/**
 * Konverteringssporing. Regressionstest for hvorfor GA4 aldrig registrerede
 * bookinger: eventet blev kun sendt HVIS window.dataLayer allerede fandtes,
 * og der blev aldrig sendt et GA4-purchase-event.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { trackBookingFormStart, trackPurchase } from "@/lib/analytics";

type Win = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };

function w(): Win {
  return window as Win;
}

beforeEach(() => {
  delete (w() as Record<string, unknown>).dataLayer;
  delete (w() as Record<string, unknown>).gtag;
  sessionStorage.clear();
});

describe("trackBookingFormStart", () => {
  it("sender form_start med form_id=booking selvom dataLayer mangler", () => {
    trackBookingFormStart({ value: 495, itemCount: 1 });
    const events = (w().dataLayer as Array<{ event?: string; form_id?: string }>);
    expect(events.some((e) => e.event === "form_start" && e.form_id === "booking")).toBe(true);
  });

  it("sender GA4 form_start via gtag", () => {
    const gtag = vi.fn();
    w().gtag = gtag;
    trackBookingFormStart({ value: 895, itemCount: 2 });
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "form_start",
      expect.objectContaining({ form_id: "booking", value: 895, currency: "DKK" })
    );
  });

  it("deduplikerer — kun én form_start pr. session", () => {
    const gtag = vi.fn();
    w().gtag = gtag;
    trackBookingFormStart({ value: 495 });
    trackBookingFormStart({ value: 495 });
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it("sender booking_form_start til GTM-triggers", () => {
    trackBookingFormStart({ value: 395, itemCount: 1 });
    const events = (w().dataLayer as Array<{ event?: string }>).map((e) => e.event);
    expect(events).toContain("booking_form_start");
  });
});

describe("trackPurchase", () => {
  it("sender eventet selvom dataLayer ikke findes endnu (GTM ikke loadet)", () => {
    expect(w().dataLayer).toBeUndefined();
    trackPurchase({ transactionId: "booking_1", value: 500 });
    expect(Array.isArray(w().dataLayer)).toBe(true);
    const events = (w().dataLayer as Array<{ event?: string }>).map((e) => e.event);
    expect(events).toContain("purchase");
  });

  it("sender GA4 purchase via gtag, så konvertering registreres uden GTM-opsætning", () => {
    const gtag = vi.fn();
    w().gtag = gtag;
    trackPurchase({
      transactionId: "booking_2",
      value: 1100,
      items: [{ id: "pakke_karaoke", name: "Karaokepakken", price: 1100 }],
      paymentMethod: "online",
    });
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "purchase",
      expect.objectContaining({ transaction_id: "booking_2", value: 1100, currency: "DKK" })
    );
    const payload = gtag.mock.calls[0][2] as { items: Array<{ item_id: string }> };
    expect(payload.items[0].item_id).toBe("pakke_karaoke");
  });

  it("beholder det gamle booking_complete-event til eksisterende GTM-triggers", () => {
    trackPurchase({ transactionId: "booking_3", value: 295 });
    const events = (w().dataLayer as Array<{ event?: string }>).map((e) => e.event);
    expect(events).toContain("booking_complete");
  });

  it("deduplikerer, så genindlæsning af kvitteringssiden ikke tæller dobbelt", () => {
    const gtag = vi.fn();
    w().gtag = gtag;
    trackPurchase({ transactionId: "booking_4", value: 500 });
    trackPurchase({ transactionId: "booking_4", value: 500 });
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it("tæller forskellige bookinger hver for sig", () => {
    const gtag = vi.fn();
    w().gtag = gtag;
    trackPurchase({ transactionId: "booking_5", value: 500 });
    trackPurchase({ transactionId: "booking_6", value: 900 });
    expect(gtag).toHaveBeenCalledTimes(2);
  });
});
