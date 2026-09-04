import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        supabase: {
          primary: "#3ECF8E",
          "primary-dark": "#00482F",
          secondary: "#00A85A",
          tertiary: "#6DD9A8",
          muted: "#95E6B8",
          ink: "#001A10",
          surface: "#F8F3EF",
          "surface-highlight": "#A9F1CA",
          border: "rgba(0, 26, 16, 0.08)",
        },
        border: "rgba(0, 26, 16, 0.08)",
        input: "rgba(0, 26, 16, 0.08)",
        ring: "#3ECF8E",
        background: "#F8F3EF",
        foreground: "#001A10",
        primary: {
          DEFAULT: "#3ECF8E",
          foreground: "#001A10",
        },
        secondary: {
          DEFAULT: "#00A85A",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#EAE3DC",
          foreground: "#4D6B5F",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#001A10",
        },
      },
      borderRadius: {
        xs: "2px",
        sm: "6px",
        md: "8px",
        lg: "11px",
        xl: "12px",
        full: "9999px",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Noto Sans Devanagari",
          "sans-serif",
        ],
        mono: [
          "Space Mono",
          "JetBrains Mono",
          "Departure Mono",
          "monospace",
        ],
      },
      boxShadow: {
        none: "0 0 #0000",
        subtle: "0 1px 2px 0 rgba(0, 26, 16, 0.04)",
        overlay: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
