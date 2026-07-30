"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NAV_CATEGORIES } from "@/lib/products";

export default function BurgerMenu() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Burger button - fixed top right, below TopBar */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-12 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/10 transition hover:bg-black/80"
        aria-label={open ? "Luk menu" : "Åben menu"}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu panel */}
      <nav
        className={`fixed top-0 right-0 z-40 h-full w-80 max-w-[85vw] transform bg-[#0d0d14]/95 backdrop-blur-xl border-l border-white/5 transition-transform duration-300 ease-out overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-6 pt-20 pb-8">
          {/* Home link */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="mb-6 block text-lg font-bold text-brand-400 transition hover:text-brand-300"
          >
            Lejhøjtaler.dk
          </Link>

          {NAV_CATEGORIES.map((section) => (
            <div key={section.id} className="mb-6">
              <Link
                href={section.href}
                onClick={() => setOpen(false)}
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/30 transition hover:text-brand-400"
              >
                {section.title}
              </Link>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Bottom links */}
          <div className="mt-8 border-t border-white/5 pt-6 space-y-1">
            <Link href="/om" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              Om os
            </Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              Blog
            </Link>
            <Link href="/lejevilkaar" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              Lejevilkår
            </Link>
            <Link href="/en" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              English
            </Link>
          </div>

          {/* CTA */}
          <a
            href="/#book"
            onClick={() => setOpen(false)}
            className="mt-8 block rounded-full bg-brand-500 px-6 py-3 text-center font-semibold text-black transition hover:bg-brand-400"
          >
            Book nu
          </a>

          {/* Phone */}
          <a
            href="tel:+4550150731"
            className="mt-4 block text-center text-sm text-white/40 transition hover:text-brand-400"
          >
            Ring 50 15 07 31
          </a>
        </div>
      </nav>
    </>
  );
}
