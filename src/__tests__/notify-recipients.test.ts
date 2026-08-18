import { describe, it, expect } from "vitest";
import { notifyRecipients } from "../../functions/api/_lib/notify";

describe("notifyRecipients", () => {
  it("holder én adresse uændret", () => {
    expect(notifyRecipients("frederikemil8@gmail.com")).toEqual(["frederikemil8@gmail.com"]);
  });

  it("deler en kommasepareret liste og trimmer mellemrum", () => {
    expect(notifyRecipients("frederikemil8@gmail.com, lejhojtaler@gmail.com")).toEqual([
      "frederikemil8@gmail.com",
      "lejhojtaler@gmail.com",
    ]);
  });

  it("springer tomme felter over, så en efterladt komma ikke afviser hele mailen", () => {
    expect(notifyRecipients("a@b.dk,,  ,c@d.dk,")).toEqual(["a@b.dk", "c@d.dk"]);
  });

  it("fjerner gengangere uanset store bogstaver — ellers får modtageren ordren to gange", () => {
    expect(notifyRecipients("Info@Lejhojtaler.dk, info@lejhojtaler.dk")).toEqual([
      "Info@Lejhojtaler.dk",
    ]);
  });

  it("giver en tom liste når variablen mangler", () => {
    expect(notifyRecipients(undefined)).toEqual([]);
    expect(notifyRecipients("")).toEqual([]);
    expect(notifyRecipients("   ")).toEqual([]);
  });
});
