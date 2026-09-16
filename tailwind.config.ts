import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f6ff",
          100: "#e5edff",
          200: "#c7d8ff",
          300: "#5784e6",
          400: "#225cdb",
          500: "#1249cf",
          600: "#103dae",
          700: "#12368b",
          800: "#152f6a",
          900: "#12284a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
