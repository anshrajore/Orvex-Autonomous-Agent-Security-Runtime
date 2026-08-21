/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        panel: '#0A0A0A',
        line: '#1F1F1F',
        mute: '#8A8A8A',
        coral: '#FF5A3C',
        coraldim: '#C4452E',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        display: '-0.03em',
        micro: '0.16em',
      },
    },
  },
  plugins: [],
};
