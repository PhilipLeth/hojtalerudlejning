import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import AdresseInput from "@/components/AdresseInput";

/**
 * Adressefeltet med DAWA-autofuldførelse. API'et mockes — testene handler om
 * komponentens opførsel: forslag vises, et valg udfylder feltet, og en død
 * API-forbindelse efterlader et almindeligt tekstfelt, ikke et brud.
 */

const DAWA_SVAR = [
  { tekst: "Vermlandsgade 66, 2300 København S" },
  { tekst: "Vermlandsgade 65, 2300 København S" },
];

beforeEach(() => {
  vi.useRealTimers();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(DAWA_SVAR),
  }) as any;
});

function Wrapper() {
  const [value, setValue] = useState("");
  return <AdresseInput value={value} onChange={setValue} placeholder="Din adresse" />;
}

describe("AdresseInput", () => {
  it("slår ikke op før tre tegn", async () => {
    render(<Wrapper />);
    fireEvent.change(screen.getByPlaceholderText("Din adresse"), { target: { value: "Ve" } });
    await new Promise((r) => setTimeout(r, 350));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("viser forslag fra DAWA og udfylder feltet ved valg", async () => {
    render(<Wrapper />);
    const felt = screen.getByPlaceholderText("Din adresse");
    fireEvent.change(felt, { target: { value: "Vermlandsgade 6" } });

    await waitFor(() => {
      expect(screen.getByText("Vermlandsgade 66, 2300 København S")).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("api.dataforsyningen.dk/adresser/autocomplete"),
    );

    fireEvent.mouseDown(screen.getByText("Vermlandsgade 66, 2300 København S"));
    await waitFor(() => {
      expect((felt as HTMLInputElement).value).toBe("Vermlandsgade 66, 2300 København S");
    });
    // Listen lukker efter valget
    expect(screen.queryByText("Vermlandsgade 65, 2300 København S")).not.toBeInTheDocument();
  });

  it("piletaster + Enter vælger et forslag", async () => {
    render(<Wrapper />);
    const felt = screen.getByPlaceholderText("Din adresse");
    fireEvent.change(felt, { target: { value: "Vermlandsgade" } });
    await waitFor(() => {
      expect(screen.getByText("Vermlandsgade 66, 2300 København S")).toBeInTheDocument();
    });
    fireEvent.keyDown(felt, { key: "ArrowDown" });
    fireEvent.keyDown(felt, { key: "ArrowDown" });
    fireEvent.keyDown(felt, { key: "Enter" });
    await waitFor(() => {
      expect((felt as HTMLInputElement).value).toBe("Vermlandsgade 65, 2300 København S");
    });
  });

  it("API-fejl efterlader et almindeligt tekstfelt — kunden kan skrive selv", async () => {
    (global.fetch as any).mockRejectedValue(new Error("net down"));
    render(<Wrapper />);
    const felt = screen.getByPlaceholderText("Din adresse");
    fireEvent.change(felt, { target: { value: "Vermlandsgade 66" } });
    await new Promise((r) => setTimeout(r, 350));
    expect((felt as HTMLInputElement).value).toBe("Vermlandsgade 66");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
