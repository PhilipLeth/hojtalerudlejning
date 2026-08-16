"use client";

/**
 * Én menu for hele admin.
 *
 * Hver admin-side havde før sin egen håndplukkede stribe links — Rabatkoder
 * pegede på Ads og Regler, Lejeseddel på Lager og Nyhedsbrev, og ingen af dem
 * på resten. Man kunne ikke komme fra A til B uden at gå om forsiden.
 *
 * Nu er der ét sted der bestemmer hvad menuen består af, grupperet efter det
 * man er i gang med: dagens drift, katalog og priser, markedsføring, system.
 */

import { usePathname } from "next/navigation";
import { useIsMobile } from "@/lib/useIsMobile";

export interface AdminMenuItem {
  href: string;
  label: string;
  /** Kort forklaring — vises som tooltip på skærm */
  hint?: string;
}

export interface AdminMenuGroup {
  group: string;
  items: AdminMenuItem[];
}

export const ADMIN_MENU: AdminMenuGroup[] = [
  {
    group: "Drift",
    items: [
      { href: "/admin", label: "Bookinger", hint: "Ordrer, status, betaling" },
      { href: "/admin/kalender", label: "Kalender", hint: "Hvad er ude hvornår" },
      { href: "/admin/udlevering", label: "Udlevering", hint: "Gennemgang og kundens underskrift" },
      { href: "/admin/lejeseddel", label: "Lejeseddel", hint: "Print lejekontrakt" },
      { href: "/admin/lager", label: "Lager", hint: "Antal af hvert produkt" },
      { href: "/admin/udsolgt", label: "Udsolgt", hint: "Udsolgte dage og blokeringer" },
    ],
  },
  {
    group: "Katalog & priser",
    items: [
      { href: "/admin/produkter", label: "Produkter", hint: "Navne, priser, billeder, video" },
      { href: "/admin/rabatkoder", label: "Rabatkoder", hint: "Koder kunden kan taste" },
      { href: "/admin/udsalg", label: "Udsalg", hint: "Weekendudsalg på det der står tilbage" },
    ],
  },
  {
    group: "Markedsføring",
    items: [
      { href: "/admin/ads", label: "Ads", hint: "Google Ads-kampagner" },
      { href: "/admin/regler", label: "Regler", hint: "Automatiske annonceregler" },
      { href: "/admin/kanaler", label: "Kanaler", hint: "DBA, Marketplace og øvrige feeds" },
      { href: "/admin/nyhedsbrev", label: "Nyhedsbrev", hint: "Tilmeldte modtagere" },
    ],
  },
  {
    group: "System",
    items: [{ href: "/admin/indstillinger", label: "Indstillinger", hint: "Åbningstider, kontakt m.m." }],
  },
];

const ALL_ITEMS = ADMIN_MENU.flatMap((g) => g.items);

/** Sidens eget navn ud fra stien — så ingen side skal fortælle hvad den hedder */
export function adminPageTitle(pathname: string): string {
  const hit = ALL_ITEMS.find((i) => i.href === pathname) ?? ALL_ITEMS.find((i) => i.href !== "/admin" && pathname.startsWith(i.href));
  return hit?.label ?? "Admin";
}

export default function AdminNav({ title, actions }: { title?: string; actions?: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  const isMobile = useIsMobile();
  const current = ALL_ITEMS.find((i) => i.href === pathname)?.href
    ?? ALL_ITEMS.find((i) => i.href !== "/admin" && pathname.startsWith(i.href))?.href
    ?? "/admin";

  const link = (item: AdminMenuItem) => {
    const active = item.href === current;
    return (
      <a
        key={item.href}
        href={item.href}
        title={item.hint}
        aria-current={active ? "page" : undefined}
        style={{
          padding: "6px 12px",
          fontSize: "13px",
          fontWeight: active ? 700 : 400,
          borderRadius: "6px",
          textDecoration: "none",
          whiteSpace: "nowrap",
          background: active ? "#111" : "#f2f2f2",
          color: active ? "#fff" : "#333",
          border: "1px solid",
          borderColor: active ? "#111" : "#e2e2e2",
        }}
      >
        {item.label}
      </a>
    );
  };

  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid #eee",
        padding: isMobile ? "10px 12px" : "10px 20px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <strong style={{ fontSize: "17px", marginRight: "auto" }}>{title ?? adminPageTitle(current)}</strong>

      {isMobile ? (
        // Én dropdown med grupperne som overskrifter — hele menuen på ét tryk
        <select
          value={current}
          onChange={(e) => { window.location.href = e.target.value; }}
          aria-label="Gå til admin-side"
          style={{ flex: "1 1 160px", minWidth: 0, padding: "10px", fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff", color: "#111" }}
        >
          {ADMIN_MENU.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.items.map((i) => (
                <option key={i.href} value={i.href}>{i.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      ) : (
        <nav style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {ADMIN_MENU.map((g, gi) => (
            <span key={g.group} style={{ display: "flex", alignItems: "center", gap: "6px" }} title={g.group}>
              {gi > 0 && <span style={{ width: "1px", height: "18px", background: "#e5e5e5", margin: "0 4px" }} />}
              {g.items.map(link)}
            </span>
          ))}
        </nav>
      )}

      {actions}
    </header>
  );
}
