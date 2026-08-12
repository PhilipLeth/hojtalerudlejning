/**
 * Kontakt skal kunne nås fra menuen — både som almindeligt menupunkt og som
 * en tydelig genvej øverst til større/professionelle forespørgsler, så de ikke
 * skal presses gennem det almindelige bookingflow.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import BurgerMenu from "@/components/BurgerMenu";
import ContactForm from "@/components/ContactForm";
import { validateContact } from "../../functions/api/contact";

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
});

describe("Burger-menu: kontakt", () => {
  it("har et Kontakt-menupunkt", () => {
    render(<BurgerMenu />);
    const link = screen.getByRole("link", { name: "Kontakt" });
    expect(link).toHaveAttribute("href", "/kontakt");
  });

  it("har en pro-request øverst der bærer emnet med", () => {
    render(<BurgerMenu />);
    expect(screen.getByText("Større arrangement?")).toBeInTheDocument();
    const cta = screen.getByText("Større arrangement?").closest("a")!;
    expect(cta).toHaveAttribute("href", "/kontakt?emne=erhverv");
  });

  it("pro-request står før produktkategorierne i DOM-rækkefølgen", () => {
    const { container } = render(<BurgerMenu />);
    const html = container.innerHTML;
    expect(html.indexOf("Større arrangement?")).toBeLessThan(html.indexOf("Lyd &amp; Højtalere"));
  });
});

describe("Kontaktformular: emne fra URL", () => {
  it("viser erhvervs-hjælpetekst når ?emne=erhverv", async () => {
    window.history.pushState({}, "", "/kontakt?emne=erhverv");
    render(<ContactForm />);
    expect(await screen.findByText("Erhvervsforespørgsel")).toBeInTheDocument();
  });

  it("viser ingen emne-boks uden parameter", () => {
    window.history.pushState({}, "", "/kontakt");
    render(<ContactForm />);
    expect(screen.queryByText("Erhvervsforespørgsel")).not.toBeInTheDocument();
  });
});

describe("Kontakt-API: emne i emnelinjen", () => {
  const base = { name: "Anna", email: "a@b.dk", message: "Vi holder firmafest for 80" };

  it("tager emnet med, så et pro-request kan kendes i indbakken", () => {
    const v = validateContact({ ...base, topic: "Erhvervsforespørgsel" });
    expect(v).toMatchObject({ ok: true, topic: "Erhvervsforespørgsel" });
  });

  it("afviser linjeskift og for langt emne (ingen header-injection)", () => {
    const v = validateContact({ ...base, topic: "A\r\nBcc: nogen@andet.dk" + "x".repeat(80) });
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.topic).not.toContain("\n");
      expect(v.topic).not.toContain("\r");
      expect(v.topic.length).toBeLessThanOrEqual(40);
    }
  });

  it("virker uden emne", () => {
    const v = validateContact(base);
    expect(v).toMatchObject({ ok: true, topic: "" });
  });
});
