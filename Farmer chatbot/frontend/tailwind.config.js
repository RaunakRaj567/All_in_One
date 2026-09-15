/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          bg: '#F6F4EE',
          canvas: '#EFECE4',
          cream: '#FAF8F3',
          border: '#D8D1C5',
          'border-dark': '#A8A090',
          dark: '#1C251B',
          olive: '#2D4A27',
          sage: '#6E8B62',
          'sage-light': '#DCE6D8',
          ochre: '#C26D38',
          muted: '#546350',
          amber: '#D97706',
        }
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

