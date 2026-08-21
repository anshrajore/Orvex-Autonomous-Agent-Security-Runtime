/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: '#000000',
        surface: '#0A0A0A',
        panel: '#111111',
        card: '#161616',
        line: '#222222',
        subtle: '#2A2A2A',
        mute: '#8A8A8A',
        dim: '#555555',
        pure: '#FFFFFF',
      },
      fontFamily: {
        sans: ['"Inter"', '"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        display: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.04em',
        tightest: '-0.06em',
        micro: '0.18em',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '0.4' },
        },
      },
      boxShadow: {
        glow: '0 0 50px -10px rgba(255, 255, 255, 0.1)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
};
