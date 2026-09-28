"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import SiteSearch from "@/components/SiteSearch";
import { localizedHref, sprogskifteSti } from "@/lib/enPages";
import { activeSeasons } from "@/lib/seasons";
import { TOPMENU, TOPMENU_MERE } from "@/lib/products";
import "./ProHeader.css";

/**
 * Topmenuen. Produktkategorierne står fremme; eventløsninger, cases og
 * sæsonerne ligger i en fold-ud-menu, se TOPMENU i products.ts.
 */
export default function SiteHeader() {
 const pathname = usePathname();
 const [mereÅben, setMereÅben] = useState(false);
 const mereRef = useRef<HTMLDivElement>(null);

 // Luk fold-ud-menuen ved navigation, klik udenfor og Escape
 useEffect(() => { setMereÅben(false); }, [pathname]);
 useEffect(() => {
  if (!mereÅben) return;
  const klik = (e: MouseEvent) => { if (!mereRef.current?.contains(e.target as Node)) setMereÅben(false); };
  const tast = (e: KeyboardEvent) => { if (e.key === "Escape") setMereÅben(false); };
  document.addEventListener("mousedown", klik);
  document.addEventListener("keydown", tast);
  return () => { document.removeEventListener("mousedown", klik); document.removeEventListener("keydown", tast); };
 }, [mereÅben]);

 if (pathname?.startsWith("/admin")) return null;
 const en = pathname?.startsWith("/en"); const locale = en ? "en" : "da";
 const href = (path:string) => localizedHref(path,locale);
 const aktiv = (path:string) => pathname === path || pathname === href(path);
 return <header className="pro-header"><div className="pro-header-inner">
 <Link className="pro-logo" href={href("/")} aria-label={en ? "LejHøjtaler.dk, back to front page" : "LejHøjtaler.dk, til forsiden"}><span className="pro-mark" aria-hidden>l<span>h</span></span><span>LejHøjtaler.dk<small>{en ? "Sound & light rental" : "Lyd- og lysudlejning"}</small></span></Link>
 <nav className="pro-nav" aria-label={en ? "Main navigation" : "Hovednavigation"}>
 {TOPMENU.map((l) => (
  <Link key={l.href} href={href(l.href)} aria-current={aktiv(l.href) ? "page" : undefined}>{en ? l.label_en : l.label}</Link>
 ))}
 <div className="pro-more" ref={mereRef}>
  <button type="button" aria-expanded={mereÅben} aria-haspopup="true" onClick={() => setMereÅben((v) => !v)}>
   {en ? TOPMENU_MERE.label_en : TOPMENU_MERE.label}<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
  </button>
  {mereÅben && <div className="pro-more-panel">
   {TOPMENU_MERE.links.map((l) => (
    <Link key={l.href} href={href(l.href)}>{en ? l.label_en : l.label}</Link>
   ))}
   {activeSeasons().map((s) => (
    <Link key={s.id} href={href(s.href)} style={{color: s.accent}} className="pro-season">{en ? s.navEn : s.navDa}</Link>
   ))}
  </div>}
 </div>
 </nav>
 <div className="pro-header-actions"><SiteSearch locale={locale}/><Link className="pro-language" href={sprogskifteSti(pathname || "/", en ? "da" : "en")}>{en ? "DA" : "EN"}</Link><Link className="pro-quote" href={en ? "/en#shop-pakker" : "/#shop-pakker"}>{en ? "Most rented" : "Mest udlejede"}</Link></div>
 </div></header>;
}
