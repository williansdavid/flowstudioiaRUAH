import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        // === BRAND ===
        brand: {
          50:  'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: 'var(--brand-300)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          800: 'var(--brand-800)',
          900: 'var(--brand-900)',
          DEFAULT: 'var(--brand-500)',
          fg: 'var(--brand-fg)',
        },

        // === SURFACES (LEGADO) ===
        surface: {
          DEFAULT: 'var(--surface)',
          muted:   'var(--surface-muted)',
          subtle:  'var(--surface-subtle)',
          dark:    'var(--surface-dark)',
        },

        // === FOREGROUND (LEGADO) ===
        fg: {
          DEFAULT: 'var(--fg)',
          muted:   'var(--fg-muted)',
        },

        // === BORDERS (LEGADO) ===
        line: {
          DEFAULT: 'var(--border)',
          strong:  'var(--border-strong)',
        },

        // === BACKGROUNDS HIERÁRQUICOS ===
        bg: {
          page:     'var(--bg-page)',
          card:     'var(--bg-card)',
          elevated: 'var(--bg-elevated)',
          subtle:   'var(--bg-subtle)',
          input:    'var(--bg-input)',
          hover:    'var(--bg-hover)',
        },

        // === TEXTO HIERÁRQUICO ===
        text: {
          strong:   'var(--fg-strong)',
          DEFAULT:  'var(--fg-default)',
          subtle:   'var(--fg-subtle)',
          disabled: 'var(--fg-disabled)',
        },

        // === BORDAS HIERÁRQUICAS ===
        border: {
          subtle:  'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          strong:  'var(--border-strong)',
          focus:   'var(--border-focus)',
        },

        // === ADMIN SIDEBAR ===
        sidebar: {
          DEFAULT:     'var(--sidebar-bg)',
          fg:          'var(--sidebar-fg)',
          'fg-muted':  'var(--sidebar-fg-muted)',
          border:      'var(--sidebar-border)',
          hover:       'var(--sidebar-hover)',
          'active-bg': 'var(--sidebar-active-bg)',
          'active-fg': 'var(--sidebar-active-fg)',
        },

        // === STATUS (calendar/appointments) ===
        status: {
          pending:   { DEFAULT: '#D97706', bg: '#FEF3C7' },
          confirmed: { DEFAULT: '#0E7490', bg: '#CFFAFE' },
          completed: { DEFAULT: '#15803D', bg: '#DCFCE7' },
          cancelled: { DEFAULT: '#B91C1C', bg: '#FEE2E2' },
          no_show:   { DEFAULT: '#475569', bg: '#E2E8F0' },
        },

        // === FEEDBACK ===
        feedback: {
          success: 'var(--success)',
          error:   'var(--danger)',
          warning: 'var(--warning)',
          info:    'var(--info)',
        },
      },

      ringColor: {
        DEFAULT: 'var(--ring)',
        strong:  'var(--ring-strong)',
        brand:   'var(--brand-500)',
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },

      fontSize: {
        xs:   ['var(--font-size-xs)',   { lineHeight: 'var(--line-height-normal)' }],
        sm:   ['var(--font-size-sm)',   { lineHeight: 'var(--line-height-normal)' }],
        base: ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
        lg:   ['var(--font-size-lg)',   { lineHeight: 'var(--line-height-snug)'   }],
        xl:   ['var(--font-size-xl)',   { lineHeight: 'var(--line-height-snug)'   }],
        '2xl':['var(--font-size-2xl)',  { lineHeight: 'var(--line-height-snug)'   }],
        '3xl':['var(--font-size-3xl)',  { lineHeight: 'var(--line-height-tight)'  }],
        '4xl':['var(--font-size-4xl)',  { lineHeight: 'var(--line-height-tight)'  }],
        '5xl':['var(--font-size-5xl)',  { lineHeight: 'var(--line-height-tight)'  }],
        '6xl':['var(--font-size-6xl)',  { lineHeight: 'var(--line-height-tight)'  }],
        '7xl':['var(--font-size-7xl)',  { lineHeight: 'var(--line-height-tight)'  }],
      },

      letterSpacing: {
        tighter: 'var(--tracking-tighter)',
        tight:   'var(--tracking-tight)',
        normal:  'var(--tracking-normal)',
        wide:    'var(--tracking-wide)',
        wider:   'var(--tracking-wider)',
      },

      borderRadius: {
        xs:    'var(--radius-xs)',
        sm:    'var(--radius-sm)',
        md:    'var(--radius-md)',
        lg:    'var(--radius-lg)',
        xl:    'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full:  'var(--radius-full)',
      },

      borderWidth: {
        hairline: 'var(--border-width-hairline)',
        thin:     'var(--border-width-thin)',
        thick:    'var(--border-width-thick)',
      },

      boxShadow: {
        // === Sistema semântico de elevação ===
        flat:      'var(--elevation-flat)',
        hairline:  'var(--elevation-hairline)',
        raised:    'var(--elevation-raised)',
        floating:  'var(--elevation-floating)',
        overlay:   'var(--elevation-overlay)',
        modal:     'var(--elevation-modal)',
        brand:     'var(--shadow-brand)',

        // === Aliases legado (retrocompat) ===
        card:         'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        elevated:     'var(--shadow-elevated)',
        gold:         'var(--shadow-gold)',
      },

      transitionTimingFunction: {
        'out-quart':   'var(--ease-out-quart)',
        'out-expo':    'var(--ease-out-expo)',
        'in-out-soft': 'var(--ease-in-out-soft)',
        spring:        'var(--ease-spring)',
      },

      transitionDuration: {
        fast:   '120ms',
        base:   '200ms',
        slow:   '320ms',
        spring: '420ms',
      },

      backdropBlur: {
        sm: 'var(--blur-sm)',
        md: 'var(--blur-md)',
        lg: 'var(--blur-lg)',
        xl: 'var(--blur-xl)',
      },

      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky:   'var(--z-sticky)',
        overlay:  'var(--z-overlay)',
        modal:    'var(--z-modal)',
        popover:  'var(--z-popover)',
        toast:    'var(--z-toast)',
        tooltip:  'var(--z-tooltip)',
      },
    },
  },
  plugins: [],
} satisfies Config;
