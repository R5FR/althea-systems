/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E5F4F4',
          100: '#B8E2E2',
          200: '#88CECE',
          300: '#55BABA',
          400: '#2DAAAA',
          500: '#009999',
          600: '#007A7C',
          700: '#005C5D',
          800: '#003F40',
          900: '#002323',
          DEFAULT: '#007A7C',
        },
        navy: {
          DEFAULT: '#1B2A4A',
          light:   '#243558',
          dark:    '#111E35',
        },
        cream: '#F7F6F3',
        accent: '#C8581A',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in':  'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':   'fadeIn 0.4s ease-out',
        'fade-up':   'fadeUp 0.5s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'shimmer':   'shimmer 1.8s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400% 0' },
          '100%': { backgroundPosition: '400% 0'  },
        },
      },
      letterSpacing: {
        widest2: '0.2em',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        'nav':        '0 1px 0 rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
