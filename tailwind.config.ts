import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EAF4F0",
          100: "#CCE5DB",
          200: "#9FCDB9",
          300: "#6BB096",
          400: "#3F9078",
          500: "#227258",
          600: "#145C46",
          700: "#0F4837",
          800: "#0B382A",
          900: "#082A20",
          950: "#051A14",
        },
        gold: {
          50: "#FBF3E1",
          100: "#F5E3BC",
          200: "#EBCB87",
          300: "#DFB158",
          400: "#CC9A3E",
          500: "#B1832F",
          600: "#8F6924",
          700: "#6E501C",
          800: "#4F3914",
          900: "#33240D",
        },
        parchment: {
          50: "#FDFAF3",
          100: "#F8F1E2",
          200: "#EFE3CB",
          300: "#DDCBA6",
          400: "#B9A87E",
          500: "#8F7C5C",
          600: "#6B5D44",
          700: "#4C4231",
          800: "#322B20",
          900: "#1C1712",
        },
        // v2 design system (public pages redesign) — additive, does not replace
        // brand/gold/parchment which the dashboard still relies on.
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
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px -1px rgba(11, 56, 42, 0.12), 0 4px 12px -4px rgba(11, 56, 42, 0.10)",
        raised: "0 4px 8px -2px rgba(11, 56, 42, 0.16), 0 12px 24px -8px rgba(11, 56, 42, 0.14)",
        floating: "0 8px 16px -4px rgba(11, 56, 42, 0.20), 0 24px 48px -12px rgba(11, 56, 42, 0.22)",
        gold: "0 4px 14px -2px rgba(204, 154, 62, 0.35)",
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
