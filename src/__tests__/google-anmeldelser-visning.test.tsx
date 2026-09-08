/**
 * Anmeldelsessektionen på sitet.
 *
 * Kortene skal vise det Google leverer — navn, stjerner, "for 2 uger siden"
 * og et link tilbage til Google. Og lige så vigtigt: er der ingen ægte
 * anmeldelser, forsvinder sektionen helt. Sitet havde tidligere fire
 * opdigtede citater det sted, og de kommer ikke igen.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import GoogleReviews from "@/components/GoogleReviews";
import { __nulstilAnmeldelsesCache } from "@/lib/useGoogleReviews";

const SVAR = {
  rating: 4.9,
  total: 27,
  url: "https://maps.google.com/?cid=1",
  fetchedAt: "2026-09-07T08:00:00Z",
  reviews: [
    {
      author: "Bo Hansen",
      rating: 5,
      text: "Kanon lyd til fødselsdagen, og nem afhentning på Amager.",
      relative: "for 2 uger siden",
      publishTime: "2026-09-01T10:00:00Z",
      uri: "https://www.google.com/maps/reviews/bo",
      photo: "https://lh3.googleusercontent.com/a/bo",
    },
    {
      author: "Carla Nielsen",
      rating: 4,
      text: "Alt virkede, og de svarede hurtigt på SMS.",
      relative: "for en måned siden",
      publishTime: "2026-08-01T10:00:00Z",
    },
    {
      author: "Dan Frank",
      rating: 5,
      text:
        "Fed pakke til prisen. Vi lejede den store pakke til en firmafest i Nordhavn, og alt spillede fra første sekund. Højtalerne kunne sagtens fylde salen, kablerne var der alle sammen, og afleveringen dagen efter tog to minutter. Vi lejer helt sikkert igen næste år.",
      relative: "for to måneder siden",
      publishTime: "2026-07-01T10:00:00Z",
    },
    {
      author: "Anne Kold",
      rating: 5,
      text: "Klar anbefaling herfra.",
      relative: "for tre måneder siden",
      publishTime: "2026-06-01T10:00:00Z",
    },
  ],
};

function mockSvar(json: unknown) {
  global.fetch = vi.fn(async () => ({ ok: true, json: async () => json })) as any;
}

beforeEach(() => {
  __nulstilAnmeldelsesCache();
});

afterEach(() => cleanup());

describe("Google-anmeldelser på sitet", () => {
  it("viser de fire anmeldelser med navn, stjerner og tidspunkt", async () => {
    mockSvar(SVAR);
    render(<GoogleReviews />);

    expect(await screen.findByText("Bo Hansen")).toBeInTheDocument();
    for (const navn of ["Carla Nielsen", "Dan Frank", "Anne Kold"]) {
      expect(screen.getByText(navn)).toBeInTheDocument();
    }
    expect(screen.getByText("for 2 uger siden")).toBeInTheDocument();
    // Gennemsnittet skrives med dansk komma
    expect(screen.getByText("4,9")).toBeInTheDocument();
    // Antallet står der bevidst ikke: fire anmeldelser læses som "få", også
    // når de er femstjernede. Anmeldelserne taler for sig selv.
    expect(screen.queryByText(/27/)).not.toBeInTheDocument();
    expect(screen.queryByText(/anmeldelser på Google/)).not.toBeInTheDocument();
    // Stjernerne står som tekst for skærmlæsere
    expect(screen.getAllByLabelText("5 / 5").length).toBeGreaterThan(0);
  });

  it("linker til profilen og til at skrive en anmeldelse", async () => {
    mockSvar(SVAR);
    render(<GoogleReviews />);

    const alle = await screen.findByText("Se alle på Google");
    expect(alle.closest("a")).toHaveAttribute("href", "https://maps.google.com/?cid=1");
    expect(screen.getByText("Skriv en anmeldelse").closest("a")).toHaveAttribute(
      "href",
      "https://g.page/r/CbIkmN4b8vjGEBM/review",
    );
  });

  it("folder lange anmeldelser ud uden at ændre teksten", async () => {
    mockSvar(SVAR);
    render(<GoogleReviews />);

    const knap = await screen.findByText("Læs mere");
    // Hele teksten står i DOM'en hele tiden — vi klipper kun visuelt
    const lang = screen.getByText(/Fed pakke til prisen/);
    expect(lang.textContent).toBe(SVAR.reviews[2].text);
    expect(lang.className).toContain("line-clamp-5");

    fireEvent.click(knap);
    expect(screen.getByText(/Fed pakke til prisen/).className).not.toContain("line-clamp-5");
    expect(screen.getByText("Vis mindre")).toBeInTheDocument();
  });

  it("viser intet — og opfinder ingen rating — når der ingen anmeldelser er", async () => {
    mockSvar({ rating: null, total: 0, url: null, reviews: [], fetchedAt: "" });
    const { container } = render(<GoogleReviews />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(screen.queryByText(/på Google/)).not.toBeInTheDocument();
  });

  it("viser intet hvis /api/anmeldelser fejler", async () => {
    global.fetch = vi.fn(async () => {
      throw new Error("nede");
    }) as any;
    const { container } = render(<GoogleReviews />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("giver tre anmeldelser deres egen kolonne i stedet for to plus en", async () => {
    mockSvar({ ...SVAR, reviews: SVAR.reviews.slice(0, 3) });
    render(<GoogleReviews />);

    const kort = await screen.findByText("Bo Hansen");
    const gitter = kort.closest("article")!.parentElement!;
    expect(gitter.className).toContain("sm:grid-cols-3");
  });

  it("viser engelsk tekst på /en", async () => {
    mockSvar(SVAR);
    render(<GoogleReviews locale="en" />);

    expect(await screen.findByText("See all on Google")).toBeInTheDocument();
    // Engelsk bruger punktum i decimaltallet
    expect(screen.getByText("4.9")).toBeInTheDocument();
  });

  it("henter kun én gang selvom sektionen står flere steder på siden", async () => {
    mockSvar(SVAR);
    render(
      <>
        <GoogleReviews />
        <GoogleReviews />
      </>,
    );

    await screen.findAllByText("Bo Hansen");
    expect((global.fetch as any).mock.calls).toHaveLength(1);
  });
});
