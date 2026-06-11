import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffef0",
          100: "#fffcdb",
          200: "#fff8b3",
          300: "#fff180",
          400: "#ffe94d",
          500: "#ffd600",
          600: "#e6c000",
          700: "#bfa000",
          800: "#997f00",
          900: "#735f00",
        },
      },
    },
  },
  plugins: [],
};
export default config;
