/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        vinho: {
          50: '#fbf3f5',
          100: '#f5e3e8',
          200: '#ebc5cf',
          300: '#d995a7',
          400: '#c2627d',
          500: '#9e2a4b',
          600: '#7b1e3a',
          700: '#5a1427',
          800: '#3d0f1e',
          900: '#2a0a14',
          950: '#17050b',
        },
        ouro: {
          300: '#e8d08a',
          400: '#d9b440',
          500: '#c9a227',
          600: '#a6841c',
        },
        creme: '#f8f4ef',
        papel: '#fffdfa',
        tinta: '#1f1a1c',
        'tinta-2': '#6b6166',
      },
    },
  },
  plugins: [],
}
