/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFF9E5',
          100: '#FFF2CC',
          200: '#FFE699',
          300: '#FFD966',
          400: '#FFCC33',
          500: '#D4AF37', // Dourado clássico
          600: '#BF9B30',
          700: '#A67F00',
          800: '#805C00',
          900: '#5A4000',
        },
      },
    },
  },
  plugins: [],
} 