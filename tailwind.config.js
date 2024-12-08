/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        axiom: {
          50: '#fdf2f6',
          100: '#fce7ef',
          200: '#fac5d8',
          300: '#f69ab7',
          400: '#f06493',
          500: '#8B1D41', // Axiomtek primary burgundy color
          600: '#7d1a3b',
          700: '#681631',
          800: '#541228',
          900: '#440e20',
        },
      },
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
    },
  },
  plugins: [],
};