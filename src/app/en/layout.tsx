import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://lejhojtaler.dk/en",
    languages: {
      da: "https://lejhojtaler.dk",
      en: "https://lejhojtaler.dk/en",
    },
  },
};

export default function EnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
