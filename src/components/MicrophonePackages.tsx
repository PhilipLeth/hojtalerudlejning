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
      ? "From a speech without mains power to a presentation with two wireless microphones. Speakers and connecting cables are included."
      : "Fra en tale uden stikkontakt til en præsentation med to trådløse mikrofoner. Højtalere og forbindelseskabler er med."}
    note={en
      ? "The battery package uses a wired microphone. Wireless receivers, mixers and projectors need mains power. Tell us which laptop or music source you are bringing so we can match the connections."
      : "Batteripakken bruger mikrofon med kabel. Trådløse modtagere, mixere og projektorer kræver strøm. Oplys hvilken computer eller musikkilde du medbringer, så tilslutningerne passer."}
  />;
}
