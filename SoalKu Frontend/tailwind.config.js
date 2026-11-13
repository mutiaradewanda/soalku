/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          blush: "#F6E2E9",
          cream: "#FEFAF3",
          sage: {
            light: "#B8CFB3",
            DEFAULT: "#84A282",
            dark: "#6b8669",
          },
        },
        brand: {
          50: "#FEFAF3",
          100: "#F6E2E9",
          200: "#e5efea",
          300: "#cddfd5",
          400: "#B8CFB3",
          500: "#84A282",
          600: "#739071",
          700: "#60795e",
          800: "#4e634d",
          900: "#3d4e3c",
        },
      },
    },
  },
  plugins: [],
}
