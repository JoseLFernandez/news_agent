/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Source Sans 3', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        paper: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
        },
        ink: {
          900: '#1c1917',
          800: '#292524',
          700: '#44403c',
        },
        accent: {
          red: '#dc2626',
          blue: '#2563eb',
        },
      },
      gridTemplateColumns: {
        'news': 'repeat(6, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}
