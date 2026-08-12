/** Kapacitets-ikon: personfigurer i stigende størrelse viser hvor stor en
 * fest anlægget passer til. Udfyldte figurer = niveau (1-3), resten står
 * som svage silhuetter, så stigen kan aflæses på tværs af produktkortene.
 */

export type CapacityLevel = 1 | 2 | 3;

/** Niveau pr. produkt — matcher prisstigen, ikke fritekst-kapaciteten */
const LEVELS: Record<string, CapacityLevel> = {
  thumpgo: 1,
  party: 1,
  soundboks: 2,
  festival: 2,
  festival_bas: 3,
};

export function capacityLevel(productId: string): CapacityLevel {
  return LEVELS[productId] ?? 2;
}

function Person({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={filled ? "text-brand-400" : "text-white/15"}
      fill="currentColor"
    >
      <path d="M12 11.5a4.25 4.25 0 1 0-4.25-4.25A4.25 4.25 0 0 0 12 11.5Zm0 2.1c-4.6 0-7.5 2.3-7.5 5.4v1.5h15V19c0-3.1-2.9-5.4-7.5-5.4Z" />
    </svg>
  );
}

export default function CapacityBadge({
  level,
  label,
  className = "",
}: {
  level: CapacityLevel;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-end gap-0.5 ${className}`}
      role="img"
      aria-label={label}
      title={label}
    >
      <Person filled={level >= 1} size={13} />
      <Person filled={level >= 2} size={16} />
      <Person filled={level >= 3} size={19} />
      <span className="ml-1.5 self-center text-xs font-semibold text-white/60">{label}</span>
    </span>
  );
}
