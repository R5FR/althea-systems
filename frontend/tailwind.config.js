/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E6F8FA',
          100: '#D4F4F7',  /* Backgrounds (charte) */
          200: '#A9E9EE',
          300: '#33BFC9',  /* Hover states (charte) */
          400: '#1AB3BE',
          500: '#00A8B5',  /* CTA, liens, badges (charte) */
          600: '#0094A0',
          700: '#007A85',
          800: '#005D66',
          900: '#003D47',
          DEFAULT: '#00A8B5',
        },
        navy: {
          DEFAULT: '#003D5C',  /* Titres, navigation, footer (charte) */
          light:   '#004D74',
          dark:    '#002940',
        },
        success: '#10B981',   /* Disponibilité (charte) */
        danger:  '#EF4444',   /* Erreurs (charte) */
        warning: '#F59E0B',   /* Alerte (charte) */
        cream: '#F0FAFB',
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
