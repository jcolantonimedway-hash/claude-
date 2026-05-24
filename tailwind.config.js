/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        parchment: {
          50:  '#FDFAF3',
          100: '#F9F1DC',
          200: '#F4E8C1',
          300: '#EDD99A',
          400: '#E4C76B',
          500: '#D4A843',
          DEFAULT: '#F4ECD8',
        },
        navy: {
          50:  '#E8EDF5',
          100: '#C6D0E5',
          200: '#8DA3CB',
          300: '#5476B0',
          400: '#2B4E96',
          500: '#1B2A4A',
          600: '#132040',
          700: '#0D1630',
          800: '#080E20',
          DEFAULT: '#1B2A4A',
        },
        gold: {
          light: '#E8C96B',
          DEFAULT: '#C4A43A',
          dark: '#8B7020',
        },
        crimson: {
          light: '#D45555',
          DEFAULT: '#8B1A1A',
          dark: '#5C0E0E',
        },
        forest: {
          light: '#4A8A2E',
          DEFAULT: '#2D5A1B',
          dark: '#1A3A0E',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Crimson Text"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'parchment-texture': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'parchment': '0 4px 20px rgba(27, 42, 74, 0.15), 0 1px 4px rgba(27, 42, 74, 0.1)',
        'parchment-lg': '0 8px 40px rgba(27, 42, 74, 0.2), 0 2px 8px rgba(27, 42, 74, 0.12)',
        'marker': '0 3px 10px rgba(0,0,0,0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'march': 'march 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        march: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
