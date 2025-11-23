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
        gold: {
          400: '#F2C94C',
          500: '#E5B93B',
          600: '#CFA22E',
          700: '#B98C20',
        },
        yellow: {
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
        },
        black: {
          900: '#000000',
          800: '#0A0A0A',
        },
        gray: {
          800: '#1A1A1A',
          700: '#2A2A2A',
          600: '#3F3F3F',
          400: '#A3A3A3',
          200: '#E5E5E5',
        },
        status: {
          success: '#22C55E',
          info: '#3B82F6',
          warning: '#EAB308',
          danger: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      backgroundImage: {
        'cyber-gold': 'linear-gradient(135deg, #000000 0%, #0A0A0A 30%, #2A2A2A 60%, #E5B93B 100%)',
        'gold-beam': 'linear-gradient(90deg, #CFA22E 0%, #E5B93B 40%, #F2C94C 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(229,185,59,0.4)',
        'yellow-inner': 'inset 0 0 20px rgba(250,204,21,0.2)',
      },
    },
  },
  plugins: [],
}
