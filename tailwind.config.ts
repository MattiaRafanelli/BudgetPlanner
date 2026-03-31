import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0F1117',
        surface: '#1A1D27',
        elevated: '#222534',
        border: '#2E3146',
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
        'text-muted': '#475569',
        'accent-primary': '#6C63FF',
        'accent-green': '#22C55E',
        'accent-red': '#EF4444',
        'accent-amber': '#F59E0B',
        'accent-blue': '#3B82F6',
        'accent-teal': '#14B8A6',
        'accent-orange': '#F97316',
        'accent-pink': '#EC4899',
        'accent-purple': '#A855F7',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config
