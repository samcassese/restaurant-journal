import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ef",
          100: "#e0e9d9",
          200: "#c5d4b8",
          300: "#9fb88a",
          400: "#7a9b5c",
          500: "#5c7d3d",
          600: "#4a6528",
          700: "#3d5420",
          800: "#33441b",
          900: "#2b3818",
          950: "#1a2310",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
