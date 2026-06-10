import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          bright: 'var(--color-accent-bright)',
        },
        bg: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          alt: 'var(--color-surface-alt)',
          2: 'var(--color-surface-2)',
          dark: 'var(--color-surface-dark)',
        },
        text: {
          heading: 'var(--color-text-heading)',
          body: 'var(--color-text-body)',
          muted: 'var(--color-text-muted)',
          'on-dark': 'var(--color-text-on-dark)',
          'on-dark-muted': 'var(--color-text-on-dark-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          accent: 'var(--color-border-accent)',
        },
        sidebar: {
          DEFAULT: 'var(--color-sidebar-bg)',
          text: 'var(--color-sidebar-text)',
          active: 'var(--color-sidebar-active)',
        },
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
      },

      fontFamily: {
        display: ['var(--font-display)'],
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },

      borderRadius: {
        card: 'var(--radius-card)',
        button: 'var(--radius-button)',
        pill: 'var(--radius-pill)',
      },

      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        accent: 'var(--shadow-accent)',
      },

      backgroundImage: {
        app: 'var(--gradient-app)',
      },
    },
  },
  plugins: [],
} satisfies Config;
