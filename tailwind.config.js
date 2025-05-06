/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'title': ['TAN Pearl', 'Dream Avenue', 'serif'],
        'text': ['Glacial Indifference', 'Sorts Mill Goudy', 'sans-serif']
      },
      colors: {
        champagne: {
          DEFAULT: '#D6B88D', // Champagne Gold
          50: '#F8F5F0',
          100: '#F2ECE4',
          200: '#E8DDC9',
          300: '#E0CCAF',
          400: '#D6B88D', // Valor principal
          500: '#CAAC7C',
          600: '#BE9C69',
          700: '#A98651',
          800: '#8C6E43',
          900: '#6E5635',
        },
        offwhite: {
          DEFAULT: '#F8F6F3', // Off White
        },
        sand: {
          DEFAULT: '#E4D8C3', // Soft Sand
          50: '#FDFCFA',
          100: '#F9F6F1',
          200: '#F2EBE0',
          300: '#E4D8C3', // Valor principal
          400: '#D6C5A8',
          500: '#C8B28D',
          600: '#B79D71',
          700: '#9E8256',
          800: '#7C6543',
          900: '#5A4931',
        },
        rose: {
          DEFAULT: '#E9C8B9', // Rosé Blush
          50: '#FBF7F5',
          100: '#F7EEEA',
          200: '#F3E5DD',
          300: '#E9C8B9', // Valor principal
          400: '#DFB19E',
          500: '#D59A83',
          600: '#C77E61',
          700: '#B06245',
          800: '#8A4C36',
          900: '#653727',
        },
        black: {
          DEFAULT: '#000000', // Preto
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-from-bottom-10": {
          "0%": { transform: "translateY(10%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom-0": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(0)" },
        },
        "zoom-in-90": {
          "0%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        "animate-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "animate-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-in-out",
        "fade-out": "fade-out 0.2s ease-in-out",
        "slide-in-from-bottom": "slide-in-from-bottom-10 0.2s ease-in-out",
        "slide-in-from-bottom-0": "slide-in-from-bottom-0 0.2s ease-in-out",
        "zoom-in-90": "zoom-in-90 0.2s ease-in-out",
        "animate-in": "animate-in 0.2s ease-in-out",
        "animate-out": "animate-out 0.2s ease-in-out",
        "marquee": "marquee 20s linear infinite",
      },
    },
  },
  plugins: [],
} 