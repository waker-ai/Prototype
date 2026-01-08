export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neo-yellow': '#FBbf24',
        'neo-lime': '#ccff00',
        'neo-pink': '#ff00ff',
        'neo-black': '#000000',
        'neo-white': '#ffffff',
      },
      boxShadow: {
        'neo': '5px 5px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo-lg': '8px 8px 0px 0px #000000',
      },
      fontFamily: {
        'display': ['Impact', 'Arial Black', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
