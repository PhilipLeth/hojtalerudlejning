import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf2ff",
          100: "#fae5ff",
          200: "#f5ccff",
          300: "#ee9fff",
          400: "#e463ff",
          500: "#d42fff",
          600: "#b80ee6",
          700: "#9b07bf",
          800: "#80099c",
          900: "#690c7e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
