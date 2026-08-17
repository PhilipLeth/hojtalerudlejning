/**
 * Fælles skal om alle /admin-sider.
 *
 * Sitet kører mørkt tema på <body>, og admin er lyst. Sider der ikke selv
 * satte baggrund og tekstfarve arvede den lyse tekst og blev ulæselige på de
 * hvide kort. Skallen (.admin-shell i globals.css) sætter lys baggrund, mørk
 * tekst og læsbare formularfelter ét sted for alle admin-sider.
 */
import type { Metadata } from "next";

/**
 * Admin er et bagkontor, men siderne bygges statisk og udstilles derfor på
 * samme domæne som resten. robots.txt afviser dem, og dette tag afviser dem
 * igen for de crawlere der allerede har fundet en URL — robots.txt forhindrer
 * ikke indeksering af en side nogen har linket til.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">{children}</div>;
}
