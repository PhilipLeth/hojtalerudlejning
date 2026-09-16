"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteSearch from "@/components/SiteSearch";
import { danskSti, localizedHref } from "@/lib/enPages";
import "./ProHeader.css";
export default function SiteHeader() {
 const pathname = usePathname();
 if (pathname?.startsWith("/admin")) return null;
 const en = pathname?.startsWith("/en"); const locale = en ? "en" : "da";
 const href = (path:string) => localizedHref(path,locale);
 return <header className="pro-header"><div className="pro-header-inner">
 <Link className="pro-logo" href={href("/")} aria-label={en ? "LejHøjtaler.dk, back to front page" : "LejHøjtaler.dk, til forsiden"}><span className="pro-mark" aria-hidden>l<span>h</span></span><span>LejHøjtaler.dk<small>{en ? "Sound, light & AV" : "Lyd, lys & AV"}</small></span></Link>
 <nav className="pro-nav" aria-label={en ? "Main navigation" : "Hovednavigation"}><Link href={href("/eventloesninger")}>{en ? "Event solutions" : "Eventløsninger"}</Link><Link href={href("/cases")}>{en ? "Setups & cases" : "Opstillinger & cases"}</Link><Link href={href("/av-udstyr")}>{en ? "Equipment rental" : "Lej udstyr"}</Link></nav>
 <div className="pro-header-actions"><SiteSearch locale={locale}/><Link className="pro-language" href={localizedHref(danskSti(pathname || "/"),en ? "da" : "en")}>{en ? "DA" : "EN"}</Link><Link className="pro-quote" href={href("/eventloesninger")+"#situationer"}>{en ? "Shop packages" : "Se pakker"}</Link></div>
 </div></header>;
}
