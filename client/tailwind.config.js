/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f5e9ff',
          200: '#ebd1ff',
          300: '#dbb3ff',
          400: '#c794ff',
          500: '#9155FD',
          600: '#7c3ff0',
          700: '#6226ef',
          800: '#4d1bd6',
          900: '#3d15a8',
        },
        accent: {
          50: '#fff0fb',
          100: '#ffe0f7',
          200: '#fcc8f5',
          300: '#f9a6f2',
          400: '#f682ef',
          500: '#D333FF',
          600: '#c019f0',
          700: '#a012d0',
          800: '#800db0',
          900: '#660a99',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 15px rgba(0, 0, 0, 0.05)',
        medium: '0 10px 30px rgba(0, 0, 0, 0.1)',
        strong: '0 20px 50px rgba(0, 0, 0, 0.15)',
        glow: '0 0 20px rgba(145, 85, 253, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in-up': 'slideInUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}