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

import { useEffect, useRef, useState } from "react";
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
      { href: "/admin/udlevering", label: "Udlevering", hint: "Dagens afhentninger + underskrift" },
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
      { href: "/admin/kommunikation", label: "Kommunikation", hint: "Opfølgning efter ordre og delekode" },
    ],
  },
  {
    group: "Økonomi",
    items: [
      { href: "/accounting", label: "Regnskab", hint: "Omsætning, udestående, betalingsmetoder" },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/admin/indstillinger", label: "Indstillinger", hint: "Åbningstider, kontakt m.m." },
      { href: "/admin/notifikationer", label: "Notifikationer", hint: "Push på telefonen når en ordre lander" },
    ],
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

  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // Luk når man klikker ved siden af eller trykker Escape — ellers står
  // menuen åben oven på det man prøver at arbejde med
  useEffect(() => {
    if (!openGroup) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenGroup(null); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openGroup]);

  const currentItem = ALL_ITEMS.find((i) => i.href === current);
  const currentGroup = ADMIN_MENU.find((g) => g.items.some((i) => i.href === current))?.group;

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
        // Én knap pr. gruppe der folder sine sider ud — fjorten links på
        // række gjorde bjælken bredere end indholdet nedenunder
        <nav ref={navRef} style={{ display: "flex", alignItems: "center", gap: "6px", position: "relative" }}>
          {ADMIN_MENU.map((g) => {
            const isCurrent = g.group === currentGroup;
            const open = openGroup === g.group;
            return (
              <div key={g.group} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setOpenGroup(open ? null : g.group)}
                  aria-expanded={open}
                  aria-haspopup="menu"
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 12px", fontSize: "13px", cursor: "pointer",
                    fontWeight: isCurrent ? 700 : 500,
                    background: open ? "#111" : isCurrent ? "#f2f2f2" : "#fff",
                    color: open ? "#fff" : "#333",
                    border: `1px solid ${open || isCurrent ? "#111" : "#e2e2e2"}`,
                    borderRadius: "8px", whiteSpace: "nowrap",
                  }}
                >
                  {g.group}
                  {isCurrent && currentItem && (
                    <span style={{ fontWeight: 400, opacity: open ? 0.8 : 0.55 }}>· {currentItem.label}</span>
                  )}
                  <span style={{ fontSize: "9px", opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
                </button>

                {open && (
                  <div
                    role="menu"
                    aria-label={g.group}
                    style={{
                      position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: "230px",
                      background: "#fff", border: "1px solid #e2e2e2", borderRadius: "10px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "6px", zIndex: 20,
                    }}
                  >
                    {g.items.map((item) => {
                      const active = item.href === current;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          aria-current={active ? "page" : undefined}
                          style={{
                            display: "block", padding: "8px 10px", borderRadius: "6px",
                            textDecoration: "none", color: active ? "#fff" : "#222",
                            background: active ? "#111" : "transparent",
                          }}
                        >
                          <span style={{ fontSize: "13px", fontWeight: active ? 700 : 500 }}>{item.label}</span>
                          {item.hint && (
                            <span style={{ display: "block", fontSize: "11px", color: active ? "rgba(255,255,255,0.7)" : "#888" }}>
                              {item.hint}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      )}

      {actions}
    </header>
  );
}
