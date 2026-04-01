/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#16a34a', light: '#22c55e', dark: '#15803d' },
        accent:  { DEFAULT: '#f97316', light: '#fb923c' }
      }
    }
  },
  plugins: []
}
