// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      colors: {
        brand: {
          gold: "#D4AF37",
          dark: "#0F172A",
          soft: "#F7F3E8",
          ivory: "#FFFBF3",
        },
      },
      boxShadow: {
        luxe:
          "0 12px 24px rgba(16,24,40,.08), 0 6px 16px rgba(212,175,55,.12)",
      },
    },
  },
  plugins: [],
};
