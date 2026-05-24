/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#030609',
          900: '#070B14',
          800: '#0D1520',
          700: '#111C2C',
          600: '#162338',
          500: '#1B2A4A',
          400: '#243560',
          300: '#2E4380',
          200: '#3D5A9A',
        },
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#F5D060',
          400: '#E8C96B',
          500: '#C4A43A',
          600: '#A8882A',
          700: '#8B6C1A',
          800: '#6E5210',
          DEFAULT: '#C4A43A',
        },
        parchment: {
          50:  '#FDFAF3',
          100: '#F9F1DC',
          200: '#F4ECD8',
          300: '#E8DBC0',
          400: '#D4C49A',
          500: '#B8A47A',
          DEFAULT: '#F4ECD8',
        },
        patriot: {
          light: '#5CB842',
          DEFAULT: '#2D7A1A',
          dark: '#1A4F0E',
          glow: 'rgba(45, 122, 26, 0.6)',
        },
        redcoat: {
          light: '#D44444',
          DEFAULT: '#9B1515',
          dark: '#650D0D',
          glow: 'rgba(155, 21, 21, 0.6)',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Crimson Text"', 'Georgia', 'serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'radial-gold': 'radial-gradient(ellipse at center, rgba(196,164,58,0.15) 0%, transparent 70%)',
        'glass-panel': 'linear-gradient(135deg, rgba(13,21,32,0.90) 0%, rgba(7,11,20,0.95) 100%)',
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(196,164,58,0.25)',
        'gold-md': '0 0 24px rgba(196,164,58,0.35)',
        'gold-lg': '0 0 48px rgba(196,164,58,0.3)',
        'panel': '0 8px 48px rgba(0,0,0,0.7), 0 1px 0 rgba(196,164,58,0.1)',
        'panel-lg': '0 24px 80px rgba(0,0,0,0.8), 0 1px 0 rgba(196,164,58,0.15)',
        'inset-gold': 'inset 0 1px 0 rgba(196,164,58,0.15)',
        'marker': '0 0 20px rgba(196,164,58,0.5), 0 4px 16px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'slide-left': 'slideLeft 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'slide-right': 'slideRight 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'marker-ping': 'markerPing 2s cubic-bezier(0,0,0.2,1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'intro-title': 'introTitle 1.2s cubic-bezier(0.22,1,0.36,1) both',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          from: { opacity: '0', transform: 'translateX(48px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-48px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%,100%': { opacity: '0.5', transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        markerPing: {
          '75%,100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        introTitle: {
          from: {
            opacity: '0',
            transform: 'translateY(32px) scaleY(0.95)',
            letterSpacing: '0.4em',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0) scaleY(1)',
            letterSpacing: 'normal',
          },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
