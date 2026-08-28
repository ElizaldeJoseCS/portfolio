/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Every color resolves to a CSS custom property that the active world
      // theme rewrites at runtime (see src/lib/theme.ts). Components never
      // hardcode a world's palette.
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        surfaceAlt: 'rgb(var(--c-surface-alt) / <alpha-value>)',
        fg: 'rgb(var(--c-fg) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        accentAlt: 'rgb(var(--c-accent-alt) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        world: 'var(--radius-world)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--c-accent) / 0.25), 0 0 32px -8px rgb(var(--c-accent) / 0.55)',
      },
      screens: {
        xs: '360px',
      },
      keyframes: {
        blink: { '0%,49%': { opacity: '1' }, '50%,100%': { opacity: '0' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        blink: 'blink 1.06s steps(1) infinite',
        marquee: 'marquee 32s linear infinite',
      },
    },
  },
  plugins: [],
}
