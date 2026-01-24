/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f1f4',
          100: '#c5dce3',
          200: '#9ec5d1',
          300: '#77aebf',
          400: '#5a9cb1',
          500: '#3d7e95', // Main primary color from website
          600: '#37768d',
          700: '#2f6b83',
          800: '#276179',
          900: '#1a4e68',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#f4645c', // Main accent color from website
          600: '#ef4444',
          700: '#dc2626',
          800: '#b91c1c',
          900: '#991b1b',
        },
        dark: {
          blue: '#1C2B40',
          orange: '#CC6B00',
        },
        orange: {
          gradient: {
            from: '#FFB34E', // rgb(255, 179, 78)
            to: '#F98602',   // rgb(249, 134, 2)
          },
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      borderRadius: {
        'button': '16px',
      },
    },
  },
  plugins: [],
}
