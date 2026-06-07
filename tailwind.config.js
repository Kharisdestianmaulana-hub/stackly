/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': 'var(--color-primary)',
        'electric-blue': 'var(--color-electric)',
        'teal': '#059669',
        'success': '#238636',
        'warning': '#D78229',
        'danger': '#DA3633',
        'app-bg': '#121212',
        'sidebar': '#181818',
        'topbar': '#181818',
        'card': '#1E1E1E',
        'card-elevated': '#252526',
        'input': '#2D2D2D',
        'log-bg': '#0A0A0A',
        'border-soft': '#333333',
        'border-strong': '#444444',
        'text-primary': '#CCCCCC',
        'text-secondary': '#969696',
        'text-muted': '#6B6B6B',
        'text-disabled': '#4D4D4D',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        none: '0px',
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px',
      },
      boxShadow: {
        'glow-blue': '0 0 15px -3px var(--color-primary), 0 0 6px -2px var(--color-electric)',
        'glow-green': '0 0 15px -3px rgba(35, 134, 54, 0.6)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
