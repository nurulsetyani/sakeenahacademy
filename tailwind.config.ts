import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // brand/gold/parchment are kept as separate Tailwind scale names so no
        // dashboard markup (guru/murid/admin, ~40 pages) needs to change, but
        // their values now point at the same ink/ember v2 palette as the public
        // pages — this is how the redesign reaches the dashboard without a
        // per-file rewrite. brand mirrors ink (primary/dark), gold mirrors ember
        // (accent), parchment mirrors ink (neutral text/background/border).
        brand: {
          50: "#F7F7F8",
          100: "#EEEEF0",
          200: "#DEDEE3",
          300: "#C4C4CC",
          400: "#9C9CA8",
          500: "#71717E",
          600: "#52525F",
          700: "#3A3A45",
          800: "#212128",
          900: "#121216",
          950: "#08080A",
        },
        gold: {
          50: "#FFF3EC",
          100: "#FFE1D0",
          200: "#FFC1A1",
          300: "#FF9A6B",
          400: "#FF7A42",
          500: "#F2591E",
          600: "#D6430F",
          700: "#B1330C",
          800: "#8A280D",
          900: "#6B210E",
        },
        parchment: {
          50: "#F7F7F8",
          100: "#EEEEF0",
          200: "#DEDEE3",
          300: "#C4C4CC",
          400: "#9C9CA8",
          500: "#71717E",
          600: "#52525F",
          700: "#3A3A45",
          800: "#212128",
          900: "#121216",
        },
        ink: {
          50: "#F7F7F8",
          100: "#EEEEF0",
          200: "#DEDEE3",
          300: "#C4C4CC",
          400: "#9C9CA8",
          500: "#71717E",
          600: "#52525F",
          700: "#3A3A45",
          800: "#212128",
          900: "#121216",
          950: "#08080A",
        },
        ember: {
          50: "#FFF3EC",
          100: "#FFE1D0",
          200: "#FFC1A1",
          300: "#FF9A6B",
          400: "#FF7A42",
          500: "#F2591E",
          600: "#D6430F",
          700: "#B1330C",
          800: "#8A280D",
          900: "#6B210E",
        },
        // Dedicated semantic "positive/active" color — brand and parchment now
        // share the same neutral ink values, so status badges that used to pair
        // bg-brand-50/text-brand-700 (active) against bg-parchment-200 (inactive)
        // need their own hue to stay visually distinguishable.
        success: {
          50: "#EDFCF4",
          100: "#D3F8E4",
          200: "#A6F0C7",
          300: "#6FE0A8",
          400: "#3FCB88",
          500: "#1EA968",
          600: "#128754",
          700: "#0E6C44",
          800: "#0C5636",
          900: "#0A4029",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px -1px rgba(18, 18, 22, 0.12), 0 4px 12px -4px rgba(18, 18, 22, 0.10)",
        raised: "0 4px 8px -2px rgba(18, 18, 22, 0.16), 0 12px 24px -8px rgba(18, 18, 22, 0.14)",
        floating: "0 8px 16px -4px rgba(18, 18, 22, 0.20), 0 24px 48px -12px rgba(18, 18, 22, 0.22)",
        gold: "0 4px 14px -2px rgba(255, 122, 66, 0.35)",
        // v2
        "ink-soft": "0 1px 2px -1px rgba(8, 8, 10, 0.06), 0 4px 16px -4px rgba(8, 8, 10, 0.08)",
        "ink-raised": "0 6px 16px -4px rgba(8, 8, 10, 0.10), 0 16px 40px -12px rgba(8, 8, 10, 0.14)",
        "ember-glow": "0 8px 24px -6px rgba(242, 89, 30, 0.45), 0 2px 8px -2px rgba(242, 89, 30, 0.3)",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
