// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],   // ← MUY IMPORTANTE
  safelist: [
    { pattern: /bg-\[var\(--.*\)\]/ },
    { pattern: /text-\[var\(--.*\)\]/ },
    { pattern: /border-\[var\(--.*\)\]/ },
  ],
  theme: {
    extend: {
      borderRadius: { xl: "0.75rem", "2xl": "1rem" },
      boxShadow: { elev: "0 12px 28px rgba(0,0,0,.08)" },
    },
  },
  plugins: [],
};
