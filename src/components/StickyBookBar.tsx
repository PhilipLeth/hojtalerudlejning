"use client";

import { useState, useEffect } from "react";
import { applyDiscount, isSummerSale } from "@/lib/products";
import { useProducts } from "@/lib/useProducts";

export default function StickyBookBar() {
  const [visible, setVisible] = useState(false);
  const summer = isSummerSale();
  const { startPrice } = useProducts();
  const price = summer ? applyDiscount(startPrice) : startPrice;

  useEffect(() => {
    // Booking ligger i en drawer nu — vis baren når man er scrollet forbi hero
    // (eller efter 400px hvis der ikke findes en hero-sektion på siden)
    const hero = document.querySelector<HTMLElement>("section.hero-section");
    const book = document.getElementById("book");

    if (hero) {
      let pastHero = false;
      let inBook = false;
      const update = () => setVisible(pastHero && !inBook);

      const heroObs = new IntersectionObserver(
        ([e]) => {
          pastHero = !e.isIntersecting;
          update();
        },
        { threshold: 0 }
      );
      heroObs.observe(hero);

      let bookObs: IntersectionObserver | null = null;
      if (book) {
        bookObs = new IntersectionObserver(
          ([e]) => {
            inBook = e.isIntersecting;
            update();
          },
          { threshold: 0.15 }
        );
        bookObs.observe(book);
      }

      return () => {
        heroObs.disconnect();
        bookObs?.disconnect();
      };
    }

    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 flex items-center justify-center gap-4 ${
        summer
          ? "bg-gradient-to-r from-amber-500 to-orange-500"
          : "bg-brand-500"
      } px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.25)] rounded-t-2xl transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {summer && (
        <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs font-bold text-white">-25%</span>
      )}
      <a
        href="#book"
        className="font-semibold text-black text-base"
      >
        Book fra {summer && <span className="line-through opacity-60 mr-1">{startPrice}</span>}{price} kr
      </a>

      <span className="h-5 w-px bg-black/20" />

      <a
        href="tel:+4550150731"
        className="flex items-center gap-1.5 font-semibold text-black text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z"
            clipRule="evenodd"
          />
        </svg>
        50 15 07 31
      </a>
    </div>
  );
}
