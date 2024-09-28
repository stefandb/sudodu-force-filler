/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "edu-dots": ['Edu AU VIC WA NT Dots', 'sans-serif']
      }
    },
  },
  plugins: [],
}

