/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#111',
        base: '#0d0d0d',
        border: '#1e1e1e',
        'border-hover': '#444',
        accent: {
          orange: '#ff6b35',
          teal: '#4ecdc4',
          purple: '#c3b1e1',
          green: '#a8e6cf',
          yellow: '#ffe66d',
          red: '#ff6b6b',
        },
      },
    },
  },
  plugins: [],
};
