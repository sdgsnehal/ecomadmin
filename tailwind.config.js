/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Scan all files in app/ directory
    "./pages/**/*.{js,ts,jsx,tsx}", // Scan all files in pages/
    "./components/**/*.{js,ts,jsx,tsx}", // If you have a components folder
  ],
  theme: {
    extend: {
        colors:{
            primary:"#5542F6",
            highlight:"#EAE8F8",
            bgGray:"#fbfafd"
        }
    },
  },
  plugins: [],
};
