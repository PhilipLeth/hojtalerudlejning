import "@testing-library/jest-dom/vitest";

// Gem den ægte fetch (stripe-api.test.ts skal bruge den mod Stripe testmode)
(globalThis as any).__realFetch = global.fetch;

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
