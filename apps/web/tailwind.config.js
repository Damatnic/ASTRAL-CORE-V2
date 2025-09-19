/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}',
    './src/pages/**/*.{js,jsx,ts,tsx,mdx}',
    './src/components/**/*.{js,jsx,ts,tsx,mdx}',
    './src/app/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Crisis intervention color palette
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#059669', // Main primary
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        crisis: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', // Main crisis red
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0f766e', // Main secondary
          700: '#0f5f56',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-crisis': 'pulseCrisis 2s infinite',
        'blob': 'blob 7s infinite',
        'blob-slow': 'blob 10s infinite',
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'morph': 'morph 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glitch': 'glitch 0.5s infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseCrisis: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.7)' 
          },
          '70%': { 
            boxShadow: '0 0 0 10px rgba(220, 38, 38, 0)' 
          },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        gradientShift: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%' 
          },
          '50%': { 
            backgroundPosition: '100% 50%' 
          },
        },
        morph: {
          '0%, 100%': { 
            borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' 
          },
          '50%': { 
            borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' 
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glitch: {
          '0%, 100%': { 
            transform: 'translate(0)' 
          },
          '20%': { 
            transform: 'translate(-2px, 2px)' 
          },
          '40%': { 
            transform: 'translate(-2px, -2px)' 
          },
          '60%': { 
            transform: 'translate(2px, 2px)' 
          },
          '80%': { 
            transform: 'translate(2px, -2px)' 
          },
        },
        neonPulse: {
          '0%': { 
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor' 
          },
          '100%': { 
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' 
          },
        },
      },
      animationDelay: {
        '2000': '2000ms',
        '4000': '4000ms', 
        '6000': '6000ms',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Custom plugin for glassmorphism and neon effects
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
        '.glass-heavy': {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        },
        '.glass-mixed': {
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '18px',
          boxShadow: '0 10px 35px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        },
        '.neon-purple': {
          color: '#a855f7',
          textShadow: '0 0 10px #a855f7, 0 0 20px #a855f7, 0 0 30px #a855f7',
          filter: 'drop-shadow(0 0 10px #a855f7)',
        },
        '.neon-blue': {
          color: '#3b82f6',
          textShadow: '0 0 10px #3b82f6, 0 0 20px #3b82f6, 0 0 30px #3b82f6',
          filter: 'drop-shadow(0 0 10px #3b82f6)',
        },
        '.neon-pink': {
          color: '#ec4899',
          textShadow: '0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899',
          filter: 'drop-shadow(0 0 10px #ec4899)',
        },
        '.gradient-mesh': {
          background: 'linear-gradient(45deg, #a855f7, #3b82f6, #ec4899, #f59e0b)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease-in-out infinite',
        },
        '.holographic': {
          background: 'linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #ff0080)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 3s ease-in-out infinite',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        '.animation-delay-2000': {
          animationDelay: '2000ms',
        },
        '.animation-delay-4000': {
          animationDelay: '4000ms',
        },
        '.animation-delay-6000': {
          animationDelay: '6000ms',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}