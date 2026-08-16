/**
 * Fælles skal om alle /admin-sider.
 *
 * Sitet kører mørkt tema på <body>, og admin er lyst. Sider der ikke selv
 * satte baggrund og tekstfarve arvede den lyse tekst og blev ulæselige på de
 * hvide kort. Skallen (.admin-shell i globals.css) sætter lys baggrund, mørk
 * tekst og læsbare formularfelter ét sted for alle admin-sider.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">{children}</div>;
}
