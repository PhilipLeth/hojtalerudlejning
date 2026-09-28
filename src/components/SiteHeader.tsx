"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteSearch from "@/components/SiteSearch";
import { localizedHref, sprogskifteSti } from "@/lib/enPages";
import { TOPMENU } from "@/lib/products";
import "./ProHeader.css";

/**
 * Topmenuen: kun produktkategorierne, se TOPMENU i products.ts.
 * Eventløsninger, cases og sæsonerne står i burgermenuen under "Events &
 * sæson" (Philip, 28. sept 2026: de stod to steder).
 */
export default function SiteHeader() {
 const pathname = usePathname();

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
 </nav>
 <div className="pro-header-actions"><SiteSearch locale={locale}/><Link className="pro-language" href={sprogskifteSti(pathname || "/", en ? "da" : "en")}>{en ? "DA" : "EN"}</Link><Link className="pro-quote" href={en ? "/en#shop-pakker" : "/#shop-pakker"}>{en ? "Most rented" : "Mest udlejede"}</Link></div>
 </div></header>;
}
