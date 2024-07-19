/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'offset': '-4px 4px 2px 0 rgba(0, 0, 0, 0.1)', // Adjust the offset as needed
      },
    },
  },
  plugins: [],
}
