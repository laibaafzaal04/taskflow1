/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Optional: add a secondary font if you want headings different
        // heading: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}