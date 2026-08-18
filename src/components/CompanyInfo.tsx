"use client";

/**
 * Firmaets oplysninger, hentet fra /admin/indstillinger.
 *
 * Små byggeklodser i stedet for tekst i hver enkelt side, så en flytning eller
 * en ny mailadresse kun skal skrives ét sted. Første render viser standarden
 * fra koden — den samme som ligger i den statiske HTML — og bytter til admins
 * værdier, når indstillingerne er hentet.
 */

import { useSiteSettings } from "@/lib/useSiteSettings";
import { formatAddress, formatCompanyLine } from "@/lib/siteInfo";

/** "Halvtolv 9, 1. th, 1436 København K" */
export function CompanyAddress() {
  const { company } = useSiteSettings();
  return <>{formatAddress(company)}</>;
}

/** Firmanavnet alene */
export function CompanyName() {
  const { company } = useSiteSettings();
  return <>{company.name}</>;
}

/** CVR-nummeret, uden ordet CVR */
export function CompanyCvr() {
  const { company } = useSiteSettings();
  return <>{company.cvr}</>;
}

/** Alt på én linje — til lejesedler, bunden af sider og lign. */
export function CompanyLine({ className = "" }: { className?: string }) {
  const { company } = useSiteSettings();
  return <span className={className}>{formatCompanyLine(company)}</span>;
}

/** Mailadressen som ren tekst */
export function CompanyEmail() {
  const { company } = useSiteSettings();
  return <>{company.email}</>;
}

/** Mailadressen som et klikbart link */
export function CompanyEmailLink({ className = "", children }: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { company } = useSiteSettings();
  return (
    <a href={`mailto:${company.email}`} className={className}>
      {children ?? company.email}
    </a>
  );
}

/** Navn, adresse og CVR som tre linjer — footeren */
export function CompanyBlock() {
  const { company } = useSiteSettings();
  return (
    <>
      <p className="font-medium text-white/50">{company.name}</p>
      <p className="mt-1">
        {company.street} &middot; {company.postalCode} {company.city}
      </p>
      <p className="mt-1">CVR {company.cvr}</p>
    </>
  );
}
