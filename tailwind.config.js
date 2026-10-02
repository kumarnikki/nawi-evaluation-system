/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: ['border-3'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8edf3',
          100: '#c5d0de',
          200: '#9fb0c7',
          300: '#7890b0',
          400: '#587a9e',
          500: '#3a658c',
          600: '#2d5070',
          700: '#1e3a56',
          800: '#12273c',
          900: '#0d2137',
          950: '#071425',
        },
        saffron: {
          50: '#fff8f0',
          100: '#ffeccc',
          200: '#ffd799',
          300: '#ffbc5c',
          400: '#ff9f33',
          500: '#FF9933',
          600: '#e67a00',
          700: '#c06200',
          800: '#9a4d00',
          900: '#7a3d00',
        },
        ashoka: '#138808',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
