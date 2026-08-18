import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "furniture-viz — se møblerne i dit eget billede",
  description:
    "Tag et billede af din have eller stue og se butikkens møbler stå i det, før du køber. Send din favorit som tilbudsforespørgsel direkte til butikken.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#2f6b46",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body className="min-h-screen bg-creme text-blaek antialiased">
        {children}
        {/* Service worker gør appen installérbar (PWA) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if ("serviceWorker" in navigator) { navigator.serviceWorker.register("/sw.js").catch(function () {}); }`,
          }}
        />
      </body>
    </html>
  );
}
