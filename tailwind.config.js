/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a1a1a',
        'dark-card': '#2d2d2d',
        'dark-text': '#e5e5e5',
      },
    },
  },
  plugins: [],
  variants: {
    extend: {
      backgroundColor: ['dark', 'dark-hover', 'hover', 'active'],
      textColor: ['dark', 'dark-hover'],
      borderColor: ['dark'],
      scale: ['hover', 'active'],
    },
  },
}
