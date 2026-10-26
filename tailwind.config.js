/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nepalRed: '#DC143C',
        nepalBlue: '#003893',
      },
    },
  },
  plugins: [],
};
