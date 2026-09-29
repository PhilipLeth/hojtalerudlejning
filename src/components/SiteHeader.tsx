"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteSearch from "@/components/SiteSearch";
import { localizedHref, sprogskifteSti } from "@/lib/enPages";
import { TOPMENU } from "@/lib/products";
import "./ProHeader.css";

/**
 * Topmenuen: de fire produktkategorier, hver med en dropdown af undersiderne i
 * grupper med overskrift (hover og tastatur via :focus-within). Se TOPMENU i products.ts. Knappen
 * "Mest udlejede" er fjernet 28. sept 2026.
 * Eventløsninger, cases og sæsonerne står i burgermenuen under "Events &
 * sæson" (Philip, 28. sept 2026: de stod to steder).
 */
export default function SiteHeader() {
 const pathname = usePathname();

 if (pathname?.startsWith("/admin")) return null;
 const en = pathname?.startsWith("/en"); const locale = en ? "en" : "da";
 // localizedHref kender kun stier, ikke ankre: "/tilbehoer#stroem" skal blive "/en/tilbehoer#stroem"
 const href = (path:string) => { const [sti, anker] = path.split("#"); return localizedHref(sti,locale) + (anker ? `#${anker}` : ""); };
 // Et klik i en dropdown flytter fokus væk, så panelet lukker efter navigationen
 const luk = () => (document.activeElement as HTMLElement | null)?.blur();
 const aktiv = (path:string) => pathname === path || pathname === href(path);
 return <header className="pro-header"><div className="pro-header-inner">
 <Link className="pro-logo" href={href("/")} aria-label={en ? "LejHøjtaler.dk, back to front page" : "LejHøjtaler.dk, til forsiden"}><span className="pro-mark" aria-hidden>l<span>h</span></span><span>LejHøjtaler.dk<small>{en ? "Sound & light rental" : "Lyd- og lysudlejning"}</small></span></Link>
 <nav className="pro-nav" aria-label={en ? "Main navigation" : "Hovednavigation"}>
 {TOPMENU.map((l) => (
  <div key={l.href} className="pro-drop">
   <Link href={href(l.href)} aria-current={aktiv(l.href) ? "page" : undefined} aria-haspopup="true" onClick={luk}>
    {en ? l.label_en : l.label}<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
   </Link>
   <div className={`pro-drop-panel${l.grupper.length > 1 ? " pro-drop-kolonner" : ""}`}>
    {l.grupper.map((g, i) => (
     <div key={g.titel ?? i} className="pro-drop-gruppe">
      {g.titel && <p className="pro-drop-titel">{en ? g.titel_en : g.titel}</p>}
      {g.links.map((u) => <Link key={u.href} href={href(u.href)} onClick={luk}>{en ? u.label_en : u.label}</Link>)}
     </div>
    ))}
   </div>
  </div>
 ))}
 </nav>
 <div className="pro-header-actions"><SiteSearch locale={locale}/><Link className="pro-language" href={sprogskifteSti(pathname || "/", en ? "da" : "en")}>{en ? "DA" : "EN"}</Link></div>
 </div></header>;
}
