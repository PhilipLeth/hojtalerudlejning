import { describe, it, expect } from "vitest";
import { parseYouTubeId, youTubeEmbedUrl } from "@/lib/youtube";

describe("parseYouTubeId", () => {
  it("parser watch-URL", () => {
    expect(parseYouTubeId("https://www.youtube.com/watch?v=0M7xZoiqn9U")).toBe("0M7xZoiqn9U");
  });

  it("parser youtu.be-URL", () => {
    expect(parseYouTubeId("https://youtu.be/0M7xZoiqn9U")).toBe("0M7xZoiqn9U");
  });

  it("parser embed-URL", () => {
    expect(parseYouTubeId("https://www.youtube.com/embed/0M7xZoiqn9U")).toBe("0M7xZoiqn9U");
  });

  it("parser shorts-URL", () => {
    expect(parseYouTubeId("https://www.youtube.com/shorts/0M7xZoiqn9U")).toBe("0M7xZoiqn9U");
  });

  it("accepterer bare video-ID", () => {
    expect(parseYouTubeId("0M7xZoiqn9U")).toBe("0M7xZoiqn9U");
  });

  it("returnerer null for ugyldig input", () => {
    expect(parseYouTubeId("")).toBeNull();
    expect(parseYouTubeId("https://example.com")).toBeNull();
    expect(parseYouTubeId("not-a-url")).toBeNull();
  });
});

describe("youTubeEmbedUrl", () => {
  it("bruger privacy-enhanced domæne", () => {
    expect(youTubeEmbedUrl("0M7xZoiqn9U")).toBe(
      "https://www.youtube-nocookie.com/embed/0M7xZoiqn9U",
    );
  });
});
