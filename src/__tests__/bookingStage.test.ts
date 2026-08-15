import { describe, it, expect } from "vitest";
import {
  bookingStage,
  isActiveStage,
  nextStep,
  openIssues,
  paymentSettled,
  pickupDateFromBooking,
  startOfDay,
  weekendKey,
  type StageBooking,
} from "@/lib/bookingStage";

const today = startOfDay(new Date("2026-08-14T10:00:00"));

/** Overstået leje: hentet 7. aug, skulle afleveres 10. aug */
const OVERSTAAET = { pickup: "2026-08-07T00:00:00.000Z", returnDate: "2026-08-10T00:00:00.000Z" };
/** Leje frem i tiden */
const FREMTIDIG = { pickup: "2026-08-22T00:00:00.000Z", returnDate: "2026-08-23T00:00:00.000Z" };

function booking(over: Partial<StageBooking> = {}): StageBooking {
  return {
    // id-præfikset er oprettelsesdatoen — bevidst forskellig fra lejeperioden
    id: "20260810-abc",
    createdAt: "2026-08-10T12:00:00.000Z",
    status: "ny",
    days: 3,
    pickup: "2026-08-14T00:00:00.000Z",
    returnDate: "2026-08-17T00:00:00.000Z",
    ...over,
  };
}

function labels(b: StageBooking) {
  return openIssues(b, today).map((i) => `${i.track}: ${i.label}`);
}

describe("pickupDateFromBooking", () => {
  it("bruger lejeperiodens start, ikke oprettelsesdatoen", () => {
    expect(pickupDateFromBooking(booking())).toEqual(startOfDay(new Date("2026-08-14T00:00:00.000Z")));
  });

  it("falder tilbage på id-præfikset for gamle bookinger uden pickup", () => {
    const b = booking({ pickup: undefined, returnDate: undefined });
    expect(pickupDateFromBooking(b)).toEqual(startOfDay(new Date("2026-08-10T00:00:00.000Z")));
  });
});

describe("weekendKey", () => {
  it("grupperer fredagsafhentning på samme fredag", () => {
    expect(weekendKey(booking())).toBe("2026-08-14");
  });

  it("grupperer lørdagsafhentning på fredagen før — ikke weekenden efter", () => {
    expect(weekendKey(booking(FREMTIDIG))).toBe("2026-08-21");
  });
});

describe("udstyrssporet", () => {
  it("går bestilt → bekræftet → pakket → udleveret → returneret", () => {
    expect(nextStep("ny")?.id).toBe("bekraeftet");
    expect(nextStep("bekraeftet")?.id).toBe("pakket");
    expect(nextStep("pakket")?.id).toBe("afhentet");
    expect(nextStep("afhentet")?.id).toBe("afleveret");
    expect(nextStep("afleveret")).toBeNull();
    expect(nextStep("annulleret_kunde")).toBeNull();
  });
});

describe("bookingStage", () => {
  it("regner en leje der starter i dag som igangværende", () => {
    expect(bookingStage(booking(), today)).toBe("igangvaerende");
  });

  it("regner en leje frem i tiden som kommende", () => {
    expect(bookingStage(booking(FREMTIDIG), today)).toBe("kommende");
  });

  it("regner udleveret udstyr som igangværende, også før afhentningsdatoen", () => {
    expect(bookingStage(booking({ ...FREMTIDIG, status: "afhentet" }), today)).toBe("igangvaerende");
  });

  it("holder en overstået leje i overblikket indtil den er registreret retur", () => {
    const b = booking({ ...OVERSTAAET, status: "afhentet" });
    expect(bookingStage(b, today)).toBe("afslut");
    expect(isActiveStage(bookingStage(b, today))).toBe(true);
  });

  it("holder en returneret men ubetalt leje i overblikket", () => {
    expect(bookingStage(booking({ ...OVERSTAAET, status: "afleveret" }), today)).toBe("afslut");
  });

  it("lukker sagen når den er både returneret og betalt", () => {
    const manual = booking({ ...OVERSTAAET, status: "afleveret", paidManual: true, paidMethod: "mobilepay" });
    const online = booking({ ...OVERSTAAET, status: "afleveret", paid: true });
    expect(bookingStage(manual, today)).toBe("afsluttet");
    expect(bookingStage(online, today)).toBe("afsluttet");
    expect(isActiveStage(bookingStage(manual, today))).toBe(false);
  });

  it("kræver ikke inspektion for at lukke sagen", () => {
    const b = booking({ ...OVERSTAAET, status: "afleveret", paidManual: true, inspected: false });
    expect(bookingStage(b, today)).toBe("afsluttet");
  });

  it("tager annullerede bookinger ud af det aktive overblik", () => {
    expect(bookingStage(booking({ status: "annulleret_kunde" }), today)).toBe("annulleret");
    expect(isActiveStage(bookingStage(booking({ status: "annulleret_admin" }), today))).toBe(false);
  });
});

describe("depositum", () => {
  it("holder sagen åben indtil depositum er betalt tilbage", () => {
    const b = booking({ ...OVERSTAAET, status: "afleveret", paidManual: true, depositAmount: 500, depositState: "modtaget" });
    expect(paymentSettled(b)).toBe(false);
    expect(bookingStage(b, today)).toBe("afslut");
    expect(labels(b)).toContain("betaling: Depositum ikke tilbagebetalt");
  });

  it("lukker sagen når depositum er tilbagebetalt", () => {
    const b = booking({ ...OVERSTAAET, status: "afleveret", paidManual: true, depositAmount: 500, depositState: "tilbagebetalt" });
    expect(bookingStage(b, today)).toBe("afsluttet");
  });

  it("melder ikke 'ikke tilbagebetalt' om penge vi aldrig har modtaget", () => {
    const b = booking({ ...OVERSTAAET, status: "afleveret", paidManual: true, depositAmount: 500, depositState: "afventer" });
    expect(labels(b)).toEqual(["betaling: Depositum ikke modtaget"]);
    // Sagen bliver liggende, så det uafklarede depositum bliver set
    expect(bookingStage(b, today)).toBe("afslut");
  });

  it("blander sig ikke når der ikke er taget depositum", () => {
    const b = booking({ ...OVERSTAAET, status: "afleveret", paidManual: true, depositAmount: 0 });
    expect(paymentSettled(b)).toBe(true);
    expect(labels(b)).toEqual([]);
  });
});

describe("openIssues", () => {
  it("nævner intet for en booking der endnu ikke er udleveret", () => {
    expect(labels(booking(FREMTIDIG))).toEqual([]);
  });

  it("melder ikke manglende retur før udstyret er udleveret", () => {
    // Perioden er forbi, men bookingen står stadig som blot bekræftet:
    // det er udleveringen der aldrig blev registreret, ikke returen
    const b = booking({ ...OVERSTAAET, status: "bekraeftet" });
    expect(labels(b)).toEqual(["udstyr: Aldrig registreret udleveret"]);
  });

  it("melder manglende retur når udstyret er udleveret og perioden er forbi", () => {
    const b = booking({ ...OVERSTAAET, status: "afhentet" });
    expect(labels(b)).toEqual(["udstyr: Ikke registreret retur", "betaling: Betaling mangler"]);
  });

  it("melder kun betaling når udstyret er registreret retur", () => {
    const b = booking({ ...OVERSTAAET, status: "afleveret" });
    expect(labels(b)).toEqual(["betaling: Betaling mangler"]);
  });

  it("melder manglende depositum når udstyret er udleveret", () => {
    const b = booking({ status: "afhentet", paidManual: true, depositAmount: 500, depositState: "afventer" });
    expect(labels(b)).toEqual(["betaling: Depositum ikke modtaget"]);
  });

  it("melder intet på en annulleret booking", () => {
    expect(labels(booking({ ...OVERSTAAET, status: "annulleret_kunde" }))).toEqual([]);
  });
});
