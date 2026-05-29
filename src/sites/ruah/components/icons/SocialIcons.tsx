/**
 * Social Icons — Logos oficiais das redes sociais
 * ----------------------------------------------------------------
 * SVGs inline com cores oficiais de cada marca.
 * Usados no Footer e onde mais for necessário.
 * ----------------------------------------------------------------
 */

import type { SVGProps } from 'react'

/* ═══════════════════ INSTAGRAM (gradient oficial) ═══════════════════ */
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient id="ruah-ig-gradient" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#FDF497" />
          <stop offset="5%" stopColor="#FDF497" />
          <stop offset="45%" stopColor="#FD5949" />
          <stop offset="60%" stopColor="#D6249F" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ruah-ig-gradient)" />
      <path
        d="M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 7.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
        fill="white"
      />
      <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
    </svg>
  )
}

/* ═══════════════════ FACEBOOK (azul oficial) ═══════════════════ */
export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M24 12a12 12 0 1 0-13.875 11.854V15.469H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.313 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385A12.003 12.003 0 0 0 24 12z"
        fill="#1877F2"
      />
      <path
        d="M16.671 15.469 17.203 12h-3.328V9.749c0-.949.465-1.874 1.956-1.874h1.513V4.922s-1.373-.234-2.686-.234c-2.741 0-4.533 1.661-4.533 4.668V12H7.078v3.469h3.047v8.385a12.07 12.07 0 0 0 3.75 0v-8.385h2.796z"
        fill="white"
      />
    </svg>
  )
}

/* ═══════════════════ GOOGLE BUSINESS (G oficial multicolor) ═══════════════════ */
export function GoogleBusinessIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  )
}
