/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vs: "#7e501e",
        vsl: "#ad7639",
        vsd: "#4f3110",
        "zinc-750": "#313136",
        "zinc-850": "#212122"
      },
      backgroundImage: {
        "image-vs": "url('./assets/background.jpg')"
      },
      boxShadow: {
        "inner-sm": "inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        inner: "inset 0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "inner-md": "inset 0 6px 10px -1px rgba(0, 0, 0, 0.1), inset 0 4px 6px -1px rgba(0, 0, 0, 0.06)",
        "inner-lg": "inset 0 10px 15px -3px rgba(0, 0, 0, 0.1), inset 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "inner-xl": "inset 0 20px 25px -5px rgba(0, 0, 0, 0.1), inset 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "inner-2xl": "inset 0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }
    }
  },

  plugins: []
}
