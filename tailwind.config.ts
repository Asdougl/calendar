import { type Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

export default {
  content: ['./src/**/*.tsx', './src/utils/classnames.ts'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      animation: {
        'slow-fade-out': 'fade-out 2s ease-in-out 1s 1 normal forwards',
      },
      keyframes: {
        'fade-out': {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
