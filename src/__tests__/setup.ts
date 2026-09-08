import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

/*
 * waitFor's standard er 1 sekund. Det er rigeligt alene, men i fuld suite
 * deler alle workers CPU'en, og en jsdom-tung fil (lager.test: 95 s er målt)
 * kan blive udsultet så længe, at ventetiden udløber, selvom assertionen ville
 * være blevet sand. Så fejlede 1-4 lager-tests tilfældigt — kun under fuld
 * kørsel, aldrig isoleret. Grønne tests bliver ikke langsommere af en højere
 * grænse; kun ægte fejl venter længere.
 */
configure({ asyncUtilTimeout: 4000 });

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
