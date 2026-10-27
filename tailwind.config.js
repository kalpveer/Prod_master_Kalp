export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E1E0CC',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

