import type { Metadata } from "next";

/**
 * /accounting er reelt en admin-side — den bruger AdminNav og viser omsætning,
 * ubetalte ordrer og kundenavne — men ligger uden for /admin og arvede derfor
 * ikke dens noindex. Siden er en klientkomponent og kan ikke selv eksportere
 * metadata, så det ligger her.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
