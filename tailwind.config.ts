import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brandfarven sættes runtime pr. tenant via CSS-variablen --brand;
        // disse er platformens egne farver (landing page m.m.)
        skov: "#2f6b46",
        creme: "#faf7f2",
        blaek: "#1f2a24",
      },
    },
  },
  plugins: [],
};

export default config;
