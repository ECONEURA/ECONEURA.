/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'econeura-blue': '#0066cc',
        'econeura-dark': '#1a1a2e',
        'econeura-accent': '#00d4ff',
      },
    },
  },
  plugins: [],
}
