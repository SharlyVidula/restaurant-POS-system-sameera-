/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ceylon: {
          50: '#fff8f0',
          100: '#ffefdb',
          200: '#ffdcb3',
          300: '#ffbf80',
          400: '#f99540',
          500: '#e66d15',
          600: '#cc4d09',
          700: '#a3330b',
          800: '#842911',
          900: '#6d2311',
          950: '#3e0f06',
        },
        spice: {
          cardamom: '#2D5A27',
          cinnamon: '#8B4513',
          turmeric: '#E59B0F',
          clove: '#4A2E18',
          curry: '#C25E00',
        },
        pos: {
          bg: '#0F172A',
          card: '#1E293B',
          cardHover: '#334155',
          panel: '#0B1120',
          accent: '#F59E0B',
          success: '#10B981',
          danger: '#EF4444',
          info: '#3B82F6',
          border: '#334155',
          textMuted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.3)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'receipt': '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      keyframes: {
        printSlip: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseDrawer: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)', filter: 'brightness(1.2)' },
        }
      },
      animation: {
        'print-slip': 'printSlip 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-drawer': 'pulseDrawer 0.4s ease-in-out',
      }
    },
  },
  plugins: [],
}
