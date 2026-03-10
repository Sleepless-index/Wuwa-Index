/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // These map to CSS variables defined in globals.css.
        // Both themes share the same class names — the variables swap on .dark.
        bg:       'var(--bg)',
        surface:  'var(--surface)',
        surface2: 'var(--surface2)',
        border:   'var(--border)',
        accent:   'var(--accent)',
        text:     'var(--text)',
        subtext:  'var(--subtext)',
        muted:    'var(--muted)',
        got:      'var(--got)',
        sig:      'var(--sig)',
        wish:     'var(--wish)',
        upcoming: 'var(--upcoming)',
        spectro:  'var(--spectro)',
        aero:     'var(--aero)',
        glacio:   'var(--glacio)',
        fusion:   'var(--fusion)',
        electro:  'var(--electro)',
        havoc:    'var(--havoc)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
