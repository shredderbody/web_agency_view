/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--surface)",
        foreground: "var(--ink)",
        card: { DEFAULT: "var(--surface)", foreground: "var(--ink)" },
        primary: { DEFAULT: "var(--vermilion)", foreground: "var(--surface)" },
        muted: { DEFAULT: "var(--paper-2)", foreground: "var(--ink-muted)" },
        border: "var(--border)",
        ring: "var(--vermilion)",
      },
      borderRadius: {
        lg: "var(--r-lg)",
        md: "var(--r)",
        sm: "var(--r-sm)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [],
};
