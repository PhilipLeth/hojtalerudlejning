import Link from "next/link";
import { type Locale, t } from "@/lib/i18n";

export default function Footer({ locale = "da" }: { locale?: Locale }) {
  const s = t[locale].footer;
  return (
    <footer className="relative z-20 border-t border-white/5 bg-[#07060b] px-4 py-12 text-center text-sm text-white/30">
      <p className="font-medium text-white/50">Scharling Studio</p>
      <p className="mt-1">Halvtolv 9, 1. th &middot; 1436 København K</p>
      <p className="mt-1">CVR 40994904</p>
      <p className="mt-4 flex items-center justify-center gap-4">
        <Link href={s.aboutHref} className="text-white/40 hover:text-brand-400 transition underline underline-offset-2">
          {s.about}
        </Link>
        <Link href={s.blogHref} className="text-white/40 hover:text-brand-400 transition underline underline-offset-2">
          {s.blog}
        </Link>
        <Link href={s.termsHref} className="text-white/40 hover:text-brand-400 transition underline underline-offset-2">
          {s.terms}
        </Link>
      </p>
      <p className="mt-3">&copy; {new Date().getFullYear()} Lejhøjtaler.dk</p>
    </footer>
  );
}
