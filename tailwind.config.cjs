module.exports = {
  content: ['./src/**/*.{html,ts,css,scss}'],
  theme: {
    extend: {
      colors: {
        // Sunset palette mapped to CSS variables defined in src/styles.css
        sunset: {
          50: 'var(--sun-50)',
          100: 'var(--sun-100)',
          200: 'var(--sun-200)',
          300: 'var(--sun-300)',
          400: 'var(--sun-400)',
          500: 'var(--sun-500)',
          600: 'var(--sun-600)',
          700: 'var(--sun-700)',
          800: 'var(--sun-800)',
          900: 'var(--sun-900)',
        },
      },
    },
  },
  plugins: [],
};
