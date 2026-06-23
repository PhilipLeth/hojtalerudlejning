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
    <div className="fixed top-0 left-0 right-0 z-50 bg-brand-500 text-black text-center text-sm font-semibold py-2 px-4">
      <span
        className={`inline-block transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        {messages[index]}
      </span>
    </div>
  );
}
