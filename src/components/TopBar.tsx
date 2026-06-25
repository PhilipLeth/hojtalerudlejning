"use client";

import { useState, useEffect } from "react";

const messages = [
  "Lej op til 5 dage til samme pris",
  "Til private fester & professionelle events",
  "Levering og opsætning i KBH fra 500,-",
  "Ingen depositum. Betal ved afhentning",
  "Alle kabler inkluderet",
];

export default function TopBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-brand-500 text-black text-sm font-semibold py-2 px-4">
      {/* Mobile: rotate messages */}
      <div className="md:hidden text-center">
        <span
          className={`inline-block transition-all duration-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          {messages[index]}
        </span>
      </div>

      {/* Desktop: show all USPs */}
      <div className="hidden md:flex items-center justify-center gap-6">
        {messages.map((msg, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
