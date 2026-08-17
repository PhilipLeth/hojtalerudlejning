import type { Metadata } from "next";

import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://lejhojtaler.dk/en",
    languages: localeAlternates("/"),
  },
};

export default function EnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
