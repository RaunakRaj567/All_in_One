/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'field-bg': '#F6F4EE',        // Primary warm linen/beige canvas
        'field-surface': '#EFECE3',   // Offset oat beige container
        'field-card': '#E5DFC9',      // Accent beige card background
        'loam': '#1C241B',            // Deep earthy organic black-green for text & crisp borders
        'loam-muted': '#4D554B',      // Secondary olive-gray text
        'sprout': {
          DEFAULT: '#35562B',         // Deep leaf foliage green
          hover: '#25401D',           // Darker green press state
          light: '#93BD85',           // Fresh sprout green accent
          tint: '#D8E5D3',            // Very soft green background highlight
          pale: '#F0F5EE',            // Subtle sprout wash
        },
        'soil': '#4A3B32',            // Loam brown accent
        'earth-red': '#B84A39',       // Critical disease / warning accent
        'earth-amber': '#C87D20',     // Moderate alert accent
        'earth-yellow': '#D4A836',    // Caution accent
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'Consolas', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '3px',
        'md': '6px',
        'lg': '12px',
        // Purposely omitting 2xl, 3xl, full cards as per "Kill the Card Reflex" instruction
      },
      boxShadow: {
        'sharp': '3px 3px 0px 0px #1C241B',
        'sharp-sm': '2px 2px 0px 0px #1C241B',
        'sharp-lg': '5px 5px 0px 0px #1C241B',
        'sharp-green': '3px 3px 0px 0px #35562B',
      }
    },
  },
  plugins: [],
}
