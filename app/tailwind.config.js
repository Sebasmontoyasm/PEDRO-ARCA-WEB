/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 👈 activa dark mode con la clase .dark
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
