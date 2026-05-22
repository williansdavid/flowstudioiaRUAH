import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        // Cores white-label via CSS vars (injetadas no root via studio.config)
        brand: {
          DEFAULT: "var(--brand-primary)",
          fg: "var(--brand-fg)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
