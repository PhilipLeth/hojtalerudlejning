import "@testing-library/jest-dom/vitest";

// Mock fetch globally
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        inventory: { party: 1, festival: 1, lys: 2 },
        booked: { party: 0, festival: 0, lys: 0 },
        blocked_dates: [],
      }),
  })
) as any;
