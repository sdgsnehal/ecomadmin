/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5542F6",
        highlight: "#EAE8F8",
        bgGray: "#fbfafd",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
