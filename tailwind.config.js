/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  important: '#app',
  corePlugins: {
    preflight: false, // Avoid conflicts with Vuetify's base styles
  },
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0D1B2A', // Navy Dark
          light: '#1B263B',
        },
        secondary: {
          DEFAULT: '#1B263B', // Dark Blue
        },
        accent: {
          DEFAULT: '#D4AF37', // Gold
          light: '#E5C765',
          dark: '#B8941F',
        },
        gray: {
          DEFAULT: '#6C757D',
        },
        bg: {
          light: '#F5F7FA',
          dark: '#0D1B2A',
        },
        surface: {
          dark: '#1B263B',
        },
      },
      boxShadow: {
        soft: '0 4px 20px 0 rgba(13, 27, 42, 0.08)',
        'soft-lg': '0 10px 40px 0 rgba(13, 27, 42, 0.12)',
        gold: '0 4px 14px 0 rgba(212, 175, 55, 0.25)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
