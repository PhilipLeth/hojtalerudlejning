import BundleGrid from "./BundleGrid";
import { microphonePackages } from "@/lib/microphonePackages";
import type { Locale } from "@/lib/i18n";

/** Samme fire bookbare løsninger på begge sprog. */
export default function MicrophonePackages({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return <BundleGrid
    ids={microphonePackages.map((p) => p.id)}
    locale={locale}
    eyebrow={en ? "Microphone packages" : "Mikrofonpakker"}
    title={en ? "Choose a setup for your event" : "Vælg en løsning til dit arrangement"}
    subtitle={en
      ? "From a speech without mains power to a four-microphone panel or a Teams/Zoom hybrid. Speakers and cables included."
      : "Fra en tale uden stikkontakt til fire mikrofoner på et panel eller Teams/Zoom. Højtalere og kabler er med."}
    note={en
      ? "The battery package uses a wired microphone. Wireless receivers, mixers and projectors need mains power. Add a note when booking if you are bringing a laptop, so the connections match."
      : "Batteripakken bruger mikrofon med kabel. Trådløse modtagere, mixere og projektorer kræver strøm. Skriv i kommentaren ved booking, hvilken computer du medbringer, så tilslutningerne passer."}
  />;
}
