/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'f1-red':    '#E8002D',
        'f1-dark':   '#0A0A0F',
        'f1-carbon': '#141418',
        'f1-panel':  '#1C1C22',
        'f1-silver': '#C0C0C8',
        'f1-gold':   '#FFD700',
        'f1-white':  '#F5F5F5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'carbon': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='2' height='2' fill='%23111114'/%3E%3Crect x='2' y='2' width='2' height='2' fill='%23111114'/%3E%3Crect x='2' width='2' height='2' fill='%23161619'/%3E%3Crect y='2' width='2' height='2' fill='%23161619'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'slide-up':  'slideUp 0.6s ease-out forwards',
        'fade-in':   'fadeIn 0.8s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseRed: {
          '0%,100%': { boxShadow: '0 0 20px rgba(232,0,45,0.4)' },
          '50%':     { boxShadow: '0 0 40px rgba(232,0,45,0.8)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
