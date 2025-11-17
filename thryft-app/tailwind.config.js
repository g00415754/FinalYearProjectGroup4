/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        thryftGreen: "#2e7d32",
        thryftPink: "#f7c4d9",
      },
    },
  },
  plugins: [],
};
